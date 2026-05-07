/**
 * controllers/orderController.js
 * Business logic for order operations + Stripe checkout + email notifications
 */

import { stripe, toStripeAmount } from '@/lib/stripe'
import {
  createOrder,
  updateOrderByStripeSession,
  updateOrderStatus,
  fetchUserOrders,
  fetchOrderById,
  fetchAllOrders,
  fetchAdminOrderById,
  insertStatusHistory,
  fetchOrderStatusHistory,
  fetchOrderStats,
} from '@/models/Order'
import { isUserAdmin } from '@/models/UserProfile'
import { sendOrderPaidEmails, sendCustomerShippedNotification, sendAdminStatusChangeAlert } from '@/services/emailService'
import { SHIPPING_OPTIONS, FREE_SHIPPING_THRESHOLD, ORDER_STATUS } from '@/lib/constants'

// ─── Create Stripe Checkout Session ──────────────────────────
export async function createCheckoutSession({ items, shippingData, shippingOption, userId }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Build Stripe line items
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: item.image_url ? [item.image_url] : [],
        metadata: { product_id: item.id },
      },
      unit_amount: toStripeAmount(item.price),
    },
    quantity: item.quantity,
  }))

  // Shipping cost
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : (SHIPPING_OPTIONS.find(s => s.id === shippingOption)?.price ?? 5.99)

  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: `Shipping (${shippingOption})` },
        unit_amount: toStripeAmount(shippingCost),
      },
      quantity: 1,
    })
  }

  // Tax
  const subtotalAfterShipping = subtotal + shippingCost
  const tax = subtotalAfterShipping * 0.08
  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: { name: 'Sales Tax (8%)' },
      unit_amount: toStripeAmount(tax),
    },
    quantity: 1,
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    customer_email: shippingData.email,
    metadata: {
      user_id: userId || '',
      shipping_option: shippingOption,
    },
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'] },
  })

  // Save pending order to Supabase
  const orderTotal = subtotal + shippingCost + tax
  await createOrder({
    user_id: userId || null,
    stripe_session_id: session.id,
    items: items.map(i => ({
      id: i.id, name: i.name, price: i.price,
      quantity: i.quantity, image_url: i.image_url,
    })),
    shipping_address: shippingData,
    shipping_option: shippingOption,
    shipping_cost: shippingCost,
    subtotal,
    tax,
    total: orderTotal,
    status: 'pending',
  })

  return { sessionId: session.id, url: session.url }
}

// ─── Handle Stripe Webhook ────────────────────────────────────
export async function handleStripeWebhook(rawBody, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object

      // Retrieve full session with line items for richer data
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer_details'],
      })

      const addr = fullSession.customer_details?.address || {}

      // Update order: mark paid + store flat lookup fields
      const updatedOrder = await updateOrderByStripeSession(session.id, {
        status:             'paid',
        payment_intent_id:  session.payment_intent,
        email:              fullSession.customer_details?.email || null,
        full_name:          fullSession.customer_details?.name  || null,
        phone:              fullSession.customer_details?.phone || null,
        address:            addr.line1 || null,
        city:               addr.city  || null,
        updated_at:         new Date().toISOString(),
      })

      // Insert status history audit record
      await insertStatusHistory({
        orderId:    updatedOrder.id,
        oldStatus:  'pending',
        newStatus:  'paid',
        changedBy:  null, // system-triggered
        note:       `Stripe session ${session.id}`,
      })

      // 🔔 Fire admin + customer emails (non-blocking)
      sendOrderPaidEmails(updatedOrder).catch(err =>
        console.error('[Webhook] Email send failed:', err.message)
      )
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object
      // Update order status to failed by payment intent
      const { getSupabaseServerClient } = await import('@/lib/supabase')
      const supabase = getSupabaseServerClient()
      await supabase
        .from('orders')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('payment_intent_id', intent.id)
      break
    }

    default:
      break
  }

  return { received: true }
}

// ─── Verify checkout success ──────────────────────────────────
export async function verifyCheckoutSession(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    paid: session.payment_status === 'paid',
    customerEmail: session.customer_email,
    amountTotal: session.amount_total / 100,
  }
}

// ─── Get user orders ──────────────────────────────────────────
export async function getUserOrders(userId) {
  return fetchUserOrders(userId)
}

// ─── Get single order ─────────────────────────────────────────
export async function getOrderById(id) {
  return fetchOrderById(id)
}

// ─── Admin: get all orders (with filters) ────────────────────
export async function adminGetOrders(params = {}) {
  return fetchAllOrders(params)
}

// ─── Admin: get single order full detail ─────────────────────
export async function adminGetOrderById(id) {
  const [order, history] = await Promise.all([
    fetchAdminOrderById(id),
    fetchOrderStatusHistory(id),
  ])
  return { ...order, statusHistory: history }
}

// ─── Admin: update order status ───────────────────────────────
export async function adminUpdateOrderStatus(id, newStatus, adminUserId, note = null) {
  // Fetch current order for audit + email
  const currentOrder = await fetchAdminOrderById(id)
  const oldStatus    = currentOrder.status

  if (oldStatus === newStatus) return currentOrder // no-op

  // Validate transition is allowed
  const VALID_STATUSES = Object.values(ORDER_STATUS)
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`)
  }

  // Persist the status change
  const updatedOrder = await updateOrderStatus(id, newStatus)

  // Write audit trail
  await insertStatusHistory({
    orderId:   id,
    oldStatus,
    newStatus,
    changedBy: adminUserId,
    note,
  })

  // Send notifications based on transition
  if (newStatus === 'shipped') {
    sendCustomerShippedNotification(updatedOrder).catch(console.error)
  }
  sendAdminStatusChangeAlert(updatedOrder, oldStatus, newStatus).catch(console.error)

  return updatedOrder
}

// ─── Admin: get dashboard statistics ─────────────────────────
export async function adminGetOrderStats() {
  return fetchOrderStats()
}
