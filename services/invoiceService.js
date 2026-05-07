/**
 * services/invoiceService.js
 * PDF invoice generation using pdfkit (server-side only).
 * Returns a Buffer that can be streamed in an API route.
 */

import PDFDocument from 'pdfkit'
import { formatPrice, formatDate, formatOrderId } from '@/utils/formatters'

// ─── Colour palette ───────────────────────────────────────────
const COLOR_ORANGE  = '#f97316'
const COLOR_DARK    = '#0f0f0f'
const COLOR_GRAY    = '#6b7280'
const COLOR_LIGHT   = '#f3f4f6'
const COLOR_TEXT    = '#1a1a1a'

// ─── Helper: draw a horizontal rule ──────────────────────────
function drawRule(doc, y, color = '#e5e7eb') {
  doc.strokeColor(color).lineWidth(0.5).moveTo(50, y).lineTo(545, y).stroke()
}

// ─── Helper: label + value pair ──────────────────────────────
function labelValue(doc, label, value, x, y, labelWidth = 100) {
  doc.fontSize(9).fillColor(COLOR_GRAY).text(label, x, y)
  doc.fontSize(10).fillColor(COLOR_TEXT).font('Helvetica-Bold').text(value, x + labelWidth, y)
  doc.font('Helvetica')
}

