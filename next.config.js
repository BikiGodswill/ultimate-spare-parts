/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // Tell Next.js NOT to bundle these Node.js-only packages into client code.
  // pdfkit and nodemailer use Node.js core modules (fs, net, crypto)
  // that don't exist in the browser.
  serverExternalPackages: ['pdfkit', 'nodemailer', 'canvas'],

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', process.env.NEXT_PUBLIC_APP_URL].filter(Boolean),
    },
  },

  // Silence noisy webpack warnings about optional native modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace Node.js-only modules with empty stubs on the client bundle
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
