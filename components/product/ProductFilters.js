'use client'
/**
 * components/product/ProductFilters.js
 * Sidebar / inline product filter component
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronDown, HiX } from 'react-icons/hi'
import { CATEGORIES, PRICE_RANGES, SORT_OPTIONS } from '@/lib/constants'
import { cn } from '@/utils/helpers'

export default function ProductFilters({ filters, onChange, onReset }) {
  const [openSections, setOpenSections] = useState(['category', 'price', 'sort'])

  const toggleSection = (key) => {
    setOpenSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const hasActiveFilters = filters.category || filters.priceRange ||
    filters.sortBy !== 'created_at-desc'

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-lg text-steel-900 dark:text-steel-100 uppercase tracking-wide">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
          >
            <HiX size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        sectionKey="category"
        isOpen={openSections.includes('category')}
        onToggle={toggleSection}
      >
        <div className="space-y-1.5">
          <button
            onClick={() => onChange({ category: '' })}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
              !filters.category
                ? 'bg-brand-500 text-white font-medium'
                : 'text-steel-700 dark:text-steel-300 hover:bg-steel-100 dark:hover:bg-steel-800'
            )}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onChange({ category: cat.id })}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                filters.category === cat.id
                  ? 'bg-brand-500 text-white font-medium'
                  : 'text-steel-700 dark:text-steel-300 hover:bg-steel-100 dark:hover:bg-steel-800'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection
        title="Price Range"
        sectionKey="price"
        isOpen={openSections.includes('price')}
        onToggle={toggleSection}
      >
        <div className="space-y-1.5">
          <button
            onClick={() => onChange({ priceRange: null, minPrice: 0, maxPrice: 999999 })}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
              !filters.priceRange
                ? 'bg-brand-500 text-white font-medium'
                : 'text-steel-700 dark:text-steel-300 hover:bg-steel-100 dark:hover:bg-steel-800'
            )}
          >
            Any Price
          </button>
          {PRICE_RANGES.map(range => (
            <button
              key={range.label}
              onClick={() => onChange({
                priceRange: range.label,
                minPrice: range.min,
                maxPrice: range.max === Infinity ? 999999 : range.max,
              })}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                filters.priceRange === range.label
                  ? 'bg-brand-500 text-white font-medium'
                  : 'text-steel-700 dark:text-steel-300 hover:bg-steel-100 dark:hover:bg-steel-800'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Sort */}
      <FilterSection
        title="Sort By"
        sectionKey="sort"
        isOpen={openSections.includes('sort')}
        onToggle={toggleSection}
      >
        <div className="space-y-1.5">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange({ sortBy: opt.value })}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150',
                filters.sortBy === opt.value
                  ? 'bg-brand-500 text-white font-medium'
                  : 'text-steel-700 dark:text-steel-300 hover:bg-steel-100 dark:hover:bg-steel-800'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection
        title="Min Rating"
        sectionKey="rating"
        isOpen={openSections.includes('rating')}
        onToggle={toggleSection}
      >
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(stars => (
            <button
              key={stars}
              onClick={() => onChange({ minRating: stars === filters.minRating ? 0 : stars })}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-150',
                filters.minRating === stars
                  ? 'bg-brand-500 text-white font-medium'
                  : 'text-steel-700 dark:text-steel-300 hover:bg-steel-100 dark:hover:bg-steel-800'
              )}
            >
              {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
              <span className="text-xs">& up</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

// ─── Collapsible filter section ───────────────────────────────
function FilterSection({ title, sectionKey, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-steel-200 dark:border-steel-800 pb-3">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-heading font-semibold text-sm text-steel-800 dark:text-steel-200 uppercase tracking-wider">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-steel-400"
        >
          <HiChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
