'use client'
/**
 * app/admin/orders/page.js
 * Admin Order Management Dashboard
 *
 * Features:
 *  - Protected route (admin only)
 *  - Live order table with filters + pagination
 *  - Slide-over panel for full order detail
 *  - Status update with email notification triggers
 *  - Realtime updates via Supabase subscriptions
 *  - PDF invoice download
 *  - Revenue statistics bar
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiShoppingCart, HiBell, HiArrowLeft,
} from 'react-icons/hi'
import { MdInventory } from 'react-icons/md'
import toast from 'react-hot-toast'
import Link from 'next/link'

import PageTransition from '@/components/animations/PageTransition'
import FadeIn from '@/components/animations/FadeIn'
import OrdersTable from '@/components/admin/orders/OrdersTable'
import OrderDetailPanel from '@/components/admin/orders/OrderDetailPanel'
import AdminStatsBar from '@/components/admin/orders/AdminStatsBar'
import { useAuth } from '@/context/AuthContext'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { formatOrderId } from '@/utils/formatters'
import { formatPrice } from '@/utils/formatters'

export default function AdminOrdersPage() {
  const router           = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [panelOpen, setPanelOpen]             = useState(false)
  const [tableKey, setTableKey]               = useState(0)   // force table refresh
  const [newOrderAlert, setNewOrderAlert]     = useState(null)

  // ─── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/auth/login')
    }
  }, [user, isAdmin, authLoading, router])

  // ─── Realtime subscription ─────────────────────────────────
  useRealtimeOrders({
    onInsert: useCallback((newOrder) => {
      // Show toast with new order alert
      const id = formatOrderId(newOrder.id)
      toast(`🛒 New order ${id} — ${formatPrice(newOrder.total)}`, {
        duration: 8000,
        style: {
          background: '#1f1f1f',
          color:      '#f5f5f5',
          border:     '1px solid #f97316',
          fontSize:   '14px',
        },
        icon: '🔔',
      })
      setNewOrderAlert(newOrder)
      setTableKey(k => k + 1) // Refresh table
    }, []),

    onUpdate: useCallback((updatedOrder) => {
      setTableKey(k => k + 1)
    }, []),
  })

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId)
    setPanelOpen(true)
  }

  const handlePanelClose = () => {
    setPanelOpen(false)
    setTimeout(() => setSelectedOrderId(null), 300)
  }

  const handleStatusUpdated = (updatedOrder) => {
    // Refresh table to reflect new status
    setTableKey(k => k + 1)
  }

  if (authLoading || (!isAdmin && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ───────────────────────────────────── */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/admin"
                  className="text-steel-400 hover:text-brand-500 transition-colors"
                >
                  <HiArrowLeft size={18} />
                </Link>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-heading font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                  Live
                </div>
              </div>

              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100 flex items-center gap-3">
                <HiShoppingCart className="text-brand-500" size={32} />
                Order Management
              </h1>
              <p className="text-steel-500 text-sm mt-1">
                Real-time order tracking, status management, and customer notifications
              </p>
            </div>

            {/* New order alert banner */}
            <AnimatePresence>
              {newOrderAlert && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => {
                    handleSelectOrder(newOrderAlert.id)
                    setNewOrderAlert(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-heading font-semibold transition-colors shadow-glow-orange"
                >
                  <HiBell size={16} className="animate-bounce" />
                  New Order Arrived!
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* ── Stats Bar ─────────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <AdminStatsBar key={tableKey} />
        </FadeIn>

        {/* ── Orders Table ──────────────────────────────────── */}
        <FadeIn delay={0.2}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MdInventory size={20} className="text-brand-500" />
              <h2 className="font-heading font-bold text-xl text-steel-900 dark:text-steel-100">
                All Orders
              </h2>
            </div>
            <OrdersTable
              key={tableKey}
              onSelectOrder={handleSelectOrder}
            />
          </div>
        </FadeIn>
      </div>

      {/* ── Order Detail Slide-Over Panel ─────────────────── */}
      <OrderDetailPanel
        orderId={selectedOrderId}
        isOpen={panelOpen}
        onClose={handlePanelClose}
        onStatusUpdated={handleStatusUpdated}
      />
    </PageTransition>
  )
}
