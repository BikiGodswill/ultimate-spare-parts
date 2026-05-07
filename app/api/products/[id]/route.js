/**
 * app/api/products/[id]/route.js
 * GET    /api/products/[id] — get product
 * PUT    /api/products/[id] — update product (admin)
 * DELETE /api/products/[id] — delete product (admin)
 */

import { NextResponse } from 'next/server'
import { getProductDetail, adminUpdateProduct, adminDeleteProduct } from '@/controllers/productController'
import { getSupabaseServerClient } from '@/lib/supabase'
import { checkAdminAccess } from '@/controllers/authController'

async function requireAdmin(request) {
  const supabase = getSupabaseServerClient()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user || !checkAdminAccess(user)) throw new Error('Unauthorized')
  return user
}

export async function GET(request, { params }) {
  try {
    const product = await getProductDetail(params.id)
    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin(request)
    const data = await request.json()
    const product = await adminUpdateProduct(params.id, data)
    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 403 : 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request)
    await adminDeleteProduct(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 403 : 500 })
  }
}
