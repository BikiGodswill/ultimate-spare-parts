'use client'
/**
 * components/product/ProductGrid.js
 * Grid layout for product cards with empty/loading states
 */

import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { GiGears } from 'react-icons/gi'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function ProductGrid({ products = [], loading = false, columns = 4 }) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-5`}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-steel-100 dark:bg-steel-800 flex items-center justify-center mb-4">
          <GiGears size={36} className="text-steel-400" />
        </div>
        <h3 className="font-heading font-bold text-xl text-steel-700 dark:text-steel-300 mb-2">
          No Products Found
        </h3>
        <p className="text-steel-400 max-w-sm">
          Try adjusting your filters or search query to find what you&#39;re looking for.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid ${gridCols[columns]} gap-5`}
    >
      {products.map(product => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}
