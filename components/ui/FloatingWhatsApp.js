'use client'
/**
 * components/ui/FloatingWhatsApp.js
 * Floating WhatsApp button — visible on all pages.
 * Shows a tooltip on hover and pulses gently to draw attention.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'

const WHATSAPP_NUMBER  = '237697987229'
const DEFAULT_MESSAGE  = 'Hello! I need help with a product.'

export default function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false)

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0,  scale: 1   }}
            exit={{   opacity: 0, x: 12, scale: 0.9  }}
            transition={{ duration: 0.18 }}
            className="bg-white dark:bg-steel-900 border border-steel-200 dark:border-steel-700 rounded-xl shadow-lg px-3.5 py-2.5"
          >
            <p className="text-xs font-semibold text-steel-800 dark:text-steel-200 whitespace-nowrap">
              Chat with us
            </p>
            <p className="text-[11px] text-steel-400">+237 697 987 229</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(37,211,102,0.5)',
            '0 0 0 10px rgba(37,211,102,0)',
          ],
        }}
        transition={{
          boxShadow: { repeat: Infinity, duration: 2, ease: 'easeOut' },
        }}
        className="
          w-14 h-14 rounded-full
          bg-[#25D366] text-white
          flex items-center justify-center
          shadow-[0_4px_20px_rgba(37,211,102,0.5)]
          flex-shrink-0
        "
      >
        <FaWhatsapp size={28} />
      </motion.a>
    </div>
  )
}
