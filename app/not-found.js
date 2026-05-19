'use client'
/**
 * app/not-found.js
 * Custom 404 page — displayed whenever a route is not found.
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HiHome, HiSearch } from 'react-icons/hi'
import { GiGears } from 'react-icons/gi'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center space-y-8">

        {/* Animated gear */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          >
            <GiGears size={100} className="text-brand-500 opacity-20" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute top-6 left-1/2 -translate-x-1/2"
          >
            <GiGears size={60} className="text-brand-400 opacity-30" />
          </motion.div>
          {/* 404 text over the gears */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading font-black text-7xl text-steel-900 dark:text-steel-100 tracking-tight">
              404
            </span>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="font-heading font-bold text-3xl text-steel-900 dark:text-steel-100">
            Part Not Found
          </h1>
          <p className="text-steel-500 dark:text-steel-400 leading-relaxed">
            Looks like this page drove off without us. The part you&#39;re looking for
            may have moved, been discontinued, or never existed.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <button className="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
              <HiHome size={18} /> Back to Home
            </button>
          </Link>
          <Link href="/products">
            <button className="btn-secondary flex items-center gap-2 justify-center w-full sm:w-auto">
              <HiSearch size={18} /> Browse Parts
            </button>
          </Link>
        </motion.div>

        {/* Quick categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4 border-t border-steel-200 dark:border-steel-800"
        >
          <p className="text-xs text-steel-400 mb-3 uppercase tracking-wider">
            Popular Categories
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Engine Parts',   href: '/products?category=engine'    },
              { label: 'Brakes',         href: '/products?category=brakes'    },
              { label: 'Suspension',     href: '/products?category=suspension'},
              { label: 'Electrical',     href: '/products?category=electrical'},
              { label: 'Filters',        href: '/products?category=filters'   },
            ].map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-3 py-1.5 rounded-full bg-steel-100 dark:bg-steel-800 text-steel-600 dark:text-steel-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 text-xs font-medium transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
