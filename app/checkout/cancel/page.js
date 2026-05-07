'use client'
/**
 * app/checkout/cancel/page.js
 * Shown when user cancels Stripe checkout
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HiXCircle, HiArrowLeft } from 'react-icons/hi'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center"
      >
        <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <HiXCircle size={52} className="text-red-500" />
        </div>

        <h1 className="font-heading font-bold text-4xl text-steel-900 dark:text-steel-100 mb-3">
          Payment Cancelled
        </h1>
        <p className="text-steel-500 text-lg mb-8">
          No worries — your cart has been saved. You can complete your purchase whenever you&#39;re ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout">
            <button className="btn-primary">
              Try Again
            </button>
          </Link>
          <Link href="/cart">
            <button className="btn-secondary flex items-center gap-2">
              <HiArrowLeft size={16} /> Back to Cart
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
