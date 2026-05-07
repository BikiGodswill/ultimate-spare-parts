/**
 * hooks/useLocalStorage.js
 * Custom hook for localStorage state that's SSR-safe
 */

import { useState, useEffect } from 'react'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/utils/helpers'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage after hydration
  useEffect(() => {
    const item = safeLocalStorageGet(key, initialValue)
    setStoredValue(item)
    setHydrated(true)
  }, [key])

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    safeLocalStorageSet(key, valueToStore)
  }

  return [storedValue, setValue, hydrated]
}
