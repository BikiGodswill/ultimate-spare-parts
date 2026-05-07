'use client'
/**
 * components/cart/CartItem.js
 * Individual cart item row with quantity controls
 */

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { HiTrash, HiPlus, HiMinus } from 'react-icons/hi'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/utils/formatters'

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-4 p-4 card"
      >
        {/* Image */}
        <Link href={`/products/${item.id}`} className="flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-steel-100 dark:bg-steel-800 relative">
            <Image
              src={item.image_url || '/images/placeholder.jpg'}
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.id}`}>
            <h3 className="font-heading font-semibold text-steel-900 dark:text-steel-100 text-sm hover:text-brand-500 transition-colors line-clamp-2">
              {item.name}
            </h3>
          </Link>
          {item.category && (
            <p className="text-xs text-brand-500 mt-0.5 uppercase tracking-wider">
              {item.category}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-steel-100 dark:bg-steel-800 hover:bg-steel-200 dark:hover:bg-steel-700 flex items-center justify-center transition-colors"
              >
                <HiMinus size={12} />
              </button>
              <span className="font-heading font-bold text-sm w-6 text-center text-steel-900 dark:text-steel-100">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-steel-100 dark:bg-steel-800 hover:bg-steel-200 dark:hover:bg-steel-700 flex items-center justify-center transition-colors"
              >
                <HiPlus size={12} />
              </button>
            </div>

            {/* Price + Remove */}
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-brand-500">
                {formatPrice(item.price * item.quantity)}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-1.5 rounded-lg text-steel-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <HiTrash size={15} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
