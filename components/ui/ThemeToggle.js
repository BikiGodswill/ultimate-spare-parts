'use client'
/**
 * components/ui/ThemeToggle.js
 * Dark/Light mode toggle button
 */

import { motion, AnimatePresence } from 'framer-motion'
import { HiSun, HiMoon } from 'react-icons/hi'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) return <div className="w-10 h-10" />

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`
        relative w-10 h-10 rounded-xl flex items-center justify-center
        bg-steel-100 dark:bg-steel-800 border border-steel-200 dark:border-steel-700
        text-steel-600 dark:text-steel-400 hover:text-brand-500 dark:hover:text-brand-400
        hover:border-brand-400 dark:hover:border-brand-500
        transition-colors duration-200
        ${className}
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HiSun size={18} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HiMoon size={18} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
