'use client'
/**
 * components/product/ProductReviews.js
 * Product review list + add review form
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { HiUser } from 'react-icons/hi'
import { StarDisplay, StarInput } from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import { createReview } from '@/models/Review'
import { useAuth } from '@/context/AuthContext'
import { validateReview, hasErrors } from '@/utils/validators'
import { formatRelativeDate } from '@/utils/formatters'

export default function ProductReviews({ productId, reviews = [], onReviewAdded }) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ rating: 0, comment: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const handleSubmit = async () => {
    const errs = validateReview(form)
    if (hasErrors(errs)) { setErrors(errs); return }

    setSubmitting(true)
    try {
      await createReview({
        productId,
        userId: user.id,
        rating: form.rating,
        comment: form.comment,
      })
      toast.success('Review submitted! Thank you.')
      setForm({ rating: 0, comment: '' })
      setShowForm(false)
      onReviewAdded?.()
    } catch (err) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-steel-50 dark:bg-steel-900/50 rounded-2xl border border-steel-200 dark:border-steel-800">
        <div className="text-center">
          <div className="font-heading font-bold text-5xl text-steel-900 dark:text-steel-100">
            {avgRating.toFixed(1)}
          </div>
          <StarDisplay rating={avgRating} size="md" className="justify-center mt-1" />
          <p className="text-sm text-steel-500 mt-1">{reviews.length} reviews</p>
        </div>

        {/* Rating bars */}
        <div className="flex-1 space-y-2 w-full">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length
            const pct = reviews.length ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-steel-500 text-right">{star}</span>
                <span className="text-yellow-400 text-xs">★</span>
                <div className="flex-1 h-2 bg-steel-200 dark:bg-steel-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-steel-400 text-xs">{count}</span>
              </div>
            )
          })}
        </div>

        {user && (
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'secondary' : 'primary'}
            size="sm"
          >
            {showForm ? 'Cancel' : 'Write Review'}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 card space-y-4"
        >
          <h3 className="font-heading font-bold text-lg">Your Review</h3>

          <div>
            <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-2">
              Rating *
            </label>
            <StarInput
              value={form.rating}
              onChange={rating => setForm(f => ({ ...f, rating }))}
            />
            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-2">
              Comment *
            </label>
            <textarea
              rows={4}
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              className="input-field resize-none"
            />
            {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment}</p>}
            <p className="text-xs text-steel-400 mt-1">{form.comment.length}/1000</p>
          </div>

          <Button onClick={handleSubmit} loading={submitting} size="sm">
            Submit Review
          </Button>
        </motion.div>
      )}

      {!user && (
        <p className="text-sm text-steel-500 text-center py-4">
          <a href="/auth/login" className="text-brand-500 hover:underline">Sign in</a> to write a review.
        </p>
      )}

      {/* Review List */}
      <div className="space-y-5">
        {reviews.length === 0 && !showForm && (
          <p className="text-steel-400 text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        )}

        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 card"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                <HiUser size={18} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-steel-900 dark:text-steel-100 text-sm">
                    {review.users?.email?.split('@')[0] || 'Customer'}
                  </span>
                  <span className="text-xs text-steel-400">{formatRelativeDate(review.created_at)}</span>
                </div>
                <StarDisplay rating={review.rating} size="sm" className="mt-0.5 mb-2" />
                <p className="text-sm text-steel-700 dark:text-steel-300 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
