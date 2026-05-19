'use client'
/**
 * components/ui/CookieBanner.js
 * GDPR-compliant cookie consent banner.
 * Consent is saved to localStorage so the banner only shows once.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { HiX } from 'react-icons/hi'
import { MdCookie } from 'react-icons/md'

const STORAGE_KEY = 'usp-cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show banner only if user hasn't consented yet
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) setVisible(true)
    } catch {
      // localStorage blocked (private mode) — skip
    }
  }, [])

  const saveConsent = (value) => {
    try { localStorage.setItem(STORAGE_KEY, value) } catch {}
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded-2xl shadow-2xl p-5">
            {/* Close */}
            <button
              onClick={() => saveConsent('declined')}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-steel-400 hover:text-steel-700 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors"
              aria-label="Close"
            >
              <HiX size={16} />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3 pr-4">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                <MdCookie size={20} className="text-brand-500" />
              </div>
              <div className="space-y-2">
                <p className="font-heading font-bold text-sm text-steel-900 dark:text-steel-100">
                  We use cookies 🍪
                </p>
                <p className="text-xs text-steel-500 dark:text-steel-400 leading-relaxed">
                  We use cookies to improve your experience, analyse traffic, and personalise
                  content. By clicking <strong>Accept</strong> you agree to our{' '}
                  <Link href="/privacy" className="text-brand-500 hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => saveConsent('accepted')}
                className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-heading font-bold rounded-xl transition-colors tracking-wide"
              >
                Accept All
              </button>
              <button
                onClick={() => saveConsent('essential')}
                className="flex-1 py-2.5 bg-steel-100 dark:bg-steel-800 hover:bg-steel-200 dark:hover:bg-steel-700 text-steel-700 dark:text-steel-300 text-xs font-heading font-bold rounded-xl transition-colors tracking-wide"
              >
                Essential Only
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
