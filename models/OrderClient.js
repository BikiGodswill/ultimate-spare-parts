/**
 * models/OrderClient.js
 * Browser-safe order queries — uses ONLY getSupabaseBrowserClient().
 * Safe to import from 'use client' components.
 * Server-only queries live in models/Order.js (API routes only).
 */

import { getSupabaseBrowserClient } from '@/lib/supabase'

// ─── Fetch current user's own orders ─────────────────────────
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

// ─── Fetch a single order (only if it belongs to this user) ──
export async function fetchUserOrderById(id, userId) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}
