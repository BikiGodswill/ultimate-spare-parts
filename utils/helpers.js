/**
 * utils/helpers.js
 * General utility / helper functions
 */

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Tailwind class merge ─────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ─── Cart ─────────────────────────────────────────────────────
export function calculateCartTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function calculateCartCount(items) {
  return items.reduce((count, item) => count + item.quantity, 0)
}

// ─── Rating ───────────────────────────────────────────────────
export function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.length
}

// ─── Random / Seeding ─────────────────────────────────────────
export function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `USP-${timestamp}-${random}`
}

// ─── Local Storage (safe for SSR) ────────────────────────────
export function safeLocalStorageGet(key, fallback = null) {
  if (typeof window === 'undefined') return fallback
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export function safeLocalStorageSet(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn('localStorage is not available')
  }
}

export function safeLocalStorageRemove(key) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    console.warn('localStorage is not available')
  }
}

// ─── Debounce ─────────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ─── Misc ─────────────────────────────────────────────────────
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateStars(rating) {
  return Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.floor(rating),
    half: i === Math.floor(rating) && rating % 1 >= 0.5,
  }))
}

export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] ?? []
    groups[group].push(item)
    return groups
  }, {})
}
