'use client'
/**
 * components/admin/orders/OrdersTable.js
 * Paginated, searchable, filterable orders table for admin panel
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSearch, HiX, HiChevronLeft, HiChevronRight,
  HiExternalLink, HiRefresh, HiFilter,
} from 'react-icons/hi'
import OrderStatusBadge from './OrderStatusBadge'
import { RowSkeleton } from '@/components/ui/Skeleton'
import { formatPrice, formatDate, formatOrderId } from '@/utils/formatters'
import { debounce } from '@/utils/helpers'
import { getAuthToken } from '@/lib/adminAuth'

const PAGE_SIZES = [10, 20, 50]

const STATUS_FILTER_OPTIONS = [
  { value: '',          label: 'All Statuses' },
  { value: 'pending',   label: 'Pending'   },
  { value: 'paid',      label: 'Paid'      },
  { value: 'processing',label: 'Processing'},
  { value: 'shipped',   label: 'Shipped'   },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded',  label: 'Refunded'  },
]

export default function OrdersTable({ onSelectOrder }) {
  const [orders, setOrders]       = useState([])
  const [total,  setTotal]        = useState(0)
  const [loading, setLoading]     = useState(true)
  const [page,    setPage]        = useState(1)
  const [limit,   setLimit]       = useState(20)
  const [search,  setSearch]      = useState('')
  const [status,  setStatus]      = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Debounced search update
  const debouncedSearch = useCallback(
    debounce(val => { setSearch(val); setPage(1) }, 400),
    []
  )

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getAuthToken()
      const qs = new URLSearchParams({
        page:  String(page),
        limit: String(limit),
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      })

      const res = await fetch(`/api/admin/orders?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, limit, status, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const totalPages = Math.ceil(total / limit)
  const hasFilters = search || status

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400" size={16} />
          <input
            type="text"
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); debouncedSearch(e.target.value) }}
            placeholder="Search by name, email, order ID…"
            className="input-field pl-9 py-2 text-sm"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-600"
            >
              <HiX size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div className="relative">
            <HiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-steel-400 pointer-events-none" size={14} />
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1) }}
              className="input-field pl-8 py-2 text-sm w-40"
            >
              {STATUS_FILTER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Per-page */}
          <select
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
            className="input-field py-2 text-sm w-24"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>

          {/* Refresh */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-lg border border-steel-200 dark:border-steel-700 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors text-steel-500 disabled:opacity-40"
            title="Refresh"
          >
            <HiRefresh size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Result count */}
      <div className="text-sm text-steel-500">
        {loading
          ? 'Loading…'
          : `${total} order${total !== 1 ? 's' : ''} found${hasFilters ? ' (filtered)' : ''}`}
      </div>

      {/* ─── Table (desktop) ──────────────────────────────── */}
      <div className="card overflow-hidden hidden md:block">
        {loading ? (
          <div className="p-4"><RowSkeleton count={5} /></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="font-heading font-bold text-lg text-steel-500">No orders found</p>
            <p className="text-sm text-steel-400 mt-1">Try adjusting filters or search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-steel-50 dark:bg-steel-800/60 border-b border-steel-200 dark:border-steel-700">
                <tr>
                  {['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-heading font-semibold uppercase tracking-wider text-steel-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                <AnimatePresence>
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-steel-50/50 dark:hover:bg-steel-800/30 transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-steel-600 dark:text-steel-400 font-medium">
                        {formatOrderId(order.id)}
                      </td>
                      <td className="px-4 py-3 font-medium text-steel-800 dark:text-steel-200 max-w-[150px] truncate">
                        {order.full_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-steel-500 max-w-[180px] truncate">
                        {order.email || order.shipping_address?.email || '—'}
                      </td>
                      <td className="px-4 py-3 font-heading font-bold text-brand-500">
                        {formatPrice(order.total || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-steel-400 text-xs whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View <HiExternalLink size={12} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Mobile cards ──────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <RowSkeleton count={4} />
        ) : orders.map(order => (
          <button
            key={order.id}
            onClick={() => onSelectOrder(order.id)}
            className="w-full card p-4 flex items-center gap-4 text-left"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-steel-500">{formatOrderId(order.id)}</span>
                <OrderStatusBadge status={order.status} size="sm" />
              </div>
              <p className="font-medium text-steel-800 dark:text-steel-200 truncate text-sm">
                {order.full_name || order.email || '—'}
              </p>
              <p className="text-xs text-steel-400">{formatDate(order.created_at)}</p>
            </div>
            <span className="font-heading font-bold text-brand-500 flex-shrink-0">
              {formatPrice(order.total || 0)}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Pagination ────────────────────────────────────── */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-steel-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-steel-200 dark:border-steel-700 disabled:opacity-40 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors"
            >
              <HiChevronLeft size={16} />
            </button>

            {/* Page number buttons (show 5 at most) */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1
              if (totalPages > 5) {
                if (page <= 3)          p = i + 1
                else if (page >= totalPages - 2) p = totalPages - 4 + i
                else                    p = page - 2 + i
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-heading font-bold transition-colors ${
                    page === p
                      ? 'bg-brand-500 text-white'
                      : 'border border-steel-200 dark:border-steel-700 hover:bg-steel-100 dark:hover:bg-steel-800'
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-steel-200 dark:border-steel-700 disabled:opacity-40 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors"
            >
              <HiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
