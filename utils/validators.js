/**
 * utils/validators.js
 * Input validation utilities
 */

// ─── Auth ─────────────────────────────────────────────────────
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!regex.test(email)) return 'Please enter a valid email'
  return null
}

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  return null
}

// ─── Product ──────────────────────────────────────────────────
export function validateProduct(data) {
  const errors = {}

  if (!data.name?.trim()) errors.name = 'Product name is required'
  if (data.name?.length > 100) errors.name = 'Name must be under 100 characters'

  if (!data.price) errors.price = 'Price is required'
  if (isNaN(data.price) || data.price <= 0) errors.price = 'Price must be a positive number'
  if (data.price > 99999) errors.price = 'Price exceeds maximum allowed'

  if (!data.description?.trim()) errors.description = 'Description is required'
  if (data.description?.length > 2000) errors.description = 'Description must be under 2000 characters'

  if (!data.category) errors.category = 'Category is required'

  if (data.stock !== undefined && (isNaN(data.stock) || data.stock < 0)) {
    errors.stock = 'Stock must be a non-negative number'
  }

  return errors
}

// ─── Checkout / Shipping ──────────────────────────────────────
export function validateShipping(data) {
  const errors = {}

  if (!data.firstName?.trim()) errors.firstName = 'First name is required'
  if (!data.lastName?.trim()) errors.lastName = 'Last name is required'
  if (!data.email?.trim()) errors.email = 'Email is required'
  else if (validateEmail(data.email)) errors.email = validateEmail(data.email)

  if (!data.address?.trim()) errors.address = 'Address is required'
  if (!data.city?.trim()) errors.city = 'City is required'
  if (!data.state?.trim()) errors.state = 'State is required'
  if (!data.zip?.trim()) errors.zip = 'ZIP code is required'
  if (!data.country?.trim()) errors.country = 'Country is required'

  const phoneRegex = /^\+?[\d\s\-()]{7,15}$/
  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  return errors
}

// ─── Review ───────────────────────────────────────────────────
export function validateReview(data) {
  const errors = {}

  if (!data.rating) errors.rating = 'Rating is required'
  if (data.rating < 1 || data.rating > 5) errors.rating = 'Rating must be between 1 and 5'

  if (!data.comment?.trim()) errors.comment = 'Review comment is required'
  if (data.comment?.length < 10) errors.comment = 'Review must be at least 10 characters'
  if (data.comment?.length > 1000) errors.comment = 'Review must be under 1000 characters'

  return errors
}

// ─── Generic helpers ──────────────────────────────────────────
export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}
