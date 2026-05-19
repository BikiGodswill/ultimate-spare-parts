'use client'
/**
 * components/ui/AnnouncementBar.js
 * Dismissible top banner for promotions and announcements.
 * Edit the ANNOUNCEMENTS array to change the messages.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { MdLocalShipping } from 'react-icons/md'

// ─── Edit your announcements here ────────────────────────────
const ANNOUNCEMENTS = [
  {
    id: 1,
    icon: <MdLocalShipping size={15} />,
    text: 'Free shipping on all orders over $75!',
    cta: { label: 'Shop Now', href: '/products' },
    bg: 'bg-brand-500',
  },
  {
    id: 2,
    icon: '🔧',
    text: 'Use code PARTS10 for 10% off your first order',
    cta: { label: 'Browse Parts', href: '/products' },
    bg: 'bg-steel-900 dark:bg-steel-800',
  },
  {
    id: 3,
    icon: '⚡',
    text: 'New arrivals: Engine parts just added to the catalog',
    cta: { label: 'View New', href: '/products?category=engine' },
    bg: 'bg-indigo-600',
  },
]

const DISMISSED_KEY = 'usp-announcement-dismissed'

export default function AnnouncementBar() {
  const [visible,  setVisible]  = useState(false)
  const [current,  setCurrent]  = useState(0)

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(DISMISSED_KEY)
      if (!dismissed) setVisible(true)
    } catch { setVisible(true) }
  }, [])

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (!visible || ANNOUNCEMENTS.length <= 1) return
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % ANNOUNCEMENTS.length)
    }, 4000)
    return () => clearInterval(id)
  }, [visible])

  const dismiss = () => {
    setVisible(false)
    try { sessionStorage.setItem(DISMISSED_KEY, '1') } catch {}
  }

  const prev = () => setCurrent(c => (c - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)
  const next = () => setCurrent(c => (c + 1) % ANNOUNCEMENTS.length)

  const ann = ANNOUNCEMENTS[current]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="announcement"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{   height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`${ann.bg} text-white overflow-hidden relative`}
        >
          <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-center gap-3 relative text-sm">

            {/* Prev arrow */}
            {ANNOUNCEMENTS.length > 1 && (
              <button onClick={prev} className="text-white/60 hover:text-white transition-colors absolute left-4">
                <HiChevronLeft size={16} />
              </button>
            )}

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{   opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 font-medium text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{ann.icon}</span>
                <span>{ann.text}</span>
                {ann.cta && (
                  <Link
                    href={ann.cta.href}
                    className="ml-1 underline underline-offset-2 hover:no-underline font-bold whitespace-nowrap"
                  >
                    {ann.cta.label} →
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Next arrow */}
            {ANNOUNCEMENTS.length > 1 && (
              <button onClick={next} className="text-white/60 hover:text-white transition-colors absolute right-8">
                <HiChevronRight size={16} />
              </button>
            )}

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="text-white/60 hover:text-white transition-colors absolute right-3"
              aria-label="Dismiss"
            >
              <HiX size={14} />
            </button>
          </div>

          {/* Progress dots */}
          {ANNOUNCEMENTS.length > 1 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {ANNOUNCEMENTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1 h-1 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
