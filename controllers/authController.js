/**
 * controllers/authController.js
 * Authentication business logic
 */

import { getSupabaseBrowserClient } from "@/lib/supabase";

// ─── Sign Up ──────────────────────────────────────────────────
export async function signUp({ email, password, fullName }) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

// ─── Sign In ──────────────────────────────────────────────────
export async function signIn({ email, password }) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// ─── Sign Out ─────────────────────────────────────────────────
export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Reset Password ───────────────────────────────────────────
export async function sendPasswordReset(email) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset`,
  });
  if (error) throw error;
}

// ─── Check admin access ───────────────────────────────────────
export function checkAdminAccess(user) {
  if (!user) return false;
  return (
    user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    user.user_metadata?.role === "admin"
  );
}
