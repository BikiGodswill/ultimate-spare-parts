/**
 * hooks/useRecentlyViewed.js
 * Tracks the last 6 product IDs the user visited.
 * Stored in localStorage so it persists across sessions.
 */

import { useState, useEffect, useCallback } from 'react'

const KEY      = 'usp-recently-viewed'
const MAX_ITEMS = 6

export function useRecentlyViewed() {
  const [ids, setIds] = useState([])

  // Load on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      setIds(Array.isArray(saved) ? saved : [])
    } catch { setIds([]) }
  }, [])

  // Add a product ID (called on product detail page)
  const addProduct = useCallback((productId) => {
    if (!productId) return
    setIds(prev => {
      const filtered = prev.filter(id => id !== productId)
      const updated  = [productId, ...filtered].slice(0, MAX_ITEMS)
      try { localStorage.setItem(KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setIds([])
    try { localStorage.removeItem(KEY) } catch {}
  }, [])

  return { ids, addProduct, clearHistory }
}
