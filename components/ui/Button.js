'use client'
/**
 * components/ui/Button.js
 * Reusable Button component with variants
 */

import { motion } from 'framer-motion'
import { cn } from '@/utils/helpers'

const variants = {
  primary:   'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow-glow-sm',
  secondary: 'bg-transparent border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white',
  ghost:     'bg-transparent hover:bg-steel-100 dark:hover:bg-steel-800 text-steel-700 dark:text-steel-300',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
  dark:      'bg-steel-900 hover:bg-steel-800 text-white border border-steel-700',
}

const sizes = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  fullWidth = false,
  ...rest
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-lg',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        'tracking-wide uppercase text-sm',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </motion.button>
  )
}
