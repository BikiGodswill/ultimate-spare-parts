/**
 * hooks/useProducts.js
 * SWR-powered hook for fetching products with caching
 */

import useSWR from 'swr'
import { fetchProducts, fetchFeaturedProducts } from '@/models/Product'

// ─── Fetcher helpers ──────────────────────────────────────────
const productFetcher = (key) => {
  const params = JSON.parse(key)
  return fetchProducts(params)
}

// ─── useProducts hook ─────────────────────────────────────────
export function useProducts(params = {}) {
  const key = JSON.stringify(params)
  const { data, error, isLoading, mutate } = useSWR(
    ['products', key],
    () => fetchProducts(params),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  )

  return {
    products: data?.products || [],
    total: data?.total || 0,
    loading: isLoading,
    error,
    mutate,
  }
}

// ─── useFeaturedProducts hook ─────────────────────────────────
export function useFeaturedProducts(limit = 8) {
  const { data, error, isLoading } = useSWR(
    ['featured-products', limit],
    () => fetchFeaturedProducts(limit),
    { revalidateOnFocus: false }
  )

  return {
    products: data || [],
    loading: isLoading,
    error,
  }
}
