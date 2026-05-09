"use client";
/**
 * context/AuthContext.js
 * Authentication context using Supabase Auth.
 * Fails gracefully if Supabase is not configured.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription = null;

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Get initial session
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = data?.subscription;
    } catch (err) {
      console.error("[AuthContext] Supabase error:", err.message);
      setLoading(false);
    }

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  const isAdmin =
    user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    user?.user_metadata?.role === "admin";

  const signOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) await supabase.auth.signOut();
    } catch (err) {
      console.error("[AuthContext] Sign out error:", err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
