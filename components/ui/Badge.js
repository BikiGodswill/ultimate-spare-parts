'use client'
/**
 * components/ui/Badge.js
 * Status / label badge component
 */

import { cn } from '@/utils/helpers'

const variants = {
  default:  'bg-steel-100 text-steel-700 dark:bg-steel-800 dark:text-steel-300',
  primary:  'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  success:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  new:      'bg-brand-500 text-white',
  sale:     'bg-red-500 text-white',
}

export default function Badge({
  children,
  variant = 'default',
  className = '',
  dot = false,
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider',
      variants[variant],
      className,
    )}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' ? 'bg-green-500' :
          variant === 'danger' ? 'bg-red-500' :
          variant === 'warning' ? 'bg-yellow-500' :
          'bg-current opacity-60'
        )} />
      )}
      {children}
    </span>
  )
}
