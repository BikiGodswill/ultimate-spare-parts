/**
 * app/api/reviews/route.js
 * POST /api/reviews — submit a product review
 */

import { NextResponse } from 'next/server'
import { createReview } from '@/models/Review'
import { getSupabaseBrowserClient } from '@/lib/supabase'
import { validateReview, hasErrors } from '@/utils/validators'

export async function POST(request) {
  try {
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const errors = validateReview(body)
    if (hasErrors(errors)) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
    }

    const review = await createReview({
      productId: body.productId,
      userId: user.id,
      rating: body.rating,
      comment: body.comment,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
