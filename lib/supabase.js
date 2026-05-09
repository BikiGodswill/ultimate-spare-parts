/**
 * lib/supabase.js
 * Supabase client — handles missing env vars gracefully
 * so a misconfigured deployment shows an error instead of a black screen.
 */

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Warn clearly in the console when env vars are missing
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    "[Supabase] Missing environment variables!\n" +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables.",
  );
}

// ─── Browser Client (singleton) ──────────────────────────────
let browserClient = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  // If env vars are missing, return a dummy client that fails gracefully
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signUp: async () => {
          throw new Error("Supabase not configured");
        },
        signInWithPassword: async () => {
          throw new Error("Supabase not configured");
        },
        signOut: async () => {},
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({
            data: null,
            error: new Error("Not configured"),
          }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
      channel: () => ({
        on: function () {
          return this;
        },
        subscribe: function () {
          return this;
        },
      }),
      removeChannel: () => {},
    };
  }

  try {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("[Supabase] Failed to create browser client:", err.message);
    return null;
  }

  return browserClient;
}

// ─── Server Client (Admin / Service Role) ────────────────────
export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in Vercel → Settings → Environment Variables.",
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Storage helpers ──────────────────────────────────────────
export const STORAGE_BUCKET = "product-images";

export function getPublicImageUrl(path) {
  const client = getSupabaseBrowserClient();
  if (!client) return "";
  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export const isMissingConfig = !supabaseUrl || !supabaseAnonKey;
