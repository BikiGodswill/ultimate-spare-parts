'use client'
/**
 * app/admin/page.js
 * Admin dashboard — all data operations go through API routes
 * so the service role key is NEVER needed in the browser.
 *
 * Before (broken): client → productController → getSupabaseServerClient() ← browser can't access
 * After  (fixed):  client → fetch('/api/...') → API route → getSupabaseServerClient() ← server only ✓
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HiPlus, HiRefresh, HiCurrencyDollar, HiShoppingCart,
  HiCube, HiArrowRight,
} from 'react-icons/hi'
import { MdInventory } from 'react-icons/md'
import toast from 'react-hot-toast'

import PageTransition from '@/components/animations/PageTransition'
import AdminProductTable from '@/components/admin/AdminProductTable'
import ProductForm from '@/components/admin/ProductForm'
import Modal from '@/components/ui/Modal'
import FadeIn from '@/components/animations/FadeIn'
import { useAuth } from '@/context/AuthContext'
import { getAuthToken } from '@/lib/adminAuth'
import { formatPrice, formatDate } from '@/utils/formatters'
import { ORDER_STATUS_COLORS } from '@/lib/constants'

// ─── Thin API helpers (all run server-side via fetch) ────────
async function apiFetch(path, options = {}) {
  const token = await getAuthToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

const api = {
  // Products — calls /api/products which uses getSupabaseServerClient() server-side
  getProducts: () =>
    apiFetch('/api/products?limit=200&sortBy=created_at&sortOrder=desc')
      .then(r => r.products || []),

  createProduct: (data) =>
    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id, data) =>
    apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProduct: (id) =>
    apiFetch(`/api/products/${id}`, { method: 'DELETE' }),

  // Orders — calls /api/admin/orders which uses getSupabaseServerClient() server-side
  getOrders: () =>
    apiFetch('/api/admin/orders?limit=20')
      .then(r => r.orders || []),
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()

  const [products,      setProducts]      = useState([])
  const [orders,        setOrders]        = useState([])
  const [loadingData,   setLoadingData]   = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [activeTab,     setActiveTab]     = useState('products')

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/auth/login')
    }
  }, [user, isAdmin, authLoading, router])

  // ── Load data via API routes (server-side) ────────────────
  useEffect(() => {
    if (isAdmin) loadData()
  }, [isAdmin])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const [prods, ords] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getOrders().catch(() => []),
      ])
      setProducts(prods)
      setOrders(ords)
    } catch (err) {
      toast.error('Failed to load dashboard data')
      console.error('[Admin] loadData error:', err)
    } finally {
      setLoadingData(false)
    }
  }

  // ── CRUD handlers — all go through API routes ─────────────
  const handleCreateProduct = async (data) => {
    setActionLoading(true)
    try {
      await api.createProduct(data)
      toast.success('Product created!', {
        icon: '✅',
        style: { background: '#1f1f1f', color: '#f5f5f5', border: '1px solid #f97316' },
      })
      setShowAddModal(false)
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to create product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateProduct = async (id, data) => {
    setActionLoading(true)
    try {
      await api.updateProduct(id, data)
      toast.success('Product updated!')
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to update product')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    setActionLoading(true)
    try {
      await api.deleteProduct(id)
      toast.success('Product deleted')
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Loading / auth spinner ────────────────────────────────
  if (authLoading || (!isAdmin && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Stats ─────────────────────────────────────────────────
  const totalRevenue = orders
    .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
    .reduce((s, o) => s + (o.total || 0), 0)

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: <HiCurrencyDollar size={22} />, color: 'text-green-500' },
    { label: 'Total Orders',  value: orders.length,             icon: <HiShoppingCart size={22} />,  color: 'text-blue-500'  },
    { label: 'Products',      value: products.length,           icon: <HiCube size={22} />,           color: 'text-brand-500' },
    { label: 'In Stock',      value: products.filter(p => (p.stock ?? 1) > 0).length, icon: <MdInventory size={22} />, color: 'text-purple-500' },
  ]

  // ─────────────────────────────────────────────────────────
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ───────────────────────────────────── */}
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-heading font-semibold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Admin Panel
              </div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100">
                Dashboard
              </h1>
              <p className="text-steel-500 text-sm mt-1">Welcome back, {user?.email}</p>
            </div>

            <button
              onClick={loadData}
              disabled={loadingData}
              className="p-2.5 rounded-xl border border-steel-200 dark:border-steel-700 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors text-steel-500 disabled:opacity-40"
              title="Refresh"
            >
              <HiRefresh size={18} className={loadingData ? 'animate-spin' : ''} />
            </button>
          </div>
        </FadeIn>

        {/* ── Quick links ───────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-glow-sm"
          >
            <HiShoppingCart size={16} />
            Order Management
            <HiArrowRight size={14} />
          </Link>
        </div>

        {/* ── Stats grid ────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-5"
            >
              <div className="mb-3">
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="font-heading font-bold text-2xl text-steel-900 dark:text-steel-100">
                {stat.value}
              </div>
              <div className="text-sm text-steel-500 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ──────────────────────────────────────── */}
        <div className="flex gap-1 border-b border-steel-200 dark:border-steel-800 mb-6">
          {['products', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-heading font-semibold text-sm uppercase tracking-wide transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-brand-500 border-brand-500'
                  : 'text-steel-500 border-transparent hover:text-steel-800 dark:hover:text-steel-200'
              }`}
            >
              {tab}{' '}
              <span className="opacity-60">
                ({tab === 'products' ? products.length : orders.length})
              </span>
            </button>
          ))}
        </div>

        {/* ── Products tab ──────────────────────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-steel-900 dark:text-steel-100">
                Product Management
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-glow-sm"
              >
                <HiPlus size={18} />
                Add Product
              </button>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <AdminProductTable
                products={products}
                onEdit={handleUpdateProduct}
                onDelete={handleDeleteProduct}
                loading={actionLoading}
              />
            )}
          </div>
        )}

        {/* ── Orders tab ────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-steel-900 dark:text-steel-100">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                View all →
              </Link>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="card p-12 text-center">
                <HiShoppingCart size={40} className="mx-auto text-steel-300 dark:text-steel-600 mb-3" />
                <p className="font-heading font-bold text-xl text-steel-700 dark:text-steel-300">
                  No Orders Yet
                </p>
                <p className="text-steel-400 text-sm mt-1">
                  Orders will appear here after customers checkout.
                </p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-steel-50 dark:bg-steel-800/50 border-b border-steel-200 dark:border-steel-700">
                      <tr>
                        {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-heading font-semibold text-steel-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                      {orders.map(order => (
                        <tr
                          key={order.id}
                          className="hover:bg-steel-50 dark:hover:bg-steel-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-steel-500">
                            #{order.id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-steel-700 dark:text-steel-300 max-w-[160px] truncate">
                            {order.full_name || order.email || '—'}
                          </td>
                          <td className="px-4 py-3 text-steel-500">
                            {order.items?.length || 0}
                          </td>
                          <td className="px-4 py-3 font-heading font-bold text-brand-500">
                            {formatPrice(order.total || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              ORDER_STATUS_COLORS[order.status] || 'bg-steel-100 text-steel-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-steel-400 text-xs whitespace-nowrap">
                            {formatDate(order.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Add product modal ─────────────────────────── */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Product"
          size="lg"
        >
          <ProductForm
            onSubmit={handleCreateProduct}
            onCancel={() => setShowAddModal(false)}
            loading={actionLoading}
          />
        </Modal>

      </div>
    </PageTransition>
  )
}
