/**
 * lib/constants.js
 * Application-wide constants
 */

// ─── Product Categories ───────────────────────────────────────
export const CATEGORIES = [
  { id: 'engine',      label: 'Engine Parts',      icon: 'FaEngine' },
  { id: 'brakes',      label: 'Brakes & Rotors',   icon: 'GiCarWheel' },
  { id: 'suspension',  label: 'Suspension',         icon: 'GiSuspensionBridge' },
  { id: 'electrical',  label: 'Electrical',         icon: 'MdElectricBolt' },
  { id: 'body',        label: 'Body & Exterior',    icon: 'GiCarDoor' },
  { id: 'filters',     label: 'Filters & Fluids',   icon: 'FaFilter' },
  { id: 'exhaust',     label: 'Exhaust System',     icon: 'GiExhaust' },
  { id: 'transmission',label: 'Transmission',       icon: 'GiGears' },
]

// ─── Sort Options ─────────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc',  label: 'Oldest First' },
  { value: 'price-asc',       label: 'Price: Low to High' },
  { value: 'price-desc',      label: 'Price: High to Low' },
  { value: 'name-asc',        label: 'Name: A–Z' },
  { value: 'rating-desc',     label: 'Highest Rated' },
]

// ─── Price Ranges ─────────────────────────────────────────────
export const PRICE_RANGES = [
  { label: 'Under $25',      min: 0,   max: 25  },
  { label: '$25 – $50',      min: 25,  max: 50  },
  { label: '$50 – $100',     min: 50,  max: 100 },
  { label: '$100 – $250',    min: 100, max: 250 },
  { label: '$250 – $500',    min: 250, max: 500 },
  { label: 'Over $500',      min: 500, max: Infinity },
]

// ─── Order Statuses ───────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING:    'pending',
  PAID:       'paid',
  PROCESSING: 'processing',
  SHIPPED:    'shipped',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
  REFUNDED:   'refunded',
}

export const ORDER_STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid:       'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  shipped:    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  refunded:   'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

// ─── Rating Labels ────────────────────────────────────────────
export const RATING_LABELS = {
  5: 'Excellent',
  4: 'Very Good',
  3: 'Good',
  2: 'Fair',
  1: 'Poor',
}

// ─── Pagination ───────────────────────────────────────────────
export const PRODUCTS_PER_PAGE = 12

// ─── Shipping options ─────────────────────────────────────────
export const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Shipping (5–7 days)', price: 5.99 },
  { id: 'express',  label: 'Express Shipping (2–3 days)',  price: 14.99 },
  { id: 'overnight',label: 'Overnight Shipping (1 day)',   price: 29.99 },
]

export const FREE_SHIPPING_THRESHOLD = 75
