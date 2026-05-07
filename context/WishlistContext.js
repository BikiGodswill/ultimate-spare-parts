'use client'
/**
 * context/WishlistContext.js
 * Wishlist context — persisted in Supabase when logged in, localStorage otherwise
 */

import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { addToWishlist, removeFromWishlist, fetchWishlist } from '@/models/Wishlist'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/utils/helpers'

const WISHLIST_KEY = 'usp-wishlist'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState([])
  const [loading, setLoading] = useState(false)

  // Load wishlist
  useEffect(() => {
    if (user) {
      loadServerWishlist()
    } else {
      const saved = safeLocalStorageGet(WISHLIST_KEY, [])
      setWishlistIds(saved)
    }
  }, [user])

  const loadServerWishlist = async () => {
    setLoading(true)
    try {
      const data = await fetchWishlist(user.id)
      setWishlistIds(data.map(w => w.product_id))
    } catch (err) {
      console.error('Failed to load wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = async (product) => {
    const isWishlisted = wishlistIds.includes(product.id)

    if (isWishlisted) {
      // Remove
      setWishlistIds(prev => prev.filter(id => id !== product.id))
      if (user) {
        try { await removeFromWishlist(user.id, product.id) } catch {}
      } else {
        const updated = wishlistIds.filter(id => id !== product.id)
        safeLocalStorageSet(WISHLIST_KEY, updated)
      }
      toast.success('Removed from wishlist')
    } else {
      // Add
      setWishlistIds(prev => [...prev, product.id])
      if (user) {
        try { await addToWishlist(user.id, product.id) } catch {}
      } else {
        safeLocalStorageSet(WISHLIST_KEY, [...wishlistIds, product.id])
      }
      toast.success('Added to wishlist! ❤️', {
        style: {
          background: '#1f1f1f',
          color: '#f5f5f5',
          border: '1px solid #f97316',
        },
      })
    }
  }

  const isWishlisted = (productId) => wishlistIds.includes(productId)

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      toggleWishlist,
      isWishlisted,
      loading,
      count: wishlistIds.length,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
