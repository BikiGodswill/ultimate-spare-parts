/**
 * app/api/admin/orders/[id]/invoice/route.js
 * GET /api/admin/orders/[id]/invoice — stream PDF invoice
 * Accessible by admin OR the order's own customer
 */

import { NextResponse } from 'next/server'
import { adminGetOrderById } from '@/controllers/orderController'
import { generateInvoicePDF } from '@/services/invoiceService'
import { getSupabaseServerClient } from '@/lib/supabase'
import { isUserAdmin } from '@/models/UserProfile'
import { formatOrderId } from '@/utils/formatters'

export async function GET(request, { params }) {
  try {
    // ─── Auth: allow admin or the order owner ─────────────────
    const supabase = getSupabaseServerClient()
    const token    = request.headers.get('authorization')?.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch order first so we can check ownership
    const order = await adminGetOrderById(params.id)
    const isAdmin = await isUserAdmin(user.id)
    const isOwner = order.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDF(order)

    const filename = `invoice-${formatOrderId(order.id)}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':       String(pdfBuffer.length),
        'Cache-Control':       'no-store',
      },
    })
  } catch (err) {
    console.error('[API] Invoice generation failed:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
