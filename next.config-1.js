/** @type {import('next').NextConfig} */
const nextConfig = {

  // ─── Images ────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },

  // ─── Experimental ──────────────────────────────────────────
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean),
    },

    // Keep pdfkit and nodemailer out of the client bundle.
    // These are Node.js-only packages used only in API routes.
    // NOTE: plural "Packages" — a common typo is "Package" (singular) which breaks.
    serverComponentsExternalPackages: ['pdfkit', 'nodemailer'],
  },

  // ─── Webpack fallbacks ─────────────────────────────────────
  // Prevent webpack from trying to polyfill Node.js built-ins
  // when it encounters them in server-only code paths.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:     false,
        net:    false,
        tls:    false,
        crypto: false,
        stream: false,
        path:   false,
        os:     false,
        zlib:   false,
      }
    }
    return config
  },
}

module.exports = nextConfig
