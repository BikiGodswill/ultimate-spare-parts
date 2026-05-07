/**
 * app/api/stripe/webhook/route.js
 * POST /api/stripe/webhook — handle Stripe webhook events
 */

import { NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/controllers/orderController'

// Disable body parsing — Stripe needs raw body
export const config = { api: { bodyParser: false } }

export async function POST(request) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  try {
    const result = await handleStripeWebhook(rawBody, signature)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
