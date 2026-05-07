/**
 * app/layout.js
 * Root layout — wraps all pages with providers, navbar, footer
 */

import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ThemeProvider } from '@/context/ThemeContext'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { WishlistProvider } from '@/context/WishlistContext'
import './globals.css'

export const metadata = {
  title: {
    default: 'Ultimate Spare Parts — Premium Auto Parts',
    template: '%s | Ultimate Spare Parts',
  },
  description:
    'Shop premium quality automotive spare parts. Engine, brakes, suspension, electrical, and more. Fast shipping, easy returns.',
  keywords: ['auto parts', 'spare parts', 'car parts', 'engine parts', 'brakes', 'suspension'],
  authors: [{ name: 'Ultimate Spare Parts' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Ultimate Spare Parts',
    title: 'Ultimate Spare Parts — Premium Auto Parts',
    description: 'Shop premium quality automotive spare parts.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ultimate Spare Parts',
    description: 'Shop premium quality automotive spare parts.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('usp-theme');
                if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.classList.toggle('dark', t === 'dark');
              } catch(e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] font-body antialiased">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>

                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 3000,
                    className: 'react-hot-toast-custom',
                    style: {
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '14px',
                    },
                    success: {
                      iconTheme: { primary: '#f97316', secondary: '#fff' },
                    },
                  }}
                />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
