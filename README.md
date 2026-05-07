# 🔧 Ultimate Spare Parts

A production-ready e-commerce application for automotive spare parts, built with **Next.js 14 App Router**, **Supabase**, **Stripe**, **Tailwind CSS**, and **Framer Motion**.

---

## 🗂️ Project Structure

```
/ultimate-spare-parts
├── app/                      # Next.js App Router pages + API routes
│   ├── page.js               # Homepage (hero, categories, featured)
│   ├── products/
│   │   ├── page.js           # Product listing + filters
│   │   └── [id]/page.js      # Product detail + reviews
│   ├── cart/page.js          # Shopping cart
│   ├── checkout/
│   │   ├── page.js           # Checkout + shipping form
│   │   ├── success/page.js   # Order confirmation
│   │   └── cancel/page.js    # Cancelled payment
│   ├── admin/page.js         # Admin dashboard
│   ├── auth/
│   │   ├── login/page.js     # Sign in
│   │   └── signup/page.js    # Create account
│   ├── wishlist/page.js      # Saved products
│   ├── orders/page.js        # Order history
│   └── api/                  # REST API routes
│       ├── checkout/route.js
│       ├── stripe/webhook/route.js
│       ├── products/route.js
│       └── reviews/route.js
├── components/               # React components
│   ├── animations/           # Framer Motion wrappers
│   ├── admin/                # Admin panel components
│   ├── cart/                 # Cart components
│   ├── checkout/             # Checkout components
│   ├── layout/               # Navbar, Footer
│   ├── product/              # Product cards, grid, filters, reviews
│   └── ui/                   # Button, Badge, Modal, Skeleton, etc.
├── context/                  # React Context providers
│   ├── ThemeContext.js       # Dark/light mode
│   ├── CartContext.js        # Shopping cart (localStorage)
│   ├── AuthContext.js        # Supabase auth
│   └── WishlistContext.js    # Wishlist
├── controllers/              # Business logic (MVC)
│   ├── productController.js
│   ├── orderController.js
│   └── authController.js
├── models/                   # Supabase data layer (MVC)
│   ├── Product.js
│   ├── Order.js
│   ├── Review.js
│   └── Wishlist.js
├── hooks/                    # Custom React hooks
├── lib/                      # Shared libraries (supabase, stripe, constants)
├── services/                 # External service wrappers
├── utils/                    # Pure utility functions
└── supabase_schema.sql       # Complete DB schema
```

---

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd ultimate-spare-parts
npm install
```

### 2. Set up Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAIL=admin@yoursite.com
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase_schema.sql`
3. Go to **Storage** → create a bucket named `product-images` (set to public)
4. Copy your **Project URL** and **API keys** from Settings → API

### 4. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Copy your **Publishable Key** and **Secret Key** from the dashboard
3. For webhooks (local development):
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret from the CLI output

### 5. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔐 Admin Access

The admin panel is at `/admin` and is protected. To set up your admin account:

1. Create an account through `/auth/signup` using the email in `NEXT_PUBLIC_ADMIN_EMAIL`
2. OR add `role: 'admin'` to any user's `user_metadata` in Supabase Auth

The admin can:
- Add / edit / delete products with image uploads
- View all orders and revenue stats
- Manage product inventory and featured status

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

In your Vercel project settings, add all environment variables from `.env.local`.

**Important for Stripe Webhooks in production:**
1. Go to Stripe Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-domain.vercel.app/api/stripe/webhook`
3. Events to listen for: `checkout.session.completed`
4. Copy the webhook signing secret to your Vercel env vars

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `products` | Product catalog (name, price, category, stock, image) |
| `reviews` | Product reviews (rating, comment, user) |
| `orders` | Customer orders with Stripe session IDs |
| `wishlists` | User saved products |

---

## 🧱 Architecture (MVC)

- **Models** (`/models`) — Raw Supabase queries. No business logic.
- **Controllers** (`/controllers`) — Business logic, validation, orchestration.
- **Views** (`/app`, `/components`) — React components and pages.
- **API Routes** (`/app/api`) — REST endpoints calling controllers.

---

## 🎨 Design System

- **Primary color**: Orange `#f97316` (brand-500)
- **Dark background**: `#0f0f0f` (steel-950)
- **Font (headings)**: Rajdhani
- **Font (body)**: DM Sans
- **Dark mode**: Toggled via class on `<html>`, persisted to localStorage

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 App Router | Framework |
| Supabase | Database, Auth, Storage |
| Stripe | Payment processing |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Icons | Icon library |
| React Hot Toast | Notifications |
| SWR | Data fetching + caching |
| date-fns | Date formatting |

---

## 📝 Customization

### Adding Product Categories
Edit `lib/constants.js` → `CATEGORIES` array.

### Changing Admin Email
Update `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local`.

### Shipping Options
Edit `lib/constants.js` → `SHIPPING_OPTIONS` and `FREE_SHIPPING_THRESHOLD`.

### Coupon Codes
Edit `components/cart/CartSummary.js` → `handleCoupon` function.

---

## 📄 License

MIT — Free to use and modify.
