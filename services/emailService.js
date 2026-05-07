/**
 * services/emailService.js
 * Email delivery service using Nodemailer (SMTP).
 *
 * Setup: Add these to .env.local
 *   EMAIL_HOST=smtp.gmail.com
 *   EMAIL_PORT=587
 *   EMAIL_USER=you@gmail.com
 *   EMAIL_PASS=your-app-password
 *   EMAIL_FROM="Ultimate Spare Parts <orders@ultimatesparepartss.com>"
 *   ADMIN_EMAIL=admin@yoursite.com
 */

import nodemailer from 'nodemailer'
import {
  adminNewOrderTemplate,
  customerOrderConfirmTemplate,
  customerShippedTemplate,
  adminStatusChangeTemplate,
} from '@/utils/emailTemplates'

// Singleton transporter
let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter
  if (!process.env.EMAIL_USER) {
    console.warn('[EmailService] No SMTP credentials configured.')
    return null
  }
  _transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
  return _transporter
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter()
  if (!transporter) {
    console.log(`[EmailService] SKIP — would send to: ${to} | ${subject}`)
    return { skipped: true }
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Ultimate Spare Parts" <${process.env.EMAIL_USER}>`,
      to, subject, html, text,
    })
    console.log(`[EmailService] Sent to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error(`[EmailService] Failed → ${to}:`, err.message)
    return { success: false, error: err.message }
  }
}

export async function sendAdminOrderNotification(order) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return console.warn('[EmailService] ADMIN_EMAIL not set.')
  const { subject, html, text } = adminNewOrderTemplate(order)
  return sendEmail({ to: adminEmail, subject, html, text })
}

export async function sendCustomerOrderConfirmation(order) {
  const to = order.email || order.shipping_address?.email
  if (!to) return console.warn(`[EmailService] No customer email for order ${order.id}`)
  const { subject, html, text } = customerOrderConfirmTemplate(order)
  return sendEmail({ to, subject, html, text })
}

export async function sendCustomerShippedNotification(order, trackingNumber = null) {
  const to = order.email || order.shipping_address?.email
  if (!to) return
  const { subject, html, text } = customerShippedTemplate(order, trackingNumber)
  return sendEmail({ to, subject, html, text })
}

export async function sendAdminStatusChangeAlert(order, oldStatus, newStatus) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return
  const significantChanges = ['shipped', 'delivered', 'cancelled', 'refunded']
  if (!significantChanges.includes(newStatus)) return
  const { subject, html, text } = adminStatusChangeTemplate(order, oldStatus, newStatus)
  return sendEmail({ to: adminEmail, subject, html, text })
}

// Main entry: send both admin + customer emails after payment
export async function sendOrderPaidEmails(order) {
  const results = await Promise.allSettled([
    sendAdminOrderNotification(order),
    sendCustomerOrderConfirmation(order),
  ])
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[EmailService] Email ${i} failed:`, r.reason)
  })
  return results
}
