'use client'
/**
 * context/CartContext.js
 * Shopping cart context — persisted in localStorage
 */

import { createContext, useContext, useEffect, useReducer } from 'react'
import toast from 'react-hot-toast'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/utils/helpers'

const CART_KEY = 'usp-cart'

// ─── Reducer ──────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload

    case 'ADD': {
      const existing = state.find(item => item.id === action.payload.id)
      if (existing) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        )
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }]
    }

    case 'REMOVE':
      return state.filter(item => item.id !== action.payload)

    case 'UPDATE_QTY':
      if (action.payload.quantity <= 0) {
        return state.filter(item => item.id !== action.payload.id)
      }
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )

    case 'CLEAR':
      return []

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = safeLocalStorageGet(CART_KEY, [])
    if (saved.length) dispatch({ type: 'LOAD', payload: saved })
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    safeLocalStorageSet(CART_KEY, items)
  }, [items])

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD', payload: { ...product, quantity } })
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#1f1f1f',
        color: '#f5f5f5',
        border: '1px solid #f97316',
      },
    })
  }

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE', payload: productId })
    toast.success('Item removed from cart')
  }

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id: productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
  }

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const isInCart = (productId) => items.some(i => i.id === productId)

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
