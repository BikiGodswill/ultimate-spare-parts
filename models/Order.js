/**
 * models/Order.js
 * Order data model — Supabase interactions for orders
 */

import { getSupabaseBrowserClient, getSupabaseServerClient } from '@/lib/supabase'

// ─── Create order ─────────────────────────────────────────────
export async function createOrder(orderData) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Update order status ──────────────────────────────────────
export async function updateOrderStatus(id, status) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Update order by Stripe session ──────────────────────────
export async function updateOrderByStripeSession(stripeSessionId, updates) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('stripe_session_id', stripeSessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Fetch user orders ────────────────────────────────────────
export async function fetchUserOrders(userId) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─── Fetch single order ───────────────────────────────────────
export async function fetchOrderById(id) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Fetch all orders (admin) with user email ─────────────────
export async function fetchAllOrders({
  page = 1,
  limit = 20,
  status = null,
  search = '',
  dateFrom = null,
  dateTo = null,
} = {}) {
  const supabase = getSupabaseServerClient()
  const from = (page - 1) * limit
  const to   = from + limit - 1

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo)   query = query.lte('created_at', dateTo)
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,id.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query
  if (error) throw error
  return { orders: data || [], total: count || 0 }
}

// ─── Fetch single order with full detail (admin) ──────────────
export async function fetchAdminOrderById(id) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Insert status history record ────────────────────────────
export async function insertStatusHistory({ orderId, oldStatus, newStatus, changedBy, note = null }) {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('order_status_history')
    .insert([{
      order_id:   orderId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy || null,
      note,
    }])

  if (error) console.error('[Order] Failed to insert status history:', error)
}

// ─── Fetch status history for an order ───────────────────────
export async function fetchOrderStatusHistory(orderId) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ─── Get order revenue stats for admin dashboard ──────────────
export async function fetchOrderStats() {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('orders')
    .select('status, total, created_at')

  if (error) throw error
  const orders = data || []

  const stats = {
    totalRevenue:  0,
    totalOrders:   orders.length,
    paidOrders:    0,
    pendingOrders: 0,
    shippedOrders: 0,
    todayRevenue:  0,
    todayOrders:   0,
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  orders.forEach(o => {
    if (o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered') {
      stats.totalRevenue += o.total || 0
    }
    if (o.status === 'paid')     stats.paidOrders++
    if (o.status === 'pending')  stats.pendingOrders++
    if (o.status === 'shipped')  stats.shippedOrders++
    if (o.created_at?.slice(0, 10) === todayStr) {
      stats.todayOrders++
      if (o.status !== 'cancelled' && o.status !== 'refunded') {
        stats.todayRevenue += o.total || 0
      }
    }
  })

  return stats
}
