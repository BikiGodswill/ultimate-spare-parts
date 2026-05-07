/**
 * app/api/checkout/route.js
 * POST /api/checkout — create Stripe checkout session
 */

import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/controllers/orderController'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    const { items, shippingData, shippingOption } = body

    // Validate required fields
    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!shippingData?.email) {
      return NextResponse.json({ error: 'Shipping details required' }, { status: 400 })
    }

    // Get authenticated user (optional — allows guest checkout)
    const supabase = getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser(
      request.headers.get('authorization')?.replace('Bearer ', '')
    )

    const result = await createCheckoutSession({
      items,
      shippingData,
      shippingOption: shippingOption || 'standard',
      userId: user?.id || null,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
