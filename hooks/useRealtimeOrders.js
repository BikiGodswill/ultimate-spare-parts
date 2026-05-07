'use client'
/**
 * hooks/useRealtimeOrders.js
 * Supabase Realtime subscription for live order updates.
 * Requires "Enable Realtime" on the orders table in Supabase dashboard
 * and running: ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
 */

import { useEffect, useRef, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase'

/**
 * useRealtimeOrders(callbacks)
 *
 * @param {object} callbacks
 * @param {(order: object) => void} callbacks.onInsert  — called when a new order is inserted
 * @param {(order: object) => void} callbacks.onUpdate  — called when an order is updated
 * @param {(order: object) => void} callbacks.onDelete  — called when an order is deleted
 *
 * Returns: { unsubscribe }
 */
export function useRealtimeOrders({ onInsert, onUpdate, onDelete } = {}) {
  const channelRef = useRef(null)

  const subscribe = useCallback(() => {
    const supabase = getSupabaseBrowserClient()

    channelRef.current = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        payload => { onInsert?.(payload.new) }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        payload => { onUpdate?.(payload.new) }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        payload => { onDelete?.(payload.old) }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to orders channel')
        }
      })
  }, [onInsert, onUpdate, onDelete])

  useEffect(() => {
    subscribe()
    return () => {
      if (channelRef.current) {
        const supabase = getSupabaseBrowserClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [subscribe])

  return {
    unsubscribe: () => {
      if (channelRef.current) {
        const supabase = getSupabaseBrowserClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    },
  }
}
