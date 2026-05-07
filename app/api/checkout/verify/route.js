/**
 * app/api/checkout/verify/route.js
 * GET /api/checkout/verify?session_id=xxx — verify Stripe session for success page
 */

import { NextResponse } from 'next/server'
import { verifyCheckoutSession } from '@/controllers/orderController'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    const info = await verifyCheckoutSession(sessionId)
    return NextResponse.json(info)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
