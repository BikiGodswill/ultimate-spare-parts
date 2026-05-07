'use client'
/**
 * components/admin/orders/AdminStatsBar.js
 * Revenue + order statistics bar for the admin orders page
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HiCurrencyDollar, HiShoppingCart, HiClock, HiTruck,
} from 'react-icons/hi'
import { MdToday } from 'react-icons/md'
import Skeleton from '@/components/ui/Skeleton'
import { formatPrice } from '@/utils/formatters'
import { getAuthToken } from '@/lib/adminAuth'

export default function AdminStatsBar() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getAuthToken()
        const res   = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setStats(await res.json())
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const cards = [
    {
      label: 'Total Revenue',
      value: stats ? formatPrice(stats.totalRevenue) : '—',
      icon:  <HiCurrencyDollar size={22} />,
      color: 'text-green-500',
      bg:    'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? '—',
      icon:  <HiShoppingCart size={22} />,
      color: 'text-blue-500',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Pending',
      value: stats?.pendingOrders ?? '—',
      icon:  <HiClock size={22} />,
      color: 'text-yellow-500',
      bg:    'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Shipped',
      value: stats?.shippedOrders ?? '—',
      icon:  <HiTruck size={22} />,
      color: 'text-indigo-500',
      bg:    'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      label: "Today's Revenue",
      value: stats ? formatPrice(stats.todayRevenue) : '—',
      icon:  <MdToday size={22} />,
      color: 'text-brand-500',
      bg:    'bg-brand-50 dark:bg-brand-900/20',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="card p-4"
        >
          <div className={`inline-flex p-2.5 rounded-xl ${card.bg} ${card.color} mb-3`}>
            {card.icon}
          </div>
          <div className="font-heading font-bold text-2xl text-steel-900 dark:text-steel-100">
            {card.value}
          </div>
          <div className="text-xs text-steel-500 mt-0.5">{card.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