// ─── Core invoice generator ───────────────────────────────────
export function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end',  ()    => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const addr = order.shipping_address || {}
    const fullName = order.full_name
      || `${addr.firstName || ''} ${addr.lastName || ''}`.trim()
      || 'Guest Customer'
    const email    = order.email   || addr.email   || '—'
    const phone    = order.phone   || addr.phone   || '—'
    const street   = order.address || addr.address || '—'
    const city     = order.city    || addr.city    || '—'
    const state    = addr.state    || ''
    const zip      = addr.zip      || ''
    const country  = addr.country  || ''
    const orderId  = formatOrderId(order.id)
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://ultimatesparepartss.com'

    // ── Header bar ───────────────────────────────────────────
    doc.rect(0, 0, 595, 90).fill(COLOR_DARK)

    // Brand
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#ffffff')
      .text('ULTIMATE SPARE PARTS', 50, 28)
    doc.fontSize(9).font('Helvetica').fillColor('#a3a3a3')
      .text('Premium Automotive Components', 50, 55)

    // Invoice label
    doc.fontSize(28).font('Helvetica-Bold').fillColor(COLOR_ORANGE)
      .text('INVOICE', 400, 28, { align: 'right', width: 145 })
    doc.fontSize(10).font('Helvetica').fillColor('#a3a3a3')
      .text(orderId, 400, 62, { align: 'right', width: 145 })

    let y = 115

    // ── Order meta row ───────────────────────────────────────
    doc.rect(50, y - 10, 495, 44).fill(COLOR_LIGHT)
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_GRAY)
    doc.text('INVOICE DATE', 65, y - 4)
    doc.text('PAYMENT STATUS', 210, y - 4)
    doc.text('ORDER STATUS', 370, y - 4)

    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_TEXT)
    doc.text(formatDate(order.created_at), 65, y + 10)

    // Status badge colour
    const statusColors = {
      paid: '#16a34a', pending: '#d97706', shipped: '#2563eb',
      delivered: '#7c3aed', cancelled: '#dc2626', refunded: '#6b7280',
    }
    const badgeColor = statusColors[order.status] || COLOR_GRAY
    doc.fillColor(badgeColor).text((order.status || 'pending').toUpperCase(), 210, y + 10)
    doc.fillColor(COLOR_TEXT).text((order.status || 'pending').toUpperCase(), 370, y + 10)

    y += 55

    // ── Two-column: customer info + shipping ──────────────────
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_ORANGE)
    doc.text('BILL TO', 50, y)
    doc.text('SHIP TO', 310, y)

    y += 14
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_TEXT)
    doc.text(fullName, 50, y)
    doc.text(fullName, 310, y)

    doc.font('Helvetica').fontSize(10).fillColor(COLOR_GRAY)
    doc.text(email,  50,  y + 15)
    doc.text(phone,  50,  y + 29)
    doc.text(street, 310, y + 15)
    doc.text(`${city}${state ? ', ' + state : ''} ${zip}`, 310, y + 29)
    doc.text(country, 310, y + 43)

    y += 75
    drawRule(doc, y)
    y += 14

    // ── Items table header ────────────────────────────────────
    doc.rect(50, y, 495, 24).fill('#1a1a1a')
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
    doc.text('PRODUCT', 60, y + 7)
    doc.text('QTY', 330, y + 7, { width: 50, align: 'center' })
    doc.text('UNIT PRICE', 385, y + 7, { width: 80, align: 'right' })
    doc.text('TOTAL', 470, y + 7, { width: 70, align: 'right' })
    y += 24

    // ── Items rows ────────────────────────────────────────────
    const items = order.items || []
    items.forEach((item, i) => {
      const rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa'
      doc.rect(50, y, 495, 28).fill(rowBg)

      doc.font('Helvetica').fontSize(10).fillColor(COLOR_TEXT)
      doc.text(item.name || '—', 60, y + 8, { width: 265, ellipsis: true })
      doc.text(String(item.quantity), 330, y + 8, { width: 50, align: 'center' })
      doc.text(formatPrice(item.price || 0), 385, y + 8, { width: 80, align: 'right' })

      doc.font('Helvetica-Bold').fillColor(COLOR_TEXT)
      doc.text(formatPrice((item.price || 0) * (item.quantity || 1)), 470, y + 8, { width: 70, align: 'right' })

      y += 28
    })

    // ── Totals section ────────────────────────────────────────
    drawRule(doc, y + 4)
    y += 20

    const totals = [
      { label: 'Subtotal',         value: formatPrice(order.subtotal || 0) },
      { label: `Shipping (${order.shipping_option || 'standard'})`, value: order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost || 0) },
      { label: 'Tax (8%)',          value: formatPrice(order.tax || 0) },
    ]

    totals.forEach(({ label, value }) => {
      doc.font('Helvetica').fontSize(10).fillColor(COLOR_GRAY)
        .text(label, 350, y, { width: 120, align: 'right' })
      doc.font('Helvetica').fillColor(COLOR_TEXT)
        .text(value, 475, y, { width: 65, align: 'right' })
      y += 18
    })

    // Grand total
    y += 4
    doc.rect(350, y - 4, 195, 30).fill(COLOR_ORANGE)
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff')
      .text('TOTAL DUE', 360, y + 4, { width: 120, align: 'right' })
    doc.fontSize(13)
      .text(formatPrice(order.total || 0), 475, y + 3, { width: 65, align: 'right' })

    y += 50

    // ── Notes / footer ────────────────────────────────────────
    drawRule(doc, y)
    y += 16

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_GRAY)
      .text('NOTES & TERMS', 50, y)
    y += 14
    doc.font('Helvetica').fontSize(9).fillColor(COLOR_GRAY)
      .text(
        'Thank you for your purchase! This invoice is computer-generated and valid without a signature. '
        + 'For returns or support, contact support@ultimatesparepartss.com within 30 days of delivery. '
        + 'All prices are in USD.',
        50, y, { width: 495 }
      )

    // Bottom brand bar
    doc.rect(0, 780, 595, 62).fill(COLOR_DARK)
    doc.font('Helvetica').fontSize(9).fillColor('#a3a3a3')
      .text('© ' + new Date().getFullYear() + ' Ultimate Spare Parts · 123 Mechanic Ave, Detroit, MI 48201', 50, 800)
    doc.fillColor(COLOR_ORANGE)
      .text(appUrl, 400, 800, { width: 145, align: 'right' })

    doc.end()
  })
}
