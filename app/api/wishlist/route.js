/**
 * app/api/wishlist/route.js
 * GET  /api/wishlist — fetch user wishlist
 * POST /api/wishlist — add to wishlist
 */

import { NextResponse } from 'next/server'
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/models/Wishlist'
import { getSupabaseServerClient } from '@/lib/supabase'

async function getAuthUser(request) {
  const supabase = getSupabaseServerClient()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const items = await fetchWishlist(user.id)
    return NextResponse.json(items)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { productId, action } = await request.json()
    if (action === 'remove') {
      await removeFromWishlist(user.id, productId)
    } else {
      await addToWishlist(user.id, productId)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
