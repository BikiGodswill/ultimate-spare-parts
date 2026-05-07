'use client'
/**
 * components/animations/FadeIn.js
 * Reusable fade-in animation wrapper using Framer Motion
 */

import { motion } from 'framer-motion'

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'none'
}) {
  const directionMap = {
    up:    { y: 20 },
    down:  { y: -20 },
    left:  { x: 20 },
    right: { x: -20 },
    none:  {},
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
