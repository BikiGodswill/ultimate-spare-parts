'use client'
/**
 * components/animations/PageTransition.js
 * Framer Motion page wrapper for smooth transitions
 */

import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
