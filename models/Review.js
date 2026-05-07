/**
 * models/Review.js
 * Review data model — Supabase interactions for product reviews
 */

import { getSupabaseBrowserClient, getSupabaseServerClient } from '@/lib/supabase'

// ─── Create review ────────────────────────────────────────────
export async function createReview({ productId, userId, rating, comment }) {
  const supabase = getSupabaseBrowserClient()

  // Check for existing review by this user on this product
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single()

  if (existing) throw new Error('You have already reviewed this product')

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ product_id: productId, user_id: userId, rating, comment }])
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Fetch reviews for product ────────────────────────────────
export async function fetchProductReviews(productId) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users:user_id(email)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─── Delete review ────────────────────────────────────────────
export async function deleteReview(reviewId, userId) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

// ─── Get average rating ───────────────────────────────────────
export async function getProductAverageRating(productId) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)

  if (error) throw error
  if (!data || data.length === 0) return { average: 0, count: 0 }

  const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  return { average: Math.round(average * 10) / 10, count: data.length }
}
