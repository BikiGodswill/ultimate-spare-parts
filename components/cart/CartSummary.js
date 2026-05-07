'use client'
/**
 * components/cart/CartSummary.js
 * Order summary panel shown in cart and checkout
 */

import { useState } from 'react'
import { HiTag } from 'react-icons/hi'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/utils/formatters'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_OPTIONS } from '@/lib/constants'
import Button from '@/components/ui/Button'

export default function CartSummary({ onCheckout, shippingOption = 'standard', isCheckout = false }) {
  const { cartTotal, items } = useCart()
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : (SHIPPING_OPTIONS.find(s => s.id === shippingOption)?.price ?? 5.99)

  const discount = couponApplied ? cartTotal * 0.1 : 0
  const tax = (cartTotal - discount) * 0.08
  const total = cartTotal - discount + shipping + tax

  const handleCoupon = (e) => {
    e.preventDefault()
    if (coupon.toUpperCase() === 'PARTS10') {
      setCouponApplied(true)
    } else {
      alert('Invalid coupon code')
    }
  }

  const progressPct = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal

  return (
    <div className="card p-6 space-y-5 sticky top-24">
      <h2 className="font-heading font-bold text-xl text-steel-900 dark:text-steel-100">
        Order Summary
      </h2>

      {/* Free shipping progress */}
      {cartTotal < FREE_SHIPPING_THRESHOLD && (
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4">
          <p className="text-xs text-brand-700 dark:text-brand-400 mb-2">
            Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for free shipping!
          </p>
          <div className="h-2 bg-brand-200 dark:bg-brand-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-steel-600 dark:text-steel-400">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>

        {couponApplied && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount (PARTS10 – 10%)</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-steel-600 dark:text-steel-400">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex justify-between text-sm text-steel-600 dark:text-steel-400">
          <span>Tax (8%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <div className="border-t border-steel-200 dark:border-steel-800 pt-3 flex justify-between">
          <span className="font-heading font-bold text-lg text-steel-900 dark:text-steel-100">Total</span>
          <span className="font-heading font-bold text-2xl text-brand-500">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Coupon */}
      {!isCheckout && !couponApplied && (
        <form onSubmit={handleCoupon} className="flex gap-2">
          <div className="relative flex-1">
            <HiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" size={14} />
            <input
              value={coupon}
              onChange={e => setCoupon(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="input-field pl-8 text-sm py-2.5"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-steel-100 dark:bg-steel-800 hover:bg-steel-200 dark:hover:bg-steel-700 rounded-lg text-sm font-medium transition-colors">
            Apply
          </button>
        </form>
      )}

      {couponApplied && (
        <p className="text-sm text-green-600 dark:text-green-400 text-center">
          ✓ Coupon PARTS10 applied — 10% off!
        </p>
      )}

      {!isCheckout && onCheckout && (
        <Button onClick={onCheckout} fullWidth size="lg">
          Proceed to Checkout
        </Button>
      )}

      <p className="text-xs text-steel-400 text-center">
        🔒 Secure checkout powered by Stripe
      </p>
    </div>
  )
}
