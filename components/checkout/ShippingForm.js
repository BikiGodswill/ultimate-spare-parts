'use client'
/**
 * components/checkout/ShippingForm.js
 * Shipping address form for checkout
 */

import { useState } from 'react'
import { SHIPPING_OPTIONS, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { formatPrice } from '@/utils/formatters'
import { cn } from '@/utils/helpers'

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France']

export default function ShippingForm({ data, errors, onChange, cartTotal, selectedShipping, onShippingChange }) {
  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={data[name] || ''}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={cn(
          'input-field',
          errors[name] && 'border-red-500 focus:ring-red-500'
        )}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Contact */}
      <section>
        <h3 className="font-heading font-bold text-base text-steel-900 dark:text-steel-100 mb-4 pb-2 border-b border-steel-200 dark:border-steel-800 uppercase tracking-wide">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('firstName', 'First Name', 'text', 'John')}
          {field('lastName', 'Last Name', 'text', 'Doe')}
          {field('email', 'Email Address', 'email', 'john@example.com')}
          {field('phone', 'Phone (optional)', 'tel', '+1 (555) 000-0000')}
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 className="font-heading font-bold text-base text-steel-900 dark:text-steel-100 mb-4 pb-2 border-b border-steel-200 dark:border-steel-800 uppercase tracking-wide">
          Shipping Address
        </h3>
        <div className="space-y-4">
          {field('address', 'Street Address', 'text', '123 Main Street')}
          {field('address2', 'Apartment, suite, etc. (optional)', 'text', 'Apt 4B')}
          <div className="grid grid-cols-2 gap-4">
            {field('city', 'City', 'text', 'Detroit')}
            {field('state', 'State / Province', 'text', 'MI')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('zip', 'ZIP / Postal Code', 'text', '48201')}
            <div>
              <label className="block text-sm font-medium text-steel-700 dark:text-steel-300 mb-1.5">
                Country
              </label>
              <select
                name="country"
                value={data.country || 'United States'}
                onChange={e => onChange('country', e.target.value)}
                className="input-field"
              >
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Method */}
      <section>
        <h3 className="font-heading font-bold text-base text-steel-900 dark:text-steel-100 mb-4 pb-2 border-b border-steel-200 dark:border-steel-800 uppercase tracking-wide">
          Shipping Method
        </h3>
        <div className="space-y-3">
          {cartTotal >= FREE_SHIPPING_THRESHOLD && (
            <label className="flex items-center gap-4 p-4 card cursor-pointer border-2 border-brand-500">
              <input type="radio" name="shipping" value="free" checked={selectedShipping === 'free'} onChange={() => onShippingChange('free')} className="text-brand-500" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Free Shipping (5–7 days)</span>
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">FREE</span>
                </div>
                <p className="text-xs text-steel-400 mt-0.5">You qualified for free shipping!</p>
              </div>
            </label>
          )}
          {SHIPPING_OPTIONS.map(opt => (
            <label key={opt.id} className={cn(
              'flex items-center gap-4 p-4 card cursor-pointer border-2 transition-colors',
              selectedShipping === opt.id
                ? 'border-brand-500'
                : 'border-transparent hover:border-steel-300 dark:hover:border-steel-600'
            )}>
              <input
                type="radio"
                name="shipping"
                value={opt.id}
                checked={selectedShipping === opt.id}
                onChange={() => onShippingChange(opt.id)}
                className="text-brand-500"
              />
              <div className="flex-1 flex justify-between items-center">
                <span className="text-sm font-medium text-steel-800 dark:text-steel-200">{opt.label}</span>
                <span className="font-bold text-sm text-brand-500">{formatPrice(opt.price)}</span>
              </div>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}
