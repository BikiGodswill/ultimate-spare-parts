/**
 * app/api/admin/orders/[id]/route.js
 * GET   /api/admin/orders/[id] — fetch full order detail
 * PATCH /api/admin/orders/[id] — update order status
 */

import { NextResponse } from 'next/server'
import { adminGetOrderById, adminUpdateOrderStatus } from '@/controllers/orderController'
import { requireAdmin, getAdminUser } from '@/lib/adminAuth'

// ─── GET single order ─────────────────────────────────────────
export async function GET(request, { params }) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const order = await adminGetOrderById(params.id)
    return NextResponse.json(order)
  } catch (err) {
    const status = err.message?.includes('not found') ? 404 : 500
    return NextResponse.json({ error: err.message }, { status })
  }
}

// ─── PATCH — update status ────────────────────────────────────
export async function PATCH(request, { params }) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const body       = await request.json()
    const { status, note } = body

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    // Get admin user for audit trail
    const admin = await getAdminUser(request)

    const updatedOrder = await adminUpdateOrderStatus(
      params.id,
      status,
      admin?.id || null,
      note || null,
    )

    return NextResponse.json(updatedOrder)
  } catch (err) {
    console.error('[API] PATCH /api/admin/orders/[id]:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
