'use client'
/**
 * components/ui/StarRating.js
 * Star rating display and interactive rating input
 */

import { useState } from 'react'
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import { cn } from '@/utils/helpers'

// ─── Display-only Star Rating ─────────────────────────────────
export function StarDisplay({ rating = 0, count = 0, size = 'md', className = '' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn('flex items-center', sizes[size])}>
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= Math.floor(rating)
          const half = !filled && star - 0.5 <= rating
          return (
            <span key={star} className="text-yellow-400">
              {filled ? <FaStar /> : half ? <FaStarHalfAlt /> : <FaRegStar />}
            </span>
          )
        })}
      </div>
      {count > 0 && (
        <span className="text-sm text-steel-500 dark:text-steel-400">
          ({count})
        </span>
      )}
    </div>
  )
}

// ─── Interactive Star Input ───────────────────────────────────
export function StarInput({ value = 0, onChange, size = 'lg' }) {
  const [hover, setHover] = useState(0)
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }

  return (
    <div className={cn('flex items-center gap-1', sizes[size])}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={cn(
            (hover || value) >= star ? 'text-yellow-400' : 'text-steel-300 dark:text-steel-600'
          )}>
            <FaStar />
          </span>
        </button>
      ))}
    </div>
  )
}
