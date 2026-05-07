/**
 * app/api/admin/orders/route.js
 * GET /api/admin/orders — fetch all orders (admin only)
 */

import { NextResponse } from 'next/server'
import { adminGetOrders } from '@/controllers/orderController'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request) {
  // ─── Auth guard ───────────────────────────────────────────
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)

    const params = {
      page:     parseInt(searchParams.get('page')  || '1'),
      limit:    parseInt(searchParams.get('limit') || '20'),
      status:   searchParams.get('status')   || null,
      search:   searchParams.get('search')   || '',
      dateFrom: searchParams.get('dateFrom') || null,
      dateTo:   searchParams.get('dateTo')   || null,
    }

    const result = await adminGetOrders(params)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] GET /api/admin/orders:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
