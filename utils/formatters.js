/**
 * utils/formatters.js
 * Data formatting utilities
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ─── Currency ─────────────────────────────────────────────────
export function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPriceShort(amount) {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return formatPrice(amount)
}

// ─── Dates ────────────────────────────────────────────────────
export function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM d, yyyy')
}

export function formatDateFull(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMMM d, yyyy · h:mm a')
}

export function formatRelativeDate(dateString) {
  if (!dateString) return ''
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
}

// ─── Text ─────────────────────────────────────────────────────
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalizeFirst(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ─── Numbers ──────────────────────────────────────────────────
export function formatRating(rating) {
  return Number(rating).toFixed(1)
}

export function formatCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return String(count)
}

// ─── Order ────────────────────────────────────────────────────
export function formatOrderId(id) {
  return `#USP-${id.slice(-6).toUpperCase()}`
}
