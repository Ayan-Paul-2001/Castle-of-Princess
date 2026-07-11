# Castle of Princes

> Next.js 15 K-Beauty eCommerce Platform — Storefront + Admin

A luxury-themed Korean skincare eCommerce application built with the Next.js App Router. The platform includes a full customer-facing storefront, an admin dashboard, and a CMS for managing editorial page sections.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Application Routes](#application-routes)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Contact](#contact)

---

## Overview

Castle of Princes is a full-stack eCommerce storefront built for Korean skincare and beauty products. It is designed with a premium customer experience in mind and includes an admin portal for managing orders, customers, CMS content, and blog posts.

**Current State Notes**

- Some storefront catalog pages use mock data for UI/UX development and do not yet read from MongoDB.
- Orders and user accounts are fully persisted in MongoDB.
- Authentication uses NextAuth Credentials (email/password) with JWT sessions.
- The admin blog editor persists data in browser localStorage (no database integration yet).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| State Management | Zustand (cart + wishlist) |
| Authentication | NextAuth v5 (Credentials provider, JWT sessions) |
| Database | MongoDB via Mongoose |
| Image Uploads | Cloudinary |
| Email | Resend, Nodemailer (Gmail SMTP), EmailJS |
| Payment Gateway | SSLCommerz (service module, sandbox-ready) |
| Forms | React Hook Form + Zod |
| UI Primitives | Radix UI, Lucide React |
| Charts | Recharts |

---

## Project Structure

```
castleofprinces/
├── app/                  # Next.js App Router pages and API routes
│   ├── admin/            # Admin dashboard pages
│   ├── api/              # API route handlers
│   ├── auth/             # Login / signup pages
│   ├── account/          # Customer account pages (auth-protected)
│   ├── blog/             # Blog listing and detail pages
│   ├── brands/           # Brands landing (CMS-driven)
│   ├── checkout/         # Checkout flow
│   ├── products/         # Product listing and detail pages
│   ├── wishlist/         # Wishlist page
│   └── ...               # Static pages (about, contact, shipping, etc.)
├── components/           # Shared UI components
├── lib/                  # Utilities, services, DB connection, CMS helpers
├── stores/               # Zustand store definitions
├── public/               # Static assets
├── middleware.ts          # Route protection middleware
└── next.config.js        # Next.js configuration
```

---

## Features

### Storefront (Customer)

- Product browsing with filtering and search
- Product detail pages
- Cart and wishlist management (client-side with Zustand)
- Checkout flow with order creation
- Customer account portal with order history
- Static content pages: Shipping, Returns, Privacy, Terms, Help, Cookies
- Blog with seeded editorial content

### Admin Dashboard

- Overview dashboard with charts (Recharts)
- CMS editor for Home, Brands, and About pages (stored in MongoDB)
- CMS image upload via Cloudinary
- Blog editor (browser localStorage)
- Placeholder management sections: Products, Orders, Customers, Coupons, Banners, Newsletter, Reviews, Settings

### Authentication

- Sign up and sign in via NextAuth Credentials provider
- JWT-based sessions
- Route protection via `middleware.ts`
  - `/admin/*` requires `role === 'admin'`
  - `/account/*` requires any authenticated session

### CMS System

- Public frontend fetches CMS data via `GET /api/cms/:key`
- Admin edits via `GET /api/admin/cms/:key` and `PUT /api/admin/cms/:key`
- Falls back to default seed data if MongoDB is not configured
- Supported CMS keys: `home`, `brands`, `about`

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A MongoDB Atlas cluster (or local MongoDB instance)

### Installation

```bash
git clone <repository-url>
cd castleofprinces
npm install
```

### Local Development

1. Copy the example environment file and fill in your values (see [Environment Variables](#environment-variables) below):

```bash
cp .env.example .env.local
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

**The actual credentials for this project are not stored in this repository.**
To obtain the environment variable values required to run this project, please contact the project administrator.

> Contact for .env credentials: [ayancse2001@gmail.com](mailto:ayancse2001@gmail.com)

Create a `.env.local` file at the project root and populate it with the variables listed below.

### Core (Required)

```env
# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# MongoDB connection string
MONGODB_URI=

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=                         # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Default Admin Account (Required for first-time setup)

```env
DEFAULT_ADMIN_NAME=
DEFAULT_ADMIN_EMAIL=
DEFAULT_ADMIN_PASSWORD=
```

These values seed the first admin account in MongoDB on initial login if no admin user exists.

### Cloudinary (Required for CMS image uploads)

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Email Services

```env
# Resend API (transactional email)
RESEND_API_KEY=

# Gmail SMTP (password reset emails)
GMAIL_USER=
GMAIL_PASS=

# EmailJS (client-side contact form)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

### Payment Gateway

```env
# SSLCommerz
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_SANDBOX=true
```


### Generating a Secure Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Application Routes

### Storefront

| Route | Description |
|---|---|
| `/` | Home page (CMS-driven sections) |
| `/products` | Product listing with filters (mock catalog) |
| `/products/[slug]` | Product detail page (mock data) |
| `/brands` | Brands landing page (CMS-driven) |
| `/concerns` | Skin concern landing page |
| `/blog` | Blog listing (seeded data) |
| `/blog/[slug]` | Blog post detail |
| `/checkout` | Checkout UI |
| `/wishlist` | Wishlist page |
| `/account` | Customer account (auth-protected) |
| `/account/orders` | Order history (auth-protected) |
| `/account/orders/[orderNumber]` | Order detail (auth-protected) |
| `/about` | About page |
| `/contact` | Contact page |
| `/privacy` | Privacy policy |
| `/terms` | Terms and conditions |
| `/shipping` | Shipping information |
| `/returns` | Returns policy |
| `/help` | Help center |
| `/cookies` | Cookie policy |

### Admin

| Route | Description |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/cms` | CMS section index |
| `/admin/cms/[key]` | CMS editor (key: `home`, `brands`, `about`) |
| `/admin/products` | Products management |
| `/admin/orders` | Orders management |
| `/admin/customers` | Customer management |
| `/admin/coupons` | Coupon management |
| `/admin/banners` | Banner management |
| `/admin/newsletter` | Newsletter management |
| `/admin/reviews` | Review management |
| `/admin/settings` | Admin settings |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| POST | `/api/auth/signup` | Create a new user account (MongoDB) |

### CMS

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/cms/[key]` | Fetch public CMS page data | Public |
| GET | `/api/admin/cms/[key]` | Fetch CMS page (admin) | Admin |
| PUT | `/api/admin/cms/[key]` | Save CMS page changes | Admin |
| POST | `/api/admin/upload` | Upload image to Cloudinary | Admin |

### Blog

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blog` | List all blog posts (seeded) |
| GET | `/api/blog/[slug]` | Fetch a single blog post |
| GET | `/api/admin/blog` | List blog posts (admin) |
| GET / POST | `/api/admin/blog/[id]` | Fetch or create a blog post (admin) |

### Orders

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/orders` | Create a new order | Authenticated user |

---

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   Commit your code and push to a GitHub repository.

2. **Import into Vercel**

   - Go to [vercel.com](https://vercel.com) and import the GitHub repository.
   - Select **Next.js** as the framework preset.

3. **Set Environment Variables**

   Add all required environment variables in the Vercel project settings under **Settings > Environment Variables**. At minimum:

   ```env
   MONGODB_URI=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=https://your-domain.com
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

   For CMS image upload support, also add the Cloudinary variables.

4. **MongoDB Atlas Network Access**

   Vercel uses dynamic IP addresses. In MongoDB Atlas, configure network access to allow connections from anywhere, or use a proper IP allowlist strategy appropriate for your setup.

5. **Deploy**

   Vercel will automatically run:

   ```bash
   npm install
   npm run build
   npm start
   ```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production bundle |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## Troubleshooting

**Auth error: MissingSecret**

Set `NEXTAUTH_SECRET` in your `.env.local` file. See the [Environment Variables](#environment-variables) section for how to generate a secure value.

**MongoDB connection errors**

Ensure `MONGODB_URI` is correctly set and that your Atlas cluster network access allows connections from your current IP address or environment.

**CMS changes not persisting**

MongoDB must be configured via `MONGODB_URI` for CMS edits to be saved. Without it, the API returns the default seed data and any saves are not persisted.

**Blog changes not persisting after refresh**

The admin blog editor stores data in browser localStorage. This is a known limitation. Database-backed blog persistence is planned for a future update.

**Images not uploading in CMS**

Ensure all three Cloudinary environment variables are set: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

---

## Contact

For environment variable credentials, access requests, or any project-related queries, contact the project administrator:

**Email:** [ayancse2001@gmail.com](mailto:ayancse2001@gmail.com)
