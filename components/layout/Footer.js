'use client'
/**
 * components/layout/Footer.js
 * Site-wide footer with links, social, newsletter
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GiGears,
  FaFacebookF, FaTwitter, FaInstagram, FaYoutube,
} from 'react-icons/gi'
import {
  FaFacebook, FaXTwitter, FaInstagram as FaInsta, FaYoutube as FaYt,
} from 'react-icons/fa6'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import { MdSecurity, MdLocalShipping, MdLoop } from 'react-icons/md'

const FOOTER_LINKS = {
  Shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=engine', label: 'Engine Parts' },
    { href: '/products?category=brakes', label: 'Brakes & Rotors' },
    { href: '/products?category=suspension', label: 'Suspension' },
    { href: '/products?category=electrical', label: 'Electrical' },
    { href: '/products?category=filters', label: 'Filters & Fluids' },
  ],
  Account: [
    { href: '/auth/login', label: 'Sign In' },
    { href: '/auth/signup', label: 'Create Account' },
    { href: '/orders', label: 'Order History' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/cart', label: 'Shopping Cart' },
  ],
  Support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Shipping Policy' },
    { href: '/returns', label: 'Returns & Refunds' },
    { href: '/warranty', label: 'Warranty Info' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog & News' },
    { href: '/careers', label: 'Careers' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
}

const SOCIAL_LINKS = [
  { href: 'https://facebook.com', label: 'Facebook',  Icon: FaFacebook },
  { href: 'https://twitter.com',  label: 'Twitter/X', Icon: FaXTwitter },
  { href: 'https://instagram.com',label: 'Instagram', Icon: FaInsta },
  { href: 'https://youtube.com',  label: 'YouTube',   Icon: FaYt },
]

const TRUST_BADGES = [
  { icon: <MdLocalShipping size={20} />, text: 'Free Shipping Over $75' },
  { icon: <MdLoop size={20} />,          text: '30-Day Returns' },
  { icon: <MdSecurity size={20} />,      text: 'Secure Payments' },
]

export default function Footer() {
  return (
    <footer className="bg-steel-950 text-steel-300 mt-auto">
      {/* Trust Bar */}
      <div className="border-b border-steel-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TRUST_BADGES.map(badge => (
              <div key={badge.text} className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="text-brand-500">{badge.icon}</span>
                <span className="text-sm font-medium text-steel-300">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow-sm">
                <GiGears size={22} className="text-white" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wide">
                <span className="text-brand-500">ULTIMATE</span>
                <span className="text-white"> SPARE PARTS</span>
              </span>
            </Link>

            <p className="text-sm text-steel-400 leading-relaxed max-w-xs">
              Your one-stop shop for premium automotive spare parts. Quality components,
              fast delivery, and expert support since 2024.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 text-sm">
              <a href="mailto:support@ultimatesparepartss.com" className="flex items-center gap-2 text-steel-400 hover:text-brand-400 transition-colors">
                <HiMail size={16} />
                <span>support@ultimatesparepartss.com</span>
              </a>
              <a href="tel:+18005551234" className="flex items-center gap-2 text-steel-400 hover:text-brand-400 transition-colors">
                <HiPhone size={16} />
                <span>+1 (800) 555-1234</span>
              </a>
              <div className="flex items-center gap-2 text-steel-400">
                <HiLocationMarker size={16} />
                <span>123 Mechanic Ave, Detroit, MI 48201</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-steel-800 hover:bg-brand-500 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon size={15} className="text-steel-300 group-hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="lg:col-span-1">
              <h3 className="font-heading font-semibold text-sm text-white uppercase tracking-widest mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-steel-400 hover:text-brand-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-steel-800">
          <div className="max-w-lg">
            <h3 className="font-heading font-bold text-white text-lg mb-1">
              Stay in the Loop
            </h3>
            <p className="text-steel-400 text-sm mb-4">
              Get the latest deals, new arrivals, and mechanical tips delivered straight to your inbox.
            </p>
            <form
              onSubmit={e => { e.preventDefault(); alert('Subscribed! (implement email service)') }}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 bg-steel-800 border border-steel-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-heading font-semibold rounded-lg transition-colors tracking-wide"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-steel-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-steel-500">
            © {new Date().getFullYear()} Ultimate Spare Parts. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-steel-500">
            <Link href="/privacy" className="hover:text-brand-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-brand-400 transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-brand-400 transition-colors">Sitemap</Link>
          </div>
          {/* Payment icons */}
          <div className="flex items-center gap-2 text-xs text-steel-500">
            <span className="bg-steel-800 px-2 py-1 rounded text-[11px] font-mono">VISA</span>
            <span className="bg-steel-800 px-2 py-1 rounded text-[11px] font-mono">MC</span>
            <span className="bg-steel-800 px-2 py-1 rounded text-[11px] font-mono">AMEX</span>
            <span className="bg-blue-900/60 text-blue-300 px-2 py-1 rounded text-[11px] font-mono">PayPal</span>
            <span className="bg-purple-900/60 text-purple-300 px-2 py-1 rounded text-[11px] font-mono">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
