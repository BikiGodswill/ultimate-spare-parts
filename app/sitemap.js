/**
 * app/sitemap.js
 * Dynamic XML sitemap — crawled by Google / Bing at /sitemap.xml
 * Includes all static pages + every product URL.
 */

import { getSupabaseServerClient } from '@/lib/supabase'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://ultimatesparepartss.com'

export default async function sitemap() {
  // ── Static pages ─────────────────────────────────────────
  const staticPages = [
    { url: BASE,               priority: 1.0,  changeFrequency: 'weekly'  },
    { url: `${BASE}/products`, priority: 0.9,  changeFrequency: 'daily'   },
    { url: `${BASE}/cart`,     priority: 0.5,  changeFrequency: 'monthly' },
    { url: `${BASE}/wishlist`, priority: 0.5,  changeFrequency: 'monthly' },
    { url: `${BASE}/about`,    priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${BASE}/contact`,  priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE}/faq`,      priority: 0.6,  changeFrequency: 'monthly' },
    { url: `${BASE}/shipping`, priority: 0.5,  changeFrequency: 'monthly' },
    { url: `${BASE}/returns`,  priority: 0.5,  changeFrequency: 'monthly' },
    { url: `${BASE}/privacy`,  priority: 0.3,  changeFrequency: 'yearly'  },
    { url: `${BASE}/terms`,    priority: 0.3,  changeFrequency: 'yearly'  },
  ].map(p => ({ ...p, lastModified: new Date() }))

  // ── Dynamic product pages ─────────────────────────────────
  let productPages = []
  try {
    const supabase = getSupabaseServerClient()
    const { data } = await supabase
      .from('products')
      .select('id, updated_at')
      .order('created_at', { ascending: false })

    productPages = (data || []).map(p => ({
      url:             `${BASE}/products/${p.id}`,
      lastModified:    new Date(p.updated_at || Date.now()),
      changeFrequency: 'weekly',
      priority:        0.8,
    }))
  } catch {
    // Non-fatal — sitemap works without product pages
  }

  return [...staticPages, ...productPages]
}
