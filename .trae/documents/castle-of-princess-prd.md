# Castle of Princess - Premium Luxury Korean Skincare eCommerce Platform

## 1. Product Overview

**Castle of Princess** is a premium luxury Korean skincare and cosmetics eCommerce platform targeting the Bangladeshi beauty market. The website embodies ultra-modern luxury aesthetics with a glossy black theme, silk-like gradients, and cinematic animations, positioning the brand as a high-end Korean beauty destination.

- **Purpose**: Full-featured eCommerce platform for Korean skincare products with seamless shopping experience, secure payments, and elegant brand presentation
- **Target Users**: Fashion-conscious Bangladeshi consumers seeking premium Korean skincare products
- **Market Value**: Taps into the growing K-beauty trend in Bangladesh with enterprise-grade technology

## 2. Core Features

### 2.1 User Roles

| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Guest User | None | Browse products, search, view details |
| Registered User | Email + Password | Full shopping, orders, wishlist, reviews |
| Admin | Separate admin login | Dashboard, product management, orders, analytics |

### 2.2 Feature Module

#### Public Pages
1. **Homepage**: Hero, featured brands, trending products, skin concerns, flash sales, testimonials, newsletter
2. **Product Listing**: Grid with filters, sorting, pagination, quick view
3. **Product Details**: Gallery, variants, reviews, related products, add to cart
4. **Category Pages**: Filtered product listings by category
5. **Search Results**: Advanced search with suggestions
6. **Blog**: Korean skincare guides, product reviews
7. **About/Contact**: Brand story, contact information

#### User Account Pages
8. **Authentication**: Login, signup, forgot password, reset password
9. **User Dashboard**: Profile, orders, wishlist, addresses
10. **Order Tracking**: Order status and history

#### Admin Dashboard
11. **Analytics**: Revenue, sales, customer metrics, charts
12. **Product Management**: CRUD products, categories, inventory
13. **Order Management**: Status updates, invoices, shipping
14. **Customer Management**: User list, spending analytics
15. **Marketing**: Coupons, banners, newsletter
16. **Settings**: Site configuration

## 3. Core Process

### 3.1 Shopping Flow
```
Browse → Product Details → Add to Cart → Checkout → Payment (SSLCommerz) → Order Confirmation → Email → Track
```

### 3.2 User Registration Flow
```
Signup → Email Verification → Login → Profile Setup → Shopping
```

### 3.3 Password Reset Flow
```
Forgot Password → Email with Reset Link → Set New Password → Login
```

### 3.4 Admin Product Management Flow
```
Login → Dashboard → Add/Edit Product → Upload Images (Cloudinary) → Set Variants → Publish
```

## 4. User Interface Design

### 4.1 Design Style

