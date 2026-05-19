'use client'
/**
 * components/product/RecentlyViewed.js
 * Horizontally scrollable strip of recently viewed products.
 * Drop this anywhere — product pages, cart, homepage, etc.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { HiClock, HiX } from 'react-icons/hi'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { fetchProductById } from '@/models/Product'
import { formatPrice } from '@/utils/formatters'

export default function RecentlyViewed({ excludeId = null }) {
  const { ids, clearHistory } = useRecentlyViewed()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  const filtered = ids.filter(id => id !== excludeId)

  useEffect(() => {
    if (!filtered.length) { setLoading(false); return }
    setLoading(true)
    Promise.all(filtered.map(id => fetchProductById(id).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [ids.join(',')])    // re-run when ids change

  if (loading || products.length === 0) return null

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-bold text-xl text-steel-900 dark:text-steel-100 flex items-center gap-2">
          <HiClock size={20} className="text-brand-500" />
          Recently Viewed
        </h2>
        <button
          onClick={clearHistory}
          className="text-xs text-steel-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <HiX size={12} /> Clear
        </button>
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-500 scrollbar-track-steel-100 dark:scrollbar-track-steel-800">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex-shrink-0 w-40"
          >
            <Link href={`/products/${product.id}`} className="group block">
              <div className="relative h-36 rounded-xl overflow-hidden bg-steel-100 dark:bg-steel-800 mb-2">
                <Image
                  src={product.image_url || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="160px"
                />
              </div>
              <p className="text-xs font-medium text-steel-800 dark:text-steel-200 line-clamp-2 group-hover:text-brand-500 transition-colors leading-snug">
                {product.name}
              </p>
              <p className="text-sm font-heading font-bold text-brand-500 mt-0.5">
                {formatPrice(product.price)}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
