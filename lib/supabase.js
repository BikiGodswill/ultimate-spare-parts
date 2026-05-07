/**
 * lib/supabase.js
 * Supabase client instances for browser and server usage
 */

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── Browser Client (singleton) ──────────────────────────────
let browserClient = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Alias for convenience
export const supabase =
  typeof window !== "undefined" ? getSupabaseBrowserClient() : null;

// ─── Server Client (Admin / Service Role) ────────────────────
// Use only in server-side code (API routes, server components)
export function getSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ─── Storage helpers ──────────────────────────────────────────
export const STORAGE_BUCKET = "product-images";

export function getPublicImageUrl(path) {
  const client = getSupabaseBrowserClient();
  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}
