/**
 * models/Wishlist.js
 * Wishlist data model — Supabase interactions
 */

import { getSupabaseBrowserClient } from '@/lib/supabase'

// ─── Fetch user wishlist ──────────────────────────────────────
export async function fetchWishlist(userId) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─── Add to wishlist ──────────────────────────────────────────
export async function addToWishlist(userId, productId) {
  const supabase = getSupabaseBrowserClient()

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existing) return existing // Already in wishlist

  const { data, error } = await supabase
    .from('wishlists')
    .insert([{ user_id: userId, product_id: productId }])
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Remove from wishlist ─────────────────────────────────────
export async function removeFromWishlist(userId, productId) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) throw error
  return true
}

// ─── Check if product is in wishlist ─────────────────────────
export async function isInWishlist(userId, productId) {
  const supabase = getSupabaseBrowserClient()
  const { data } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  return !!data
}
