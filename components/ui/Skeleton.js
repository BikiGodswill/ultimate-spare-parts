'use client'
/**
 * components/ui/Skeleton.js
 * Skeleton loader components for loading states
 */

import { cn } from '@/utils/helpers'

// ─── Base Skeleton ────────────────────────────────────────────
export default function Skeleton({ className = '', rounded = false }) {
  return (
    <div className={cn(
      'shimmer',
      rounded ? 'rounded-full' : 'rounded-md',
      className,
    )} />
  )
}

// ─── Product Card Skeleton ────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-56 w-full rounded-b-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ─── Product Detail Skeleton ──────────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="space-y-5">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ─── Row Skeleton ─────────────────────────────────────────────
export function RowSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 card">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}
