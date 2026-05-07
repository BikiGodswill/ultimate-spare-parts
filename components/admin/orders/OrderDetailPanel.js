'use client'
/**
 * components/admin/orders/OrderDetailPanel.js
 * Slide-over panel showing full order details for admin.
 * Includes customer info, shipping, items, payment, status history, actions.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  HiX, HiUser, HiLocationMarker, HiPhone, HiMail,
  HiShoppingCart, HiClock, HiDownload, HiPrinter,
} from 'react-icons/hi'
import { MdTimeline } from 'react-icons/md'
import OrderStatusBadge from './OrderStatusBadge'
import OrderStatusUpdater from './OrderStatusUpdater'
import Skeleton from '@/components/ui/Skeleton'
import { formatPrice, formatDate, formatDateFull, formatOrderId, formatRelativeDate } from '@/utils/formatters'
import { getAuthToken } from '@/lib/adminAuth'

// ─── Section wrapper ──────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-steel-200 dark:border-steel-800">
        <span className="text-brand-500">{icon}</span>
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-steel-600 dark:text-steel-400">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

// ─── Info row ─────────────────────────────────────────────────
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 text-sm">
      <span className="text-steel-400 min-w-[110px] flex-shrink-0">{label}</span>
      <span className={`font-medium text-steel-800 dark:text-steel-200 ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function OrderDetailPanel({ orderId, isOpen, onClose, onStatusUpdated }) {
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setTab]   = useState('details')

  // Load order when panel opens
  useEffect(() => {
    if (!isOpen || !orderId) return
    loadOrder()
  }, [isOpen, orderId])

  // Trap scroll on body when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const token = await getAuthToken()
      const res   = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load order')
      setOrder(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdated = (updatedOrder) => {
    setOrder(prev => ({ ...prev, ...updatedOrder }))
    onStatusUpdated?.(updatedOrder)
  }

  const handleDownloadInvoice = async () => {
    try {
      const token = await getAuthToken()
      const res   = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Invoice generation failed')
      const blob    = await res.blob()
      const url     = URL.createObjectURL(blob)
      const a       = document.createElement('a')
      a.href        = url
      a.download    = `invoice-${formatOrderId(orderId)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message)
    }
  }

  const addr     = order?.shipping_address || {}
  const fullName = order?.full_name || `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || 'Guest'
  const email    = order?.email    || addr.email || '—'
  const phone    = order?.phone    || addr.phone || '—'
  const street   = order?.address  || addr.address || '—'
  const city     = order?.city     || addr.city
    ? `${order?.city || addr.city}${addr.state ? ', ' + addr.state : ''} ${addr.zip || ''}`
    : '—'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white dark:bg-steel-950 z-50 flex flex-col shadow-2xl"
          >
            {/* ── Panel header ─────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-steel-200 dark:border-steel-800 flex-shrink-0">
              <div>
                <h2 className="font-heading font-bold text-xl text-steel-900 dark:text-steel-100">
                  Order Details
                </h2>
                {order && (
                  <p className="text-sm text-steel-400 font-mono mt-0.5">
                    {formatOrderId(order.id)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {order && (
                  <button
                    onClick={handleDownloadInvoice}
                    title="Download Invoice PDF"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-steel-200 dark:border-steel-700 text-sm text-steel-600 dark:text-steel-400 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors"
                  >
                    <HiDownload size={15} />
                    <span className="hidden sm:inline">Invoice</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors text-steel-500"
                >
                  <HiX size={20} />
                </button>
              </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────── */}
            <div className="flex border-b border-steel-200 dark:border-steel-800 flex-shrink-0 px-6">
              {[
                { key: 'details',  label: 'Details' },
                { key: 'items',    label: `Items (${order?.items?.length || 0})` },
                { key: 'history',  label: 'History' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={`px-4 py-3 text-sm font-heading font-semibold uppercase tracking-wide border-b-2 -mb-px transition-colors ${
                    activeTab === tab.key
                      ? 'text-brand-500 border-brand-500'
                      : 'text-steel-500 border-transparent hover:text-steel-800 dark:hover:text-steel-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Scrollable body ───────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {loading ? (
                <div className="space-y-5">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : !order ? (
                <p className="text-steel-400 text-center py-10">Failed to load order.</p>
              ) : (
                <>
                  {/* ─ DETAILS TAB ─────────────────────────── */}
                  {activeTab === 'details' && (
                    <div className="space-y-7">

                      {/* Status management */}
                      <Section title="Order Status" icon={<HiClock size={16} />}>
                        <OrderStatusUpdater
                          orderId={order.id}
                          currentStatus={order.status}
                          onUpdated={handleStatusUpdated}
                        />
                        <p className="text-xs text-steel-400 mt-1">
                          Placed {formatDateFull(order.created_at)}
                        </p>
                      </Section>

                      {/* Customer info */}
                      <Section title="Customer Information" icon={<HiUser size={16} />}>
                        <div className="space-y-2.5">
                          <InfoRow label="Full Name" value={fullName} />
                          <InfoRow label="Email"     value={email} />
                          <InfoRow label="Phone"     value={phone} />
                        </div>
                      </Section>

                      {/* Shipping */}
                      <Section title="Shipping Details" icon={<HiLocationMarker size={16} />}>
                        <div className="space-y-2.5">
                          <InfoRow label="Street"   value={street} />
                          <InfoRow label="City"     value={city} />
                          <InfoRow label="Country"  value={addr.country || '—'} />
                          <InfoRow label="Method"   value={order.shipping_option || 'standard'} />
                          <InfoRow label="Shipping Cost" value={order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost || 0)} />
                        </div>
                      </Section>

                      {/* Payment */}
                      <Section title="Payment" icon={<HiShoppingCart size={16} />}>
                        <div className="space-y-2.5">
                          <InfoRow label="Status"    value={<OrderStatusBadge status={order.status} size="sm" />} />
                          <InfoRow label="Subtotal"  value={formatPrice(order.subtotal || 0)} />
                          <InfoRow label="Tax (8%)"  value={formatPrice(order.tax     || 0)} />
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 text-sm pt-2 border-t border-steel-200 dark:border-steel-800">
                            <span className="text-steel-400 min-w-[110px]">Total Charged</span>
                            <span className="font-heading font-bold text-xl text-brand-500">
                              {formatPrice(order.total || 0)}
                            </span>
                          </div>
                          {order.stripe_session_id && (
                            <InfoRow label="Stripe Session" value={order.stripe_session_id} mono />
                          )}
                          {order.payment_intent_id && (
                            <InfoRow label="Payment Intent" value={order.payment_intent_id} mono />
                          )}
                        </div>
                      </Section>
                    </div>
                  )}

                  {/* ─ ITEMS TAB ───────────────────────────── */}
                  {activeTab === 'items' && (
                    <div className="space-y-4">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 card">
                          {item.image_url && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 bg-steel-100 dark:bg-steel-800">
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-steel-800 dark:text-steel-200 text-sm truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-steel-400 mt-0.5">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-heading font-bold text-brand-500 flex-shrink-0">
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                          </p>
                        </div>
                      ))}

                      {/* Totals */}
                      <div className="p-4 bg-steel-50 dark:bg-steel-900/50 rounded-xl space-y-2">
                        {[
                          { label: 'Subtotal',  value: formatPrice(order.subtotal || 0) },
                          { label: 'Shipping',  value: order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost || 0) },
                          { label: 'Tax (8%)',  value: formatPrice(order.tax || 0) },
                        ].map(row => (
                          <div key={row.label} className="flex justify-between text-sm text-steel-600 dark:text-steel-400">
                            <span>{row.label}</span><span>{row.value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-steel-200 dark:border-steel-700">
                          <span className="text-steel-900 dark:text-steel-100">Total</span>
                          <span className="text-brand-500">{formatPrice(order.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─ HISTORY TAB ─────────────────────────── */}
                  {activeTab === 'history' && (
                    <div>
                      {!order.statusHistory?.length ? (
                        <p className="text-steel-400 text-sm text-center py-8">No status changes recorded.</p>
                      ) : (
                        <ol className="relative border-l border-steel-200 dark:border-steel-800 ml-3 space-y-6">
                          {order.statusHistory.map((entry, i) => (
                            <li key={entry.id || i} className="ml-5">
                              <span className="absolute -left-2 w-4 h-4 rounded-full bg-brand-500 border-2 border-white dark:border-steel-950 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              </span>
                              <div className="card p-3 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {entry.old_status && (
                                    <>
                                      <OrderStatusBadge status={entry.old_status} size="sm" />
                                      <span className="text-steel-400 text-xs">→</span>
                                    </>
                                  )}
                                  <OrderStatusBadge status={entry.new_status} size="sm" />
                                </div>
                                {entry.note && (
                                  <p className="text-xs text-steel-500 italic">"{entry.note}"</p>
                                )}
                                <p className="text-xs text-steel-400">
                                  {formatRelativeDate(entry.created_at)}
                                  {entry.changed_by ? ' · by admin' : ' · system'}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
