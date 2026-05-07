/**
 * utils/emailTemplates.js
 * HTML email templates for order notifications.
 * All templates return a { subject, html, text } object.
 */

import { formatPrice, formatDate, formatOrderId } from './formatters'

// ─── Shared brand styles ──────────────────────────────────────
const BRAND_COLOR  = '#f97316'
const DARK_BG      = '#0f0f0f'
const CARD_BG      = '#1a1a1a'
const TEXT_LIGHT   = '#e5e5e5'
const TEXT_MUTED   = '#a3a3a3'
const FONT_STACK   = "'-apple-system', 'Segoe UI', Helvetica, Arial, sans-serif"

// ─── Base email wrapper ───────────────────────────────────────
function baseTemplate(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#f4f4f4; font-family:${FONT_STACK}; color:#1a1a1a; }
    .wrapper { max-width:620px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
    .header { background:${DARK_BG}; padding:32px; text-align:center; }
    .header-logo { display:inline-flex; align-items:center; gap:10px; }
    .header-icon { width:44px; height:44px; background:${BRAND_COLOR}; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; font-size:22px; }
    .header-title { color:#ffffff; font-size:22px; font-weight:700; letter-spacing:.04em; }
    .header-sub   { color:${TEXT_MUTED}; font-size:13px; margin-top:4px; }
    .content { padding:32px; }
    .section { margin-bottom:28px; }
    .section-title { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; border-bottom:1px solid #e5e7eb; padding-bottom:10px; margin-bottom:16px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .info-item label { display:block; font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em; margin-bottom:3px; }
    .info-item p   { font-size:15px; font-weight:500; color:#1a1a1a; }
    .items-table { width:100%; border-collapse:collapse; font-size:14px; }
    .items-table th { text-align:left; padding:10px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#6b7280; border-bottom:2px solid #e5e7eb; }
    .items-table td { padding:12px; border-bottom:1px solid #f3f4f6; }
    .items-table td:last-child { text-align:right; font-weight:600; }
    .items-table tr:last-child td { border-bottom:none; }
    .totals { background:#f9fafb; border-radius:8px; padding:16px; }
    .total-row { display:flex; justify-content:space-between; font-size:14px; color:#4b5563; padding:4px 0; }
    .total-row.grand { font-size:18px; font-weight:700; color:#1a1a1a; border-top:1px solid #e5e7eb; padding-top:12px; margin-top:8px; }
    .total-row.grand span:last-child { color:${BRAND_COLOR}; }
    .badge { display:inline-block; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; }
    .badge-paid      { background:#d1fae5; color:#065f46; }
    .badge-pending   { background:#fef3c7; color:#92400e; }
    .badge-shipped   { background:#dbeafe; color:#1e40af; }
    .badge-delivered { background:#ede9fe; color:#4c1d95; }
    .badge-failed    { background:#fee2e2; color:#991b1b; }
    .btn { display:inline-block; background:${BRAND_COLOR}; color:#ffffff; text-decoration:none; padding:13px 28px; border-radius:8px; font-weight:700; font-size:15px; letter-spacing:.04em; margin:20px 0; }
    .footer { background:#f9fafb; padding:20px 32px; text-align:center; border-top:1px solid #e5e7eb; }
    .footer p { font-size:12px; color:#9ca3af; line-height:1.6; }
    .footer a { color:${BRAND_COLOR}; text-decoration:none; }
    @media(max-width:480px){
      .info-grid { grid-template-columns:1fr; }
      .content { padding:20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">
        <div class="header-icon">⚙️</div>
        <div>
          <div class="header-title">ULTIMATE SPARE PARTS</div>
          <div class="header-sub">Premium Automotive Components</div>
        </div>
      </div>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ultimate Spare Parts · 123 Mechanic Ave, Detroit, MI 48201</p>
      <p style="margin-top:6px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit Store</a> ·
        <a href="mailto:support@ultimatesparepartss.com">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// ─── Items table HTML helper ──────────────────────────────────
function renderItemsTable(items = []) {
  const rows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td>${formatPrice(item.price)}</td>
      <td>${formatPrice(item.price * item.quantity)}</td>
    </tr>`).join('')

  return `
    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:center;">Qty</th>
          <th>Unit Price</th>
          <th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

// ─── Totals block HTML helper ─────────────────────────────────
function renderTotals({ subtotal, shipping_cost, tax, total }) {
  return `
    <div class="totals" style="margin-top:16px;">
      <div class="total-row"><span>Subtotal</span><span>${formatPrice(subtotal || 0)}</span></div>
      <div class="total-row"><span>Shipping</span><span>${shipping_cost === 0 ? 'FREE' : formatPrice(shipping_cost || 0)}</span></div>
      <div class="total-row"><span>Tax (8%)</span><span>${formatPrice(tax || 0)}</span></div>
      <div class="total-row grand"><span>Total Charged</span><span>${formatPrice(total || 0)}</span></div>
    </div>`
}

// ─── Address block helper ─────────────────────────────────────
function renderAddress(order) {
  const addr = order.shipping_address || {}
  const street  = order.address || addr.address || '—'
  const city    = order.city    || addr.city    || '—'
  const state   = addr.state || ''
  const zip     = addr.zip   || ''
  const country = addr.country || ''
  return `${street}<br>${city}${state ? `, ${state}` : ''} ${zip}<br>${country}`
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 1 — Admin New Order Notification
// ═══════════════════════════════════════════════════════════════
export function adminNewOrderTemplate(order) {
  const orderId  = formatOrderId(order.id)
  const fullName = order.full_name || order.shipping_address?.firstName
    ? `${order.shipping_address?.firstName || ''} ${order.shipping_address?.lastName || ''}`.trim()
    : 'Guest'
  const email    = order.email || order.shipping_address?.email || '—'
  const phone    = order.phone || order.shipping_address?.phone || '—'
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL

  const body = `
    <h2 style="font-size:22px;font-weight:700;margin-bottom:4px;">🛒 New Order Received</h2>
    <p style="color:#6b7280;margin-bottom:28px;">A customer just completed checkout. Review and process below.</p>

    <div class="section">
      <div class="section-title">Order Summary</div>
      <div class="info-grid">
        <div class="info-item"><label>Order ID</label><p>${orderId}</p></div>
        <div class="info-item"><label>Status</label><p><span class="badge badge-paid">PAID</span></p></div>
        <div class="info-item"><label>Order Total</label><p style="color:${BRAND_COLOR};font-size:18px;font-weight:700;">${formatPrice(order.total || 0)}</p></div>
        <div class="info-item"><label>Order Date</label><p>${formatDate(order.created_at)}</p></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="info-grid">
        <div class="info-item"><label>Full Name</label><p>${fullName}</p></div>
        <div class="info-item"><label>Email</label><p>${email}</p></div>
        <div class="info-item"><label>Phone</label><p>${phone}</p></div>
        <div class="info-item"><label>Shipping To</label><p>${renderAddress(order)}</p></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Items Ordered</div>
      ${renderItemsTable(order.items || [])}
      ${renderTotals(order)}
    </div>

    <div style="text-align:center;">
      <a href="${appUrl}/admin/orders/${order.id}" class="btn">View Order in Dashboard →</a>
    </div>`

  return {
    subject: `🛒 New Order ${orderId} — ${formatPrice(order.total)} from ${fullName}`,
    html: baseTemplate(`New Order ${orderId}`, body),
    text: `New order ${orderId} received from ${fullName} (${email}). Total: ${formatPrice(order.total)}. Visit ${appUrl}/admin/orders/${order.id} to manage.`,
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 2 — Customer Order Confirmation
// ═══════════════════════════════════════════════════════════════
export function customerOrderConfirmTemplate(order) {
  const orderId  = formatOrderId(order.id)
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL
  const addr     = order.shipping_address || {}
  const fullName = order.full_name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || 'Valued Customer'

  const body = `
    <h2 style="font-size:22px;font-weight:700;margin-bottom:4px;">Thank you, ${fullName}! 🎉</h2>
    <p style="color:#6b7280;margin-bottom:28px;">Your order has been confirmed and is being processed. We'll notify you when it ships.</p>

    <div class="section">
      <div class="section-title">Order Details</div>
      <div class="info-grid">
        <div class="info-item"><label>Order ID</label><p>${orderId}</p></div>
        <div class="info-item"><label>Status</label><p><span class="badge badge-paid">CONFIRMED</span></p></div>
        <div class="info-item"><label>Order Total</label><p style="color:${BRAND_COLOR};font-size:18px;font-weight:700;">${formatPrice(order.total || 0)}</p></div>
        <div class="info-item"><label>Estimated Delivery</label><p>2–7 business days</p></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Shipping Address</div>
      <p style="font-size:15px;line-height:1.7;color:#374151;">${renderAddress(order)}</p>
    </div>

    <div class="section">
      <div class="section-title">Items in Your Order</div>
      ${renderItemsTable(order.items || [])}
      ${renderTotals(order)}
    </div>

    <div style="background:#fff7ed;border-left:4px solid ${BRAND_COLOR};padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="font-weight:600;color:#9a3412;margin-bottom:4px;">📦 What happens next?</p>
      <p style="color:#78350f;font-size:14px;line-height:1.6;">
        1. We're packing your order now.<br>
        2. You'll receive a shipping confirmation with tracking info.<br>
        3. Estimated arrival: 2–7 business days.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${appUrl}/orders" class="btn">Track Your Orders →</a>
    </div>`

  return {
    subject: `Order Confirmed ${orderId} — Your parts are on their way! 🔧`,
    html: baseTemplate(`Order Confirmed ${orderId}`, body),
    text: `Hi ${fullName}, your order ${orderId} is confirmed. Total: ${formatPrice(order.total)}. Track at ${appUrl}/orders`,
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 3 — Customer Shipment Notification
// ═══════════════════════════════════════════════════════════════
export function customerShippedTemplate(order, trackingNumber = null) {
  const orderId  = formatOrderId(order.id)
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL
  const addr     = order.shipping_address || {}
  const fullName = order.full_name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || 'Valued Customer'

  const body = `
    <h2 style="font-size:22px;font-weight:700;margin-bottom:4px;">Your order is on its way! 🚚</h2>
    <p style="color:#6b7280;margin-bottom:28px;">Great news — order ${orderId} has been shipped and is headed to you.</p>

    <div class="section">
      <div class="section-title">Shipment Info</div>
      <div class="info-grid">
        <div class="info-item"><label>Order ID</label><p>${orderId}</p></div>
        <div class="info-item"><label>Status</label><p><span class="badge badge-shipped">SHIPPED</span></p></div>
        ${trackingNumber ? `<div class="info-item"><label>Tracking Number</label><p style="font-family:monospace;">${trackingNumber}</p></div>` : ''}
        <div class="info-item"><label>Delivery To</label><p>${renderAddress(order)}</p></div>
      </div>
    </div>

    <div style="text-align:center;">
      <a href="${appUrl}/orders" class="btn">View Order Status →</a>
    </div>`

  return {
    subject: `Your Order ${orderId} Has Shipped! 📦`,
    html: baseTemplate(`Order Shipped ${orderId}`, body),
    text: `Hi ${fullName}, order ${orderId} has been shipped! Track at ${appUrl}/orders`,
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE 4 — Admin Status Change Alert
// ═══════════════════════════════════════════════════════════════
export function adminStatusChangeTemplate(order, oldStatus, newStatus) {
  const orderId = formatOrderId(order.id)
  const body = `
    <h2 style="font-size:22px;font-weight:700;margin-bottom:4px;">Order Status Updated</h2>
    <p style="color:#6b7280;margin-bottom:28px;">An order status was changed in the admin dashboard.</p>
    <div class="section">
      <div class="info-grid">
        <div class="info-item"><label>Order</label><p>${orderId}</p></div>
        <div class="info-item"><label>Customer</label><p>${order.full_name || order.email || '—'}</p></div>
        <div class="info-item"><label>Previous Status</label><p><span class="badge badge-${oldStatus}">${oldStatus?.toUpperCase()}</span></p></div>
        <div class="info-item"><label>New Status</label><p><span class="badge badge-${newStatus}">${newStatus?.toUpperCase()}</span></p></div>
      </div>
    </div>`

  return {
    subject: `Order ${orderId} status → ${newStatus.toUpperCase()}`,
    html: baseTemplate('Status Update', body),
    text: `Order ${orderId} status changed from ${oldStatus} to ${newStatus}.`,
  }
}
