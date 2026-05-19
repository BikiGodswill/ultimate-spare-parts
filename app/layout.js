/**
 * app/layout.js
 * Root layout — all global components wired in:
 *   TopProgressBar, AnnouncementBar, Navbar, Footer,
 *   LiveChat (Tawk.to), CookieBanner, BackToTop,
 *   FloatingWhatsApp, ErrorBoundary
 */

import { Toaster } from 'react-hot-toast'
import Navbar           from '@/components/layout/Navbar'
import Footer           from '@/components/layout/Footer'
import { ThemeProvider }    from '@/context/ThemeContext'
import { CartProvider }     from '@/context/CartContext'
import { AuthProvider }     from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import ErrorBoundary    from '@/components/ui/ErrorBoundary'
import TopProgressBar   from '@/components/ui/TopProgressBar'
import AnnouncementBar  from '@/components/ui/AnnouncementBar'
import CookieBanner     from '@/components/ui/CookieBanner'
import BackToTop        from '@/components/ui/BackToTop'
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp'
import LiveChat         from '@/components/ui/LiveChat'
import './globals.css'

export const metadata = {
  title: {
    default:  'Ultimate Spare Parts — Premium Auto Parts',
    template: '%s | Ultimate Spare Parts',
  },
  description:
    'Shop premium quality automotive spare parts. Engine, brakes, suspension, electrical, and more. Fast shipping, easy returns.',
  keywords: ['auto parts', 'spare parts', 'car parts', 'engine parts', 'brakes', 'suspension'],
  authors:  [{ name: 'Ultimate Spare Parts' }],

  icons: {
    icon: [
      { url: '/favicon.ico',       sizes: 'any'               },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg',          type: 'image/svg+xml'      },
    ],
    apple:    [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: [{ url: '/favicon.ico' }],
  },

  manifest: '/site.webmanifest',

  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#111111' },
  ],

  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         process.env.NEXT_PUBLIC_APP_URL,
    siteName:    'Ultimate Spare Parts',
    title:       'Ultimate Spare Parts — Premium Auto Parts',
    description: 'Shop premium quality automotive spare parts.',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Ultimate Spare Parts' }],
  },

  twitter: {
    card:        'summary',
    title:       'Ultimate Spare Parts',
    description: 'Shop premium quality automotive spare parts.',
    images:      ['/icon-512.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme init script — prevents colour flash on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('usp-theme');var th=t==='dark'||t==='light'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.classList.toggle('dark',th==='dark')}catch(e){document.documentElement.classList.remove('dark')}})();`,
          }}
        />
      </head>

      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] font-body antialiased">
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>

                  {/* ── Top UI chrome ─────────────────────── */}
                  <TopProgressBar />
                  <AnnouncementBar />

                  {/* ── Main layout ───────────────────────── */}
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>

                  {/* ── Floating widgets ──────────────────── */}
                  <FloatingWhatsApp />
                  <BackToTop />
                  <CookieBanner />

                  {/* ── Live chat (Tawk.to) ───────────────── */}
                  <LiveChat />

                  {/* ── Toast notifications ───────────────── */}
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 3000,
                      style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
                      success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
                    }}
                  />

                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
