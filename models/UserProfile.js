/**
 * models/UserProfile.js
 * User profile data model — role management via Supabase profiles table
 */

import { getSupabaseBrowserClient, getSupabaseServerClient } from '@/lib/supabase'

// ─── Fetch own profile ────────────────────────────────────────
export async function fetchOwnProfile(userId) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

// ─── Fetch profile by user ID (server-side / admin) ───────────
export async function fetchProfileById(userId) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

// ─── Check if user is admin ───────────────────────────────────
export async function isUserAdmin(userId) {
  const profile = await fetchProfileById(userId)
  if (!profile) return false
  return profile.role === 'admin' || profile.role === 'staff'
}

// ─── Promote user to admin (service role only) ────────────────
export async function setUserRole(userId, role) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Upsert profile (create if not exists) ────────────────────
export async function upsertProfile({ id, fullName, phone, avatarUrl }) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id,
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Fetch all admin users ────────────────────────────────────
export async function fetchAdminUsers() {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'staff'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
