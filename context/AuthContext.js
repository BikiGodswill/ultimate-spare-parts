'use client'
/**
 * context/AuthContext.js
 * Authentication context using Supabase Auth
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    || user?.user_metadata?.role === 'admin'

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
