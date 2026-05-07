'use client'
/**
 * components/admin/AdminProductTable.js
 * Table component for managing products in admin panel
 */

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPencil, HiTrash, HiStar, HiCheck } from 'react-icons/hi'
import { MdInventory } from 'react-icons/md'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import ProductForm from './ProductForm'
import { formatPrice, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/helpers'

export default function AdminProductTable({ products, onEdit, onDelete, loading }) {
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleDeleteClick = (product) => setConfirmDelete(product)

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
      await onDelete(confirmDelete.id)
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  const handleEditSubmit = async (data) => {
    await onEdit(editingProduct.id, data)
    setEditingProduct(null)
  }

  if (!products.length) {
    return (
      <div className="card p-12 text-center">
        <MdInventory size={48} className="mx-auto text-steel-300 dark:text-steel-600 mb-3" />
        <p className="font-heading font-bold text-xl text-steel-700 dark:text-steel-300">No Products Yet</p>
        <p className="text-steel-400 text-sm mt-1">Add your first product using the form above.</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel-50 dark:bg-steel-800/50 border-b border-steel-200 dark:border-steel-700">
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Added', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-heading font-semibold text-steel-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
              <AnimatePresence>
                {products.map(product => {
                  const avgRating = product.reviews?.length
                    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
                    : null

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-steel-50 dark:hover:bg-steel-800/30 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-steel-100 dark:bg-steel-800 flex-shrink-0 relative">
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-steel-400 text-xs">IMG</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-steel-900 dark:text-steel-100 line-clamp-1">
                              {product.name}
                            </p>
                            {product.is_featured && (
                              <span className="text-xs text-brand-500">⭐ Featured</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <Badge variant="primary">{product.category}</Badge>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-heading font-bold text-brand-500">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          'font-medium',
                          product.stock === 0 ? 'text-red-500' :
                          product.stock <= 5 ? 'text-yellow-500' :
                          'text-green-600 dark:text-green-400'
                        )}>
                          {product.stock ?? '∞'}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3">
                        {avgRating ? (
                          <div className="flex items-center gap-1">
                            <HiStar className="text-yellow-400" size={14} />
                            <span className="text-steel-600 dark:text-steel-400">{avgRating}</span>
                            <span className="text-steel-400 text-xs">({product.reviews?.length})</span>
                          </div>
                        ) : (
                          <span className="text-steel-400 text-xs">No reviews</span>
                        )}
                      </td>

                      {/* Added */}
                      <td className="px-4 py-3 text-steel-400 text-xs">
                        {formatDate(product.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-steel-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <HiPencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            disabled={deletingId === product.id}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-steel-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          >
                            <HiTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {products.map(product => (
          <div key={product.id} className="card p-4 flex gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-steel-100 dark:bg-steel-800 flex-shrink-0 relative">
              {product.image_url && (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="64px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-steel-900 dark:text-steel-100 text-sm truncate">{product.name}</p>
              <p className="text-brand-500 font-bold text-sm">{formatPrice(product.price)}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => setEditingProduct(product)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <HiPencil size={14} />
                </button>
                <button onClick={() => handleDeleteClick(product)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                  <HiTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        size="lg"
      >
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingProduct(null)}
            loading={loading}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-steel-600 dark:text-steel-400">
            Are you sure you want to delete <strong className="text-steel-900 dark:text-steel-100">{confirmDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteConfirm}
              disabled={!!deletingId}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-heading font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {deletingId ? 'Deleting...' : 'Delete Product'}
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 py-2.5 bg-steel-100 dark:bg-steel-800 hover:bg-steel-200 dark:hover:bg-steel-700 font-heading font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
