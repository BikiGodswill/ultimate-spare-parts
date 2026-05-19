'use client'
/**
 * components/ui/TrustBadges.js
 * Row of trust/social proof badges.
 * Place on the homepage, product pages, or checkout.
 */

import { motion } from 'framer-motion'
import {
  HiShieldCheck, HiTruck, HiRefresh, HiStar,
} from 'react-icons/hi'
import { MdVerified, MdSupportAgent } from 'react-icons/md'

const BADGES = [
  {
    icon: <HiShieldCheck size={24} />,
    title: 'OEM Certified',
    desc:  'Genuine & compatible parts',
    color: 'text-green-500',
    bg:    'bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: <HiTruck size={24} />,
    title: 'Fast Shipping',
    desc:  'Dispatch within 24 hours',
    color: 'text-blue-500',
    bg:    'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: <HiRefresh size={24} />,
    title: '30-Day Returns',
    desc:  'Hassle-free return policy',
    color: 'text-purple-500',
    bg:    'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: <HiStar size={24} />,
    title: '4.9 / 5 Rating',
    desc:  'From 2,400+ customers',
    color: 'text-yellow-500',
    bg:    'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: <MdSupportAgent size={24} />,
    title: '24/7 Support',
    desc:  'Expert help via WhatsApp',
    color: 'text-brand-500',
    bg:    'bg-brand-50 dark:bg-brand-900/20',
  },
  {
    icon: <MdVerified size={24} />,
    title: 'Secure Checkout',
    desc:  'Stripe & PayPal protected',
    color: 'text-indigo-500',
    bg:    'bg-indigo-50 dark:bg-indigo-900/20',
  },
]

export default function TrustBadges({ compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {BADGES.slice(0, 4).map(b => (
          <div key={b.title} className="flex items-center gap-2 text-sm text-steel-600 dark:text-steel-400">
            <span className={b.color}>{b.icon}</span>
            <span className="font-medium">{b.title}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {BADGES.map((badge, i) => (
        <motion.div
          key={badge.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07 }}
          className="card p-4 flex flex-col items-center text-center gap-2 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
        >
          <div className={`w-11 h-11 rounded-xl ${badge.bg} ${badge.color} flex items-center justify-center`}>
            {badge.icon}
          </div>
          <div>
            <p className="font-heading font-semibold text-sm text-steel-800 dark:text-steel-200">
              {badge.title}
            </p>
            <p className="text-xs text-steel-400 mt-0.5">{badge.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
