'use client'
/**
 * components/admin/orders/OrderStatusBadge.js
 * Color-coded badge for order status
 */

import { cn } from '@/utils/helpers'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  paid:       { label: 'Paid',       classes: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400  border-green-200  dark:border-green-800',  dot: 'bg-green-500'  },
  processing: { label: 'Processing', classes: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400   border-blue-200   dark:border-blue-800',   dot: 'bg-blue-500'   },
  shipped:    { label: 'Shipped',    classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
  delivered:  { label: 'Delivered',  classes: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400    border-red-200    dark:border-red-800',    dot: 'bg-red-500'    },
  refunded:   { label: 'Refunded',   classes: 'bg-steel-100  text-steel-700  dark:bg-steel-800     dark:text-steel-400  border-steel-200  dark:border-steel-700',  dot: 'bg-steel-400'  },
  failed:     { label: 'Failed',     classes: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400    border-red-200    dark:border-red-800',    dot: 'bg-red-500'    },
}

export default function OrderStatusBadge({ status, size = 'md', animate = false }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const sizes  = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1', lg: 'text-sm px-3 py-1.5' }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider',
      sizes[size],
      config.classes,
    )}>
      <span className={cn(
        'rounded-full flex-shrink-0',
        size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5',
        config.dot,
        animate && status === 'processing' && 'animate-pulse',
      )} />
      {config.label}
    </span>
  )
}
