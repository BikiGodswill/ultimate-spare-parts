'use client'
/**
 * app/orders/page.js
 * User order history page
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HiShoppingBag, HiArrowRight, HiChevronDown } from 'react-icons/hi'
import PageTransition from '@/components/animations/PageTransition'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { getUserOrders } from '@/controllers/orderController'
import { formatPrice, formatDate, formatOrderId } from '@/utils/formatters'
import { ORDER_STATUS_COLORS } from '@/lib/constants'

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    getUserOrders(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-steel-900 dark:text-steel-100 flex items-center gap-3">
            <HiShoppingBag size={32} className="text-brand-500" />
            My Orders
          </h1>
          {orders.length > 0 && (
            <p className="text-steel-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          )}
        </div>

        {/* Empty */}
        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-steel-100 dark:bg-steel-800 flex items-center justify-center mb-6">
              <HiShoppingBag size={44} className="text-steel-300 dark:text-steel-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-steel-700 dark:text-steel-300 mb-2">
              No Orders Yet
            </h2>
            <p className="text-steel-400 mb-8 max-w-sm">
              You haven&#39;t placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/products">
              <Button icon={<HiArrowRight size={18} />} iconPosition="right">Browse Products</Button>
            </Link>
          </motion.div>
        )}

        {/* Orders list */}
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card overflow-hidden"
            >
              {/* Order Header */}
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-steel-50 dark:hover:bg-steel-800/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="font-mono text-xs text-steel-400">Order</p>
                    <p className="font-heading font-bold text-steel-900 dark:text-steel-100">
                      {formatOrderId(order.id)}
                    </p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-steel-200 dark:bg-steel-700" />
                  <div>
                    <p className="text-xs text-steel-400">Placed</p>
                    <p className="text-sm font-medium text-steel-700 dark:text-steel-300">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-steel-200 dark:bg-steel-700" />
                  <div>
                    <p className="text-xs text-steel-400">Total</p>
                    <p className="font-heading font-bold text-brand-500">
                      {formatPrice(order.total || 0)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${ORDER_STATUS_COLORS[order.status] || 'bg-steel-100 text-steel-600'}`}>
                    {order.status}
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: expandedId === order.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-steel-400 flex-shrink-0"
                >
                  <HiChevronDown size={20} />
                </motion.span>
              </button>

              {/* Expanded Details */}
              {expandedId === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-steel-200 dark:border-steel-800"
                >
                  <div className="p-5 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-steel-700 dark:text-steel-300 mb-3 uppercase tracking-wide">
                        Items Ordered
                      </h4>
                      <div className="space-y-2">
                        {(order.items || []).map((item, j) => (
                          <div key={j} className="flex items-center gap-3">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-steel-800 dark:text-steel-200 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-steel-400">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <span className="font-heading font-bold text-sm text-steel-800 dark:text-steel-200 flex-shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping */}
                    {order.shipping_address && (
                      <div className="pt-3 border-t border-steel-100 dark:border-steel-800">
                        <h4 className="font-heading font-semibold text-sm text-steel-700 dark:text-steel-300 mb-2 uppercase tracking-wide">
                          Shipped To
                        </h4>
                        <address className="text-sm text-steel-600 dark:text-steel-400 not-italic">
                          {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                          {order.shipping_address.address}<br />
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}<br />
                          {order.shipping_address.country}
                        </address>
                      </div>
                    )}

                    {/* Order totals */}
                    <div className="pt-3 border-t border-steel-100 dark:border-steel-800 space-y-1.5 text-sm">
                      {order.subtotal && (
                        <div className="flex justify-between text-steel-500">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                      )}
                      {order.shipping_cost !== undefined && (
                        <div className="flex justify-between text-steel-500">
                          <span>Shipping</span>
                          <span>{order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</span>
                        </div>
                      )}
                      {order.tax && (
                        <div className="flex justify-between text-steel-500">
                          <span>Tax</span>
                          <span>{formatPrice(order.tax)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-heading font-bold text-steel-900 dark:text-steel-100 pt-1 border-t border-steel-200 dark:border-steel-700">
                        <span>Total</span>
                        <span className="text-brand-500">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
