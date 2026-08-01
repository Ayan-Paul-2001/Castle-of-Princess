# Castle of Princess — Next.js 15 K‑Beauty eCommerce (Storefront + Admin)

Luxury-themed Korean skincare eCommerce built with Next.js App Router. Includes a storefront (products, cart, wishlist, checkout), an admin dashboard, and a simple CMS for page sections.

## What’s Inside

### Storefront (Customer)
- Browse and filter products
- Product detail pages
- Cart + wishlist (client-side state)
- Checkout flow and order creation
- Static content pages (shipping, returns, privacy, etc.)
- Blog (seeded editorial content)

### Admin
- Admin dashboard UI
- CMS editor for Home / Brands / About (stored in MongoDB when configured)
- Image upload endpoint for CMS (Cloudinary)
- Admin blog editor (saved in browser localStorage)

### Data & Auth Notes (Important)
- Some storefront catalog pages use mock data (for UI/UX) and do not yet read from MongoDB.
- Orders and users use MongoDB.
- Authentication is NextAuth Credentials (email/password) + a development admin shortcut.

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Zustand (cart + wishlist)
- NextAuth (Credentials provider, JWT sessions)
- MongoDB (users, orders, CMS pages)
- Cloudinary (image upload)
- SSLCommerz service module (gateway helper)
- Resend service module (email helper)

## Quick Start (Local)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

### Development Admin Login

In development you can sign in as an admin using either:
- `.env.local` values:
  - `DEV_ADMIN_EMAIL`
  - `DEV_ADMIN_PASSWORD`
- Or the built-in defaults:
  - Email: `admin@castle.local`
  - Password: `admin12345`

## Environment Variables

Copy from `.env.example` and fill in what you need:

### Required for Production

```env
MONGODB_URI=...
NEXTAUTH_SECRET=...           # or AUTH_SECRET
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Optional Integrations

```env
# Cloudinary (for CMS image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Resend
RESEND_API_KEY=...

# SSLCommerz
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...
SSLCOMMERZ_SANDBOX=true
```

## How the Site Works (Workflow)

### 1) Pages & Routing

This project uses Next.js App Router under `app/`.

**Storefront routes**
- `/` home (sections driven by CMS)
- `/products` product listing (currently mock catalog with filters)
- `/products/[slug]` product details (currently mock product details)
- `/brands` brands landing (CMS-driven)
- `/concerns` skin concern landing
- `/blog` + `/blog/[slug]` seeded blog content
- `/checkout` checkout UI
- `/wishlist` wishlist page
- `/account` + `/account/orders` + `/account/orders/[orderNumber]` account pages (auth protected)
- `/about`, `/contact`, `/privacy`, `/terms`, `/shipping`, `/returns`, `/cookies`, `/help`

**Admin routes**
- `/admin` dashboard
- `/admin/cms` CMS index
- `/admin/cms/[key]` CMS editor (key: `home` | `brands` | `about`)
- `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/coupons`, `/admin/banners`, `/admin/newsletter`, `/admin/reviews`, `/admin/settings`

### 2) Authentication & Route Protection

**How login works**
- Login page calls `signIn('credentials')` via NextAuth.
- Credentials provider validates either:
  - Development admin (dev only), or
  - A real MongoDB user (requires `MONGODB_URI`).

**Protected routes**
- `middleware.ts` protects:
  - `/admin/*` requires `role === 'admin'`
  - `/account/*` requires any authenticated session

### 3) Cart & Wishlist

Cart and wishlist are handled client-side with Zustand stores:
- Add/remove items, change quantity
- Header badge shows item counts after mount (prevents hydration mismatch)

### 4) Checkout → Create Order

Checkout collects shipping + payment information, then creates an order via:
- `POST /api/orders`

Orders are stored in MongoDB. Auth is required (must be signed in).

Payment methods in the UI include Cash on Delivery and manual wallet methods (bKash/Nagad fields). The SSLCommerz helper exists in `lib/services/payment.service.ts` for future gateway flows.

### 5) CMS (Home / Brands / About)

**Reading CMS**
- Frontend uses `useCmsPage(key)` which fetches `GET /api/cms/:key`.
- If MongoDB is configured, the API reads from the `cms_pages` collection (seeded once from defaults).
- If MongoDB is not configured, it returns the default page seed.

**Editing CMS (Admin)**
- Admin CMS uses `GET /api/admin/cms/:key` and `PUT /api/admin/cms/:key`.
- Only admins can read/write.
- Without MongoDB, saves are not persisted (they exist only for that response).

**CMS image uploads**
- Admin CMS uses `POST /api/admin/upload` (admin-only).
- Uploads go to Cloudinary (requires Cloudinary env vars).

### 6) Blog

- `/blog` is seeded from `lib/blog-data.ts`.
- Admin blog editor is stored in browser localStorage (no DB yet).

## API Routes (Actual)

### Auth
- `GET/POST /api/auth/[...nextauth]` NextAuth handlers
- `POST /api/auth/signup` creates a user in MongoDB

### CMS
- `GET /api/cms/[key]` public CMS page data (home/brands/about)
- `GET /api/admin/cms/[key]` admin CMS fetch
- `PUT /api/admin/cms/[key]` admin CMS save
- `POST /api/admin/upload` admin image upload (Cloudinary)

### Blog
- `GET /api/blog` list blog posts (seeded)
- `GET /api/blog/[slug]` blog detail (seeded)
- `GET /api/admin/blog` and `GET/POST /api/admin/blog/[id]` (admin editor endpoints)

### Orders
- `POST /api/orders` create order (authenticated)

## Deploy to Vercel

### 1) Push to GitHub

- Commit your code and push to a GitHub repo.

### 2) Create a Vercel Project

- Import the GitHub repo in Vercel.
- Framework preset: Next.js.

### 3) Set Environment Variables in Vercel

At minimum for a working production deployment:

```env
MONGODB_URI=...
NEXTAUTH_SECRET=...           # or AUTH_SECRET
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If you use the admin CMS image upload:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4) MongoDB Atlas Setup

- Ensure your Atlas cluster allows connections (Vercel uses dynamic IPs; use “Allow access from anywhere” or a proper network strategy).
- Use a production database name in the URI.

### 5) Build & Deploy

Vercel will run:
- `npm install`
- `npm run build`
- `npm start` (managed by Vercel)

## Useful Scripts

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Troubleshooting

- Auth errors about “MissingSecret”: set `NEXTAUTH_SECRET` (recommended) or `AUTH_SECRET` in your environment.
- MongoDB errors: ensure `MONGODB_URI` is set and reachable from your environment.
