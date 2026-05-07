'use client'
/**
 * components/admin/orders/OrderStatusUpdater.js
 * Dropdown + confirmation to update order status with optional note
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronDown, HiCheck, HiX, HiChatAlt } from 'react-icons/hi'
import { MdEmail } from 'react-icons/md'
import toast from 'react-hot-toast'
import OrderStatusBadge from './OrderStatusBadge'
import { cn } from '@/utils/helpers'
import { getAuthToken } from '@/lib/adminAuth'

// Allowed forward transitions per status
const TRANSITIONS = {
  pending:    ['paid', 'processing', 'cancelled'],
  paid:       ['processing', 'shipped', 'refunded', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'cancelled'],
  delivered:  ['refunded'],
  cancelled:  [],
  refunded:   [],
  failed:     ['pending'],
}

// Which transitions auto-trigger emails
const EMAIL_TRIGGERS = ['shipped', 'delivered']

export default function OrderStatusUpdater({ orderId, currentStatus, onUpdated }) {
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState(null)
  const [note, setNote]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [showNote, setShowNote] = useState(false)

  const allowed = TRANSITIONS[currentStatus] || []

  const handleSelect = (status) => {
    setSelected(status)
    setOpen(false)
  }

  const handleConfirm = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const token = await getAuthToken()
      const res   = await fetch(`/api/admin/orders/${orderId}`, {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selected, note: note.trim() || null }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Update failed')
      }

      const updated = await res.json()
      toast.success(`Status updated to ${selected.toUpperCase()}`, {
        icon: '✅',
        style: { background: '#1f1f1f', color: '#f5f5f5', border: '1px solid #f97316' },
      })

      if (EMAIL_TRIGGERS.includes(selected)) {
        toast(`📧 Customer notified via email`, {
          style: { background: '#1f1f1f', color: '#a3a3a3', fontSize: '12px' },
          duration: 2500,
        })
      }

      onUpdated?.(updated)
      setSelected(null)
      setNote('')
      setShowNote(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSelected(null)
    setNote('')
    setShowNote(false)
  }

  if (allowed.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <OrderStatusBadge status={currentStatus} size="md" />
        <span className="text-xs text-steel-400 italic">Final status</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Current status + dropdown trigger */}
      <div className="flex items-center gap-3 flex-wrap">
        <OrderStatusBadge status={currentStatus} size="md" animate />

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-steel-100 dark:bg-steel-800 hover:bg-steel-200 dark:hover:bg-steel-700 text-sm font-medium text-steel-700 dark:text-steel-300 transition-colors border border-steel-200 dark:border-steel-700 disabled:opacity-50"
          >
            Change Status
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
              <HiChevronDown size={14} />
            </motion.span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 z-20 min-w-[180px] bg-white dark:bg-steel-900 rounded-xl shadow-xl border border-steel-200 dark:border-steel-800 overflow-hidden"
              >
                {allowed.map(status => (
                  <button
                    key={status}
                    onClick={() => handleSelect(status)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-steel-50 dark:hover:bg-steel-800 transition-colors"
                  >
                    <OrderStatusBadge status={status} size="sm" />
                    {EMAIL_TRIGGERS.includes(status) && (
                      <MdEmail size={12} className="text-brand-500 ml-auto" title="Sends customer email" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-steel-50 dark:bg-steel-800/60 rounded-xl border border-steel-200 dark:border-steel-700 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-steel-700 dark:text-steel-300">
                  Change status to{' '}
                  <OrderStatusBadge status={selected} size="sm" />
                  {EMAIL_TRIGGERS.includes(selected) && (
                    <span className="ml-2 text-xs text-brand-500 font-normal">
                      · Customer will be emailed
                    </span>
                  )}
                </p>
                <button onClick={handleCancel} className="text-steel-400 hover:text-steel-600 dark:hover:text-steel-200">
                  <HiX size={16} />
                </button>
              </div>

              {/* Optional note toggle */}
              <button
                onClick={() => setShowNote(!showNote)}
                className="flex items-center gap-1.5 text-xs text-steel-500 hover:text-brand-500 transition-colors"
              >
                <HiChatAlt size={13} />
                {showNote ? 'Remove note' : 'Add internal note (optional)'}
              </button>

              <AnimatePresence>
                {showNote && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={2}
                      maxLength={300}
                      placeholder="e.g., Tracking number: 1Z999AA10123456784"
                      className="input-field text-sm resize-none w-full mt-1"
                    />
                    <p className="text-xs text-steel-400 mt-0.5 text-right">{note.length}/300</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-heading font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HiCheck size={15} />
                  )}
                  Confirm
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-steel-200 dark:bg-steel-700 hover:bg-steel-300 dark:hover:bg-steel-600 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
