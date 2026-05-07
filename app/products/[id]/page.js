'use client'
/**
 * app/products/[id]/page.js
 * Product detail — image gallery, description, add to cart, reviews
 */

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  HiShoppingCart, HiHeart, HiShare, HiChevronLeft,
  HiShieldCheck, HiTruck, HiRefresh,
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import PageTransition from '@/components/animations/PageTransition'
import { StarDisplay } from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ProductGrid from '@/components/product/ProductGrid'
import ProductReviews from '@/components/product/ProductReviews'
import { ProductDetailSkeleton } from '@/components/ui/Skeleton'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { getProductDetail, getRelatedProducts } from '@/controllers/productController'
import { formatPrice, formatDate } from '@/utils/formatters'
import { calculateAverageRating } from '@/utils/helpers'
import { CATEGORIES } from '@/lib/constants'

export default function ProductDetailPage({ params }) {
  const { id } = use(params)
  const { addToCart, isInCart, updateQuantity: updateCartQty } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getProductDetail(id)
        setProduct(data)
        const rel = await getRelatedProducts(id, data.category)
        setRelated(rel)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-heading font-bold text-2xl mb-4">Product Not Found</h2>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  const images = product.image_url ? [product.image_url] : ['/images/placeholder.jpg']
  const avgRating = calculateAverageRating(product.reviews || [])
  const reviewCount = product.reviews?.length || 0
  const categoryLabel = CATEGORIES.find(c => c.id === product.category)?.label || product.category
  const inCart = isInCart(product.id)
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = () => {
    if (inCart) {
      updateCartQty(product.id, quantity)
      toast.success('Cart updated!')
    } else {
      addToCart({
        id: product.id, name: product.name, price: product.price,
        image_url: product.image_url, category: product.category,
      }, quantity)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-steel-400 mb-8">
          <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-500 transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-brand-500 transition-colors">{categoryLabel}</Link>
          <span>/</span>
          <span className="text-steel-600 dark:text-steel-300 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-16">

          {/* Image Gallery */}
          <div className="space-y-3">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-steel-100 dark:bg-steel-800"
            >
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.is_featured && (
                <div className="absolute top-4 left-4">
                  <Badge variant="new">Featured</Badge>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-heading font-bold text-2xl text-white">Out of Stock</span>
                </div>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-brand-500' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/products?category=${product.category}`}>
                <Badge variant="primary">{categoryLabel}</Badge>
              </Link>
              {product.stock > 0 && product.stock <= 5 && (
                <Badge variant="warning" dot>Only {product.stock} left</Badge>
              )}
              {product.stock === 0 && <Badge variant="danger">Out of Stock</Badge>}
            </div>

            {/* Name */}
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-3">
                <StarDisplay rating={avgRating} count={reviewCount} size="md" />
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm text-brand-500 hover:underline"
                >
                  Read reviews
                </button>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-heading font-bold text-4xl text-brand-500">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Short description */}
            <p className="text-steel-600 dark:text-steel-400 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Quantity + Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-steel-700 dark:text-steel-300">Qty:</span>
                <div className="flex items-center border border-steel-300 dark:border-steel-600 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors font-bold"
                  >−</button>
                  <span className="w-12 text-center font-heading font-bold text-steel-900 dark:text-steel-100">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors font-bold"
                  >+</button>
                </div>
                {product.stock > 0 && (
                  <span className="text-xs text-steel-400">{product.stock} in stock</span>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  icon={<HiShoppingCart size={18} />}
                  fullWidth
                  size="lg"
                >
                  {inCart ? 'Update Cart' : 'Add to Cart'}
                </Button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    wishlisted
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-steel-300 dark:border-steel-600 text-steel-400 hover:border-red-400 hover:text-red-400'
                  }`}
                >
                  <HiHeart size={22} />
                </button>

                <button
                  onClick={handleShare}
                  className="w-14 h-14 rounded-xl border-2 border-steel-300 dark:border-steel-600 text-steel-400 hover:border-brand-400 hover:text-brand-400 flex items-center justify-center flex-shrink-0 transition-all"
                >
                  <HiShare size={20} />
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-steel-200 dark:border-steel-800">
              {[
                { icon: <HiShieldCheck size={18} />, label: 'OEM Quality' },
                { icon: <HiTruck size={18} />, label: 'Fast Shipping' },
                { icon: <HiRefresh size={18} />, label: '30-Day Return' },
              ].map(g => (
                <div key={g.label} className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-steel-50 dark:bg-steel-800/50">
                  <span className="text-brand-500">{g.icon}</span>
                  <span className="text-xs font-medium text-steel-600 dark:text-steel-400">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specs / Reviews */}
        <div className="mb-16">
          <div className="flex gap-1 border-b border-steel-200 dark:border-steel-800 mb-8 overflow-x-auto">
            {['description', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-heading font-semibold text-sm uppercase tracking-wide whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-brand-500 border-brand-500'
                    : 'text-steel-500 border-transparent hover:text-steel-700 dark:hover:text-steel-300'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${reviewCount})` : tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-steel dark:prose-invert max-w-none"
            >
              <div className="text-steel-700 dark:text-steel-300 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </div>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="card p-4">
                  <h4 className="font-heading font-semibold text-sm mb-2 text-steel-900 dark:text-steel-100">Product Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-steel-500">Category</dt>
                      <dd className="font-medium text-steel-800 dark:text-steel-200">{categoryLabel}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-steel-500">SKU</dt>
                      <dd className="font-mono text-xs text-steel-800 dark:text-steel-200">{product.id.slice(0, 8).toUpperCase()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-steel-500">Listed</dt>
                      <dd className="font-medium text-steel-800 dark:text-steel-200">{formatDate(product.created_at)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ProductReviews
                productId={product.id}
                reviews={product.reviews || []}
                onReviewAdded={() => {
                  getProductDetail(id).then(setProduct)
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-2xl text-steel-900 dark:text-steel-100 mb-6">
              Related Products
            </h2>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>
    </PageTransition>
  )
}
