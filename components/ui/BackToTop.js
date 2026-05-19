'use client'
/**
 * components/ui/BackToTop.js
 * Floating button that appears after scrolling 400px and
 * smoothly returns the user to the top of the page.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronUp } from 'react-icons/hi'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{   opacity: 0, scale: 0.7, y: 16  }}
          whileHover={{ scale: 1.1 }}
          whileTap={{  scale: 0.9 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="
            fixed bottom-24 right-5 z-40
            w-11 h-11 rounded-xl
            bg-steel-900 dark:bg-steel-700
            border border-steel-700 dark:border-steel-600
            text-white flex items-center justify-center
            shadow-lg hover:bg-brand-500 hover:border-brand-500
            transition-colors duration-200
          "
        >
          <HiChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
