/**
 * models/Product.js
 * Product data model — Supabase interactions for products
 */

import { getSupabaseBrowserClient, getSupabaseServerClient } from '@/lib/supabase'

// ─── Fetch all products (with optional filters) ───────────────
export async function fetchProducts({
  category = null,
  search = '',
  minPrice = 0,
  maxPrice = 999999,
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  limit = 12,
} = {}) {
  const supabase = getSupabaseBrowserClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('products')
    .select('*, reviews(rating)', { count: 'exact' })
    .gte('price', minPrice)
    .lte('price', maxPrice)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to)

  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw error

  return { products: data || [], total: count || 0 }
}

// ─── Fetch single product by ID ───────────────────────────────
export async function fetchProductById(id) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      reviews (
        id, rating, comment, created_at,
        users:user_id ( email )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Fetch featured products ──────────────────────────────────
export async function fetchFeaturedProducts(limit = 8) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, reviews(rating)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ─── Fetch related products (same category) ───────────────────
export async function fetchRelatedProducts(productId, category, limit = 4) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, reviews(rating)')
    .eq('category', category)
    .neq('id', productId)
    .limit(limit)

  if (error) throw error
  return data || []
}

// ─── Create product (admin only — server-side) ────────────────
export async function createProduct(productData) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Update product (admin only — server-side) ────────────────
export async function updateProduct(id, productData) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Delete product (admin only — server-side) ────────────────
export async function deleteProduct(id) {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// ─── Fetch all products for admin ─────────────────────────────
export async function fetchAdminProducts() {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, reviews(rating)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
