/**
 * app/api/admin/stats/route.js
 * GET /api/admin/stats — revenue + order statistics
 */

import { NextResponse } from 'next/server'
import { adminGetOrderStats } from '@/controllers/orderController'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(request) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const stats = await adminGetOrderStats()
    return NextResponse.json(stats)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
