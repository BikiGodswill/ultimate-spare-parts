'use client'
/**
 * app/wishlist/page.js
 * Wishlist page — shows saved products
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { HiHeart, HiArrowRight, HiTrash } from 'react-icons/hi'
import Image from 'next/image'
import toast from 'react-hot-toast'
import PageTransition from '@/components/animations/PageTransition'
import Button from '@/components/ui/Button'
import { StarDisplay } from '@/components/ui/StarRating'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { fetchProductById } from '@/models/Product'
import { formatPrice } from '@/utils/formatters'
import { calculateAverageRating } from '@/utils/helpers'

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, count } = useWishlist()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      if (!wishlistIds.length) { setLoading(false); setProducts([]); return }
      setLoading(true)
      try {
        const results = await Promise.all(
          wishlistIds.map(id => fetchProductById(id).catch(() => null))
        )
        setProducts(results.filter(Boolean))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [wishlistIds])

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100 flex items-center gap-3">
              <HiHeart className="text-red-500" size={32} />
              Wishlist
            </h1>
            {count > 0 && (
              <p className="text-steel-500 mt-1">{count} saved item{count !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
              <HiHeart size={44} className="text-red-300 dark:text-red-700" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-steel-700 dark:text-steel-300 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-steel-400 mb-8 max-w-sm">
              Save products you love by clicking the heart icon on any product.
            </p>
            <Link href="/products">
              <Button icon={<HiArrowRight size={18} />} iconPosition="right">
                Browse Products
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {products.map((product, i) => {
                const avgRating = calculateAverageRating(product.reviews || [])
                const reviewCount = product.reviews?.length || 0

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="card overflow-hidden group"
                  >
                    {/* Image */}
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-48 bg-steel-100 dark:bg-steel-800 overflow-hidden">
                        <Image
                          src={product.image_url || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      </div>
                    </Link>

                    <div className="p-4">
                      <p className="text-xs text-brand-500 uppercase tracking-wider font-medium mb-1">
                        {product.category}
                      </p>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-heading font-semibold text-steel-900 dark:text-steel-100 hover:text-brand-500 transition-colors line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      {reviewCount > 0 && (
                        <StarDisplay rating={avgRating} count={reviewCount} size="sm" className="mb-3" />
                      )}

                      <div className="font-heading font-bold text-xl text-brand-500 mb-3">
                        {formatPrice(product.price)}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            addToCart({
                              id: product.id, name: product.name, price: product.price,
                              image_url: product.image_url, category: product.category,
                            })
                          }}
                          className="flex-1 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-heading font-semibold rounded-lg transition-colors"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="p-2 rounded-lg border border-steel-200 dark:border-steel-700 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <HiTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
