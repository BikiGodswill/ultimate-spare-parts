/**
 * lib/adminAuth.js
 * Shared helper for protecting admin API routes.
 * Extracts the Bearer token, verifies it against Supabase,
 * and checks the user's role in the profiles table.
 */

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'
import { isUserAdmin } from '@/models/UserProfile'

/**
 * requireAdmin(request) → null | NextResponse
 *
 * Returns null if the request is authenticated as admin.
 * Returns a 401/403 NextResponse if not.
 *
 * Usage in route handlers:
 *   const authError = await requireAdmin(request)
 *   if (authError) return authError
 */
export async function requireAdmin(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const supabase = getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  // Check email-based admin (env var) OR role in profiles table
  const isEmailAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const isRoleAdmin  = await isUserAdmin(user.id).catch(() => false)

  if (!isEmailAdmin && !isRoleAdmin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 })
  }

  return null // ✅ Access granted
}

/**
 * getAdminUser(request) → user | null
 * Returns the authenticated Supabase user (for audit trail).
 */
export async function getAdminUser(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null

  const supabase = getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  return user || null
}

/**
 * getAuthToken() — client-side helper
 * Gets the current session access token from Supabase browser client.
 */
export async function getAuthToken() {
  // Dynamic import to avoid server-side import of browser client
  const { getSupabaseBrowserClient } = await import('@/lib/supabase')
  const supabase = getSupabaseBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}
