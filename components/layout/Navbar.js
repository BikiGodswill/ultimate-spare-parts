'use client'
/**
 * components/layout/Navbar.js
 * Main navigation bar with cart, auth, search, theme toggle
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiShoppingCart, HiHeart, HiUser, HiMenu, HiX,
  HiSearch, HiLogout, HiViewGrid,
} from 'react-icons/hi'
import { GiGears } from 'react-icons/gi'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { cn } from '@/utils/helpers'

const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/products',  label: 'Products' },
  { href: '/products?category=engine',    label: 'Engine' },
  { href: '/products?category=brakes',    label: 'Brakes' },
  { href: '/products?category=electrical',label: 'Electrical' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { cartCount } = useCart()
  const { user, isAdmin, signOut } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
      setSearchOpen(false)
    }
  }

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-steel-950/95 backdrop-blur-md shadow-md border-b border-steel-200 dark:border-steel-800'
          : 'bg-transparent'
      )}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center
                              group-hover:bg-brand-600 transition-colors shadow-glow-sm">
                <GiGears size={22} className="text-white" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wide">
                <span className="text-brand-500">ULTIMATE</span>
                <span className="text-steel-900 dark:text-steel-100"> SPARE</span>
                <span className="text-steel-500 dark:text-steel-400"> PARTS</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-heading font-semibold tracking-wide uppercase transition-all duration-200',
                    pathname === link.href
                      ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'text-steel-600 dark:text-steel-400 hover:text-brand-500 hover:bg-steel-100 dark:hover:bg-steel-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg text-sm font-heading font-semibold tracking-wide uppercase text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl hover:bg-steel-100 dark:hover:bg-steel-800 text-steel-600 dark:text-steel-400 hover:text-brand-500 transition-colors"
              >
                <HiSearch size={20} />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2.5 rounded-xl hover:bg-steel-100 dark:hover:bg-steel-800 text-steel-600 dark:text-steel-400 hover:text-brand-500 transition-colors">
                <HiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2.5 rounded-xl hover:bg-steel-100 dark:hover:bg-steel-800 text-steel-600 dark:text-steel-400 hover:text-brand-500 transition-colors">
                <HiShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User / Auth */}
              {user ? (
                <div className="hidden sm:flex items-center gap-1">
                  <Link href="/orders" className="p-2.5 rounded-xl hover:bg-steel-100 dark:hover:bg-steel-800 text-steel-600 dark:text-steel-400 hover:text-brand-500 transition-colors">
                    <HiViewGrid size={20} />
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-steel-600 dark:text-steel-400 hover:text-red-500 transition-colors"
                  >
                    <HiLogout size={20} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-heading font-semibold tracking-wide transition-colors"
                >
                  <HiUser size={16} /> Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-steel-100 dark:hover:bg-steel-800 text-steel-600 dark:text-steel-400 transition-colors"
              >
                {mobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Search Bar Dropdown */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pb-3"
              >
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search spare parts..."
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn-primary px-5">
                    Search
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-0 z-50 bg-white dark:bg-steel-950 lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 h-16 border-b border-steel-200 dark:border-steel-800">
                <span className="font-heading font-bold text-lg text-brand-500">MENU</span>
                <button onClick={() => setMobileOpen(false)} className="p-2">
                  <HiX size={24} className="text-steel-600 dark:text-steel-400" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 rounded-xl font-heading font-semibold text-lg tracking-wide text-steel-700 dark:text-steel-300 hover:text-brand-500 hover:bg-steel-100 dark:hover:bg-steel-800 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link href="/admin" className="block px-4 py-3 rounded-xl font-heading font-semibold text-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                    Admin Dashboard
                  </Link>
                )}
              </nav>

              <div className="px-4 py-6 border-t border-steel-200 dark:border-steel-800 space-y-3">
                {user ? (
                  <button onClick={signOut} className="btn-secondary w-full">Sign Out</button>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn-primary w-full text-center block">Sign In</Link>
                    <Link href="/auth/signup" className="btn-secondary w-full text-center block">Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}
