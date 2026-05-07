/**
 * app/api/products/route.js
 * GET /api/products  — list products
 * POST /api/products — create product (admin only)
 */

import { NextResponse } from 'next/server'
import { getFilteredProducts, adminCreateProduct } from '@/controllers/productController'
import { getSupabaseServerClient } from '@/lib/supabase'
import { checkAdminAccess } from '@/controllers/authController'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const result = await getFilteredProducts(params)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabaseServerClient()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user || !checkAdminAccess(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const data = await request.json()
    const product = await adminCreateProduct(data, user.id)
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