#### Color Palette
- **Primary Background**: Full black (#000000) with glossy finish
- **Secondary Background**: Dark charcoal (#0a0a0a) for cards
- **Accent Gold**: #d4af37 (luxury gold)
- **Accent Beige**: #f5f5dc (silk beige)
- **Accent Rose Gold**: #e8c4c4 (feminine touch)
- **Text Primary**: #ffffff (white)
- **Text Secondary**: #a0a0a0 (muted gray)
- **Glass Effect**: rgba(255,255,255,0.05) with blur

#### Typography
- **Headings**: Playfair Display (elegant serif)
- **Body**: Inter (clean sans-serif)
- **Accent**: Cormorant Garamond (luxury labels)

#### Visual Effects
- Glassmorphism cards with blur(20px) backdrop
- Silk-like gradient overlays
- Elegant glow effects on hover
- Premium shadows with multiple layers
- Reflection effects on product images
- Soft blur overlays
- Cinematic smooth transitions

#### Iconography
- Lucide React icons
- Custom SVG icons for branding
- Animated icons for CTAs

### 4.2 Page Design Overview

#### Homepage
| Section | Design Elements | Animation |
|---------|-----------------|-----------|
| Navigation | Sticky glass navbar, animated mobile menu | Smooth scroll, fade transitions |
| Hero | Full-screen luxury banner, floating particles | Parallax effect, staggered text reveal |
| Featured Brands | Horizontal scroll carousel | Slide-in on scroll |
| Trending Products | Premium product cards grid | Staggered fade-up animation |
| Skin Concerns | Icon cards with hover effects | Scale transform on hover |
| Flash Sale | Countdown timer, gradient background | Pulsing glow effect |
| Testimonials | Carousel with glass cards | Smooth slide transitions |
| Newsletter | Glass input with gold accent | Shimmer loading state |
| Footer | Multi-column with social links | Fade-in on scroll |

#### Product Card
| Element | Design |
|---------|--------|
| Image Container | Glossy border, subtle reflection |
| Wishlist Icon | Animated heart with glow |
| Add to Cart | Glass button with gold border |
| Price Display | Original + discounted price |
| Badges | Featured, Trending, Sale |
| Hover State | Zoom effect, quick actions overlay |

#### Admin Dashboard
| Component | Style |
|-----------|-------|
| Sidebar | Glass navigation with icons |
| Cards | Glass morphism with subtle gradients |
| Tables | Clean data tables with hover states |
| Charts | Gold accent color scheme |
| Forms | Dark inputs with focus glow |

### 4.3 Responsiveness

- **Mobile (< 640px)**: Single column, hamburger menu, touch-optimized
- **Tablet (640-1024px)**: 2-column grid, condensed navigation
- **Desktop (1024px+)**: 4-column product grid, full navigation
- **Large (1440px+)**: Extended spacing, premium padding

### 4.4 Animation Specifications

- **Page Transitions**: Fade with slight scale (0.95 → 1)
- **Element Reveals**: Staggered fade-up (0 → 1, translateY 20px → 0)
- **Hover Effects**: Scale 1.02-1.05, glow intensity increase
- **Loading States**: Shimmer gradient animation
- **Micro-interactions**: Button press (scale 0.98), icon bounce

## 5. Technical Architecture

### 5.1 System Architecture
```
Frontend (Next.js 15) ←→ API Routes (Server Actions) ←→ MongoDB Atlas
                                    ↓
                          Cloudinary (Images)
                                    ↓
                          SSLCommerz (Payments)
                                    ↓
                          Resend (Transactional Email)
```

### 5.2 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Database**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Authentication**: NextAuth.js
- **Payments**: SSLCommerz
- **Email**: Resend
- **Deployment**: Vercel

### 5.3 Database Models

#### User
- email, password (hashed), name, phone
- role (user/admin), isVerified
- createdAt, updatedAt

#### Product
- name, slug, description, price, salePrice
- images[], category, brand, skinType[]
- variants[{size, color, stock}]
- ingredients, usage, tags[]
- rating, reviewCount, featured, trending
- stock, SEO metadata

#### Category
- name, slug, image, description, parentId

#### Order
- userId, products[], total, status
- shippingAddress, paymentStatus
- trackingNumber, createdAt

#### Review
- userId, productId, rating, comment, images[]

#### Wishlist
- userId, products[]

#### Cart
- userId/sessionId, products[]

#### Coupon
- code, discount, minAmount, expiresAt

#### Newsletter
- email, subscribed, subscribedAt

## 6. SEO Strategy

### 6.1 Meta Tags
- Dynamic Open Graph images
- Twitter card support
- Structured data (Product, Organization, BreadcrumbList)

### 6.2 Sitemap & Robots
- Dynamic sitemap.xml
- robots.txt with sitemap reference

### 6.3 Keywords
- Korean skincare Bangladesh
- skincare products BD
- cosmetics Bangladesh
- Korean beauty products
- K-beauty online store

## 7. Marketing Integration

### 7.1 Analytics
- Google Analytics 4
- Facebook Meta Pixel
- TikTok Pixel

### 7.2 Conversions
- Landing pages for campaigns
- Promotional banners
- Exit-intent popup
- Abandoned cart recovery (email)

## 8. Performance Targets

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Mobile-first responsive design
- Code splitting per route
- Image optimization with next/image
