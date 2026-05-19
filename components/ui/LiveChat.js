'use client'
/**
 * components/ui/LiveChat.js
 * Tawk.to live chat widget — loads lazily after page is interactive.
 *
 * Setup:
 *  1. Sign up free at https://tawk.to
 *  2. Create a property → copy the Property ID and Widget/Chat ID
 *  3. Add to Vercel env vars:
 *       NEXT_PUBLIC_TAWK_PROPERTY_ID = your-property-id
 *       NEXT_PUBLIC_TAWK_WIDGET_ID   = default  (or your custom widget id)
 *
 * If env vars are not set the component renders nothing (no errors).
 */

import Script from 'next/script'
import { useEffect } from 'react'

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
const WIDGET_ID   = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || 'default'

export default function LiveChat() {
  // Nothing to render if not configured
  if (!PROPERTY_ID) return null

  const src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`

  return (
    <Script
      id="tawk-to"
      strategy="lazyOnload"
      src={src}
      crossOrigin="*"
      onLoad={() => {
        // Optionally customise the widget once it loads
        if (typeof window !== 'undefined' && window.Tawk_API) {
          window.Tawk_API.onLoad = function () {
            // e.g. window.Tawk_API.setAttributes({ name: 'Guest' }, cb)
          }
        }
      }}
    />
  )
}
