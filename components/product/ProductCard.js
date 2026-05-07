'use client'
/**
 * components/product/ProductCard.js
 * Individual product card with cart/wishlist actions
 */

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { HiShoppingCart, HiHeart, HiStar } from 'react-icons/hi'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { formatPrice } from '@/utils/formatters'
import { cn, calculateAverageRating } from '@/utils/helpers'
import Badge from '@/components/ui/Badge'

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [imageError, setImageError] = useState(false)

  const rating = calculateAverageRating(product.reviews || [])
  const reviewCount = product.reviews?.length || 0
  const inCart = isInCart(product.id)
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    })
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group card overflow-hidden"
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative h-52 bg-steel-100 dark:bg-steel-800 overflow-hidden">
          <Image
            src={!imageError && product.image_url ? product.image_url : '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_featured && <Badge variant="new">Featured</Badge>}
            {product.stock === 0 && <Badge variant="danger">Out of Stock</Badge>}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge variant="warning">Only {product.stock} left</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center',
              'backdrop-blur-sm shadow-md transition-all duration-200',
              wishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/80 dark:bg-steel-900/80 text-steel-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
            )}
          >
            <HiHeart size={18} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">
            {product.category?.replace(/_/g, ' ')}
          </p>

          {/* Name */}
          <h3 className="font-heading font-semibold text-steel-900 dark:text-steel-100 text-base mb-1.5 line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <HiStar className="text-yellow-400" size={14} />
              <span className="text-xs font-medium text-steel-600 dark:text-steel-400">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-steel-400">({reviewCount})</span>
            </div>
          )}

          {/* Price + Cart */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="font-heading font-bold text-xl text-steel-900 dark:text-steel-100">
                {formatPrice(product.price)}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-heading font-semibold tracking-wide transition-all duration-200',
                inCart
                  ? 'bg-green-500 text-white'
                  : product.stock === 0
                    ? 'bg-steel-200 dark:bg-steel-700 text-steel-400 cursor-not-allowed'
                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-glow-sm'
              )}
            >
              <HiShoppingCart size={16} />
              <span>{inCart ? 'Added' : 'Add'}</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
