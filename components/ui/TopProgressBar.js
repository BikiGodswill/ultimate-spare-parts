'use client'
/**
 * components/ui/TopProgressBar.js
 * Slim orange progress bar shown during page navigations.
 * Uses usePathname + useSearchParams to detect route changes.
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Suspense } from 'react'

function Bar() {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const [visible,  setVisible]  = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef  = useRef(null)
  const prevRoute = useRef(`${pathname}?${searchParams}`)

  // Reset and animate whenever the route changes
  useEffect(() => {
    const current = `${pathname}?${searchParams}`
    if (current === prevRoute.current) return
    prevRoute.current = current

    // Start progress
    setProgress(0)
    setVisible(true)

    // Simulate progress ticking up
    let val = 0
    timerRef.current = setInterval(() => {
      val += Math.random() * 15
      if (val >= 85) {
        clearInterval(timerRef.current)
        val = 85
      }
      setProgress(val)
    }, 120)

    // Complete and hide after short delay
    const complete = setTimeout(() => {
      clearInterval(timerRef.current)
      setProgress(100)
      setTimeout(() => setVisible(false), 300)
    }, 500)

    return () => {
      clearInterval(timerRef.current)
      clearTimeout(complete)
    }
  }, [pathname, searchParams])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
          style={{ background: 'transparent' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #f97316, #fb923c)',
              boxShadow: '0 0 8px rgba(249,115,22,0.6)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.25 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Wrap in Suspense because useSearchParams needs it in App Router
export default function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  )
}
