# Castle of Princess - Technical Architecture

## 1. Architecture Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Next.js 15 (App Router) + Tailwind CSS + shadcn/ui            │
│  Framer Motion + Zustand + React Hook Form + Zod               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER ACTIONS / API                         │
│  Route Handlers + Server Actions                               │
│  Authentication (NextAuth.js)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MongoDB Atlas │  │   Cloudinary    │  │   Resend Email  │
│   (Database)    │  │   (Images)      │  │   (Emails)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │
          ▼
┌─────────────────┐
│  SSLCommerz     │
│  (Payments)     │
└─────────────────┘
```

## 2. Technology Stack

### Core Framework
- **Framework**: Next.js 15.0+ (App Router)
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+

### Styling & UI
- **CSS Framework**: Tailwind CSS 3.4
- **UI Library**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Fonts**: Playfair Display, Inter, Cormorant Garamond

### Animation
- **Animation**: Framer Motion 11.x
- **Transitions**: Custom CSS transitions
- **Loading**: Skeleton loaders + shimmer

### State Management
- **Global State**: Zustand
- **Server State**: React Query / fetch
- **Form State**: React Hook Form

### Database & ORM
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 8.x
- **Connection**: MongoDB Node.js Driver

### Authentication
- **Auth**: NextAuth.js v5 (Auth.js)
- **Password**: bcrypt.js
- **Session**: JWT strategy

### External Services
- **Images**: Cloudinary
- **Email**: Resend
- **Payments**: SSLCommerz
- **Analytics**: Google Analytics 4, Meta Pixel, TikTok Pixel

### Validation
- **Schema**: Zod
- **Forms**: React Hook Form

## 3. Route Definitions

### Public Routes
```
/                          → Homepage
/products                  → Product listing
/products/[slug]           → Product details
/category/[slug]           → Category page
/search                    → Search results
/blog                      → Blog listing
/blog/[slug]               → Blog post
/about                     → About page
/contact                   → Contact page
```

### Auth Routes
```
/auth/login                → Login page
/auth/signup               → Signup page
/auth/forgot-password      → Forgot password
/auth/reset-password       → Reset password (token)
/auth/verify-email         → Email verification
```

### User Account Routes
```
/account                   → User dashboard
/account/orders            → Order history
/account/orders/[id]        → Order details
/account/wishlist           → Wishlist
/account/settings           → Profile settings
/account/addresses          → Address management
```

### Admin Routes
```
/admin                     → Admin dashboard
/admin/products            → Product management
/admin/products/add        → Add product
/admin/products/[id]/edit   → Edit product
/admin/categories           → Category management
/admin/orders               → Order management
/admin/orders/[id]          → Order details
/admin/customers             → Customer management
/admin/coupons              → Coupon management
/admin/banners              → Banner management
/admin/newsletter           → Newsletter subscribers
/admin/reviews              → Review management
/admin/settings             → Site settings
```

### API Routes (Server Actions)
```
/api/auth/[...nextauth]    → NextAuth endpoints
/api/products              → Product API
/api/orders                → Order API
/api/users                 → User API
/api/upload                → Image upload
/api/webhooks/sslcommerz   → Payment webhook
```

## 4. Data Models (MongoDB Schemas)

### User Schema
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  name: string,
  phone: string,
  avatar: string,
  role: 'user' | 'admin',
  isVerified: boolean,
  verificationToken: string,
  resetPasswordToken: string,
  resetPasswordExpires: Date,
  addresses: [{
    _id: ObjectId,
    name: string,
    phone: string,
    address: string,
    city: string,
    postalCode: string,
    isDefault: boolean
  }],
  wishlist: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  description: string,
  shortDescription: string,
  price: number,
  salePrice: number,
  images: [{
    url: string,
    alt: string,
    isPrimary: boolean
  }],
  category: ObjectId,
  brand: string,
  skinTypes: ['dry', 'oily', 'combination', 'sensitive', 'normal'],
  skinConcerns: ['acne', 'aging', 'brightening', 'hydration', 'pore', 'dark spots'],
  variants: [{
    name: string,
    value: string,
    stock: number,
    priceModifier: number
  }],
  stock: number,
  ingredients: string,
  howToUse: string,
  tags: [string],
  rating: number,
  reviewCount: number,
  featured: boolean,
  trending: boolean,
  onSale: boolean,
  seo: {
    title: string,
    description: string,
    keywords: [string]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Category Schema
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  description: string,
  image: string,
  parentId: ObjectId (optional),
  order: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```typescript
{
  _id: ObjectId,
  orderNumber: string (unique),
  user: ObjectId,
  products: [{
    product: ObjectId,
    name: string,
    image: string,
    variant: string,
    quantity: number,
    price: number
  }],
  subtotal: number,
  shippingCost: number,
  discount: number,
  coupon: string,
  total: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentMethod: string,
  shippingAddress: {
    name: string,
    phone: string,
    address: string,
    city: string,
    postalCode: string
  },
  trackingNumber: string,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId,
  product: ObjectId,
  rating: number (1-5),
  title: string,
  comment: string,
  images: [string],
  isVerified: boolean,
  helpful: number,
  createdAt: Date
}
```

### Coupon Schema
```typescript
{
  _id: ObjectId,
  code: string (unique),
  type: 'percentage' | 'fixed',
  value: number,
  minAmount: number,
  maxDiscount: number,
  usageLimit: number,
  usedCount: number,
  startsAt: Date,
  expiresAt: Date,
  isActive: boolean,
  createdAt: Date
}
```

### Newsletter Schema
```typescript
{
  _id: ObjectId,
  email: string (unique),
  subscribed: boolean,
  subscribedAt: Date,
  unsubscribedAt: Date
}
```

### Blog Post Schema
```typescript
{
  _id: ObjectId,
  title: string,
  slug: string (unique),
  excerpt: string,
  content: string,
  featuredImage: string,
  category: string,
  tags: [string],
  author: ObjectId,
  published: boolean,
  seo: {
    title: string,
    description: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 5. API Definitions

### Products API
```typescript
// GET /api/products
Request: { page, limit, category, brand, skinType, minPrice, maxPrice, sort, search }
Response: { products: Product[], total, page, totalPages }

// GET /api/products/[slug]
Response: Product

// POST /api/products (Admin)
Request: Product data with images
Response: Created product
```

### Orders API
```typescript
// POST /api/orders
Request: { products, shippingAddress, couponCode }
Response: { order, paymentUrl }

// GET /api/orders
Request: { page, limit, status }
Response: { orders: Order[], total }

// GET /api/orders/[id]
Response: Order

// PATCH /api/orders/[id]
Request: { status, trackingNumber }
Response: Updated order
```

### Auth API
```typescript
// POST /api/auth/signup
Request: { email, password, name }
Response: { user, token }

// POST /api/auth/login
Request: { email, password }
Response: { user, token }

// POST /api/auth/forgot-password
Request: { email }
Response: { success }

// POST /api/auth/reset-password
Request: { token, password }
Response: { success }
```

### Upload API
```typescript
// POST /api/upload
Request: FormData with image file
Response: { url, publicId }
```

## 6. Folder Structure

```
castle-of-princess/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Homepage
│   │   ├── layout.tsx                   # Public layout
│   │   ├── products/
│   │   │   ├── page.tsx               # Product listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Product details
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Category page
│   │   ├── search/
│   │   │   └── page.tsx               # Search results
│   │   ├── blog/
│   │   │   ├── page.tsx               # Blog listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Blog post
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (account)/
│   │   ├── layout.tsx                  # Account layout
│   │   ├── page.tsx                    # Dashboard
│   │   ├── orders/
│   │   │   ├── page.tsx               # Orders list
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Order details
│   │   ├── wishlist/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                  # Admin layout
│   │   ├── page.tsx                    # Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx               # Products list
│   │   │   ├── add/
│   │   │   │   └── page.tsx           # Add product
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit product
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── customers/
│   │   │   └── page.tsx
│   │   ├── coupons/
│   │   │   └── page.tsx
│   │   ├── banners/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── products/
│   │   │   └── route.ts
│   │   ├── orders/
│   │   │   └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   └── webhooks/
│   │       └── sslcommerz/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── layout/
│   │   ├── header/
│   │   │   ├── header.tsx
│   │   │   ├── mobile-menu.tsx
│   │   │   └── nav-links.tsx
│   │   ├── footer/
│   │   │   └── footer.tsx
│   │   └── providers.tsx
│   ├── home/
│   │   ├── hero-section.tsx
│   │   ├── featured-brands.tsx
│   │   ├── trending-products.tsx
│   │   ├── skin-concerns.tsx
│   │   ├── flash-sale.tsx
│   │   ├── testimonials.tsx
│   │   ├── blog-preview.tsx
│   │   └── newsletter.tsx
│   ├── products/
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-filters.tsx
│   │   ├── product-gallery.tsx
│   │   └── related-products.tsx
│   ├── cart/
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   └── cart-summary.tsx
│   ├── checkout/
│   │   ├── checkout-form.tsx
│   │   ├── shipping-form.tsx
│   │   └── payment-methods.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── password-reset-form.tsx
│   ├── admin/
│   │   ├── admin-sidebar.tsx
│   │   ├── stats-card.tsx
│   │   ├── product-form.tsx
│   │   ├── order-table.tsx
│   │   └── chart-revenue.tsx
│   └── shared/
│       ├── loading-skeleton.tsx
│       ├── toast.tsx
│       └── modal.tsx
├── lib/
│   ├── db/
│   │   ├── connect.ts                  # MongoDB connection
│   │   └── models/
│   │       ├── user.ts
│   │       ├── product.ts
│   │       ├── category.ts
│   │       ├── order.ts
│   │       ├── review.ts
│   │       ├── coupon.ts
│   │       └── newsletter.ts
│   ├── auth/
│   │   ├── config.ts                   # NextAuth config
│   │   └── options.ts
│   ├── services/
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── email.service.ts
│   │   ├── payment.service.ts
│   │   └── cloudinary.service.ts
│   ├── utils/
│   │   ├── cn.ts                      # Classname utility
│   │   ├── format-price.ts
│   │   └── validators/
│   │       └── schemas.ts             # Zod schemas
│   └── constants/
│       ├── navigation.ts
│       └── brands.ts
├── stores/
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   └── user-store.ts
├── types/
│   ├── product.ts
│   ├── order.ts
│   ├── user.ts
│   └── index.ts
├── public/
│   ├── images/
│   └── icons/
├── .env.local
├── .env.example
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## 7. Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend
RESEND_API_KEY=re_your_api_key

# SSLCommerz
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-password
SSLCOMMERZ_SANDBOX=true

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXX

# TikTok Pixel
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXX
```

## 8. Deployment Architecture

```
Vercel (Frontend & API)
├── Production URL: castleofprincess.com
├── Preview Deployments: PR-based
└── Edge Functions for middleware

MongoDB Atlas (Database)
├── Primary Cluster: Singapore
├── Read Replicas: Singapore
└── Backup: Daily automated

Cloudinary (Media)
├── CDN: Global
├── Auto-format: WebP, AVIF
└── Transformations: Responsive images

Resend (Email)
├── Transactional emails
├── Branded templates
└── Analytics dashboard

SSLCommerz (Payments)
├── Production API
├── Sandbox for testing
└── Webhook verification
```

## 9. Security Measures

- Environment variables for secrets
- JWT token expiration (7 days)
- Password hashing with bcrypt (12 rounds)
- CSRF protection via NextAuth
- Rate limiting on API routes
- Input validation with Zod
- XSS prevention
- Secure HTTP headers
- Admin route protection via middleware
