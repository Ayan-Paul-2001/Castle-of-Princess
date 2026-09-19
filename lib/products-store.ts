import {
  adminProducts,
  type AdminProduct,
  adminOrders,
  adminCustomers,
  adminCoupons,
  type AdminCoupon,
  adminReviews,
  type AdminReview,
  adminBanners,
  type AdminBanner,
  adminCategories,
  type AdminCategory,
} from './admin-data'
export type { AdminProduct, AdminCoupon, AdminReview, AdminBanner, AdminCategory } from './admin-data'
import { mockProducts, type MockProduct } from './products-mock'
import { syncToDb } from '@/lib/utils/sync'
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary-url'

const STORAGE_KEY = 'cop_products'
const ORDERS_KEY = 'cop_orders'
const CUSTOMERS_KEY = 'cop_customers'

export type AdminOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type AdminOrder = {
  id: string
  customer: string
  email: string
  amount: number
  status: AdminOrderStatus
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  date: string
  items: number
  city: string
  transactionId?: string
  walletPhone?: string
  paymentMethod?: string
  shippingAddress?: {
    name: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
}

export type AdminCustomer = {
  id: string
  name: string
  email: string
  contactNumber: string
  orders: number
  spent: number
  city: string
  status: 'active' | 'vip' | 'inactive'
  lastOrder: string
}

// In-memory memoization cache for extreme speed & zero main-thread blocking
let _cachedMockProducts: MockProduct[] | null = null
let _cachedAdminProducts: AdminProduct[] | null = null
let _cachedAdminCategories: AdminCategory[] | null = null
let _cachedAdminReviews: AdminReview[] | null = null

export function clearStoreCaches() {
  _cachedMockProducts = null
  _cachedAdminProducts = null
  _cachedAdminCategories = null
  _cachedAdminReviews = null
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', clearStoreCaches)
  window.addEventListener('cop:syncComplete', clearStoreCaches)
}

// Helper to convert AdminProduct to MockProduct
export function mapAdminToMock(prod: AdminProduct): MockProduct {
  const imageList: string[] = []

  // Extract all valid image strings from prod.images (handles objects or strings)
  const rawImages = (prod as any).images
  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      if (typeof item === 'string' && (item as string).trim()) {
        imageList.push((item as string).trim())
      } else if (item && typeof item === 'object') {
        const u = item.url || item.secure_url || item.src || item.image || item.href
        if (typeof u === 'string' && u.trim()) {
          if (item.isPrimary) {
            imageList.unshift(u.trim())
          } else {
            imageList.push(u.trim())
          }
        }
      }
    }
  }

  // Also check prod.image (singular string or object)
  const singleImage = (prod as any).image
  if (typeof singleImage === 'string' && singleImage.trim()) {
    if (!imageList.includes(singleImage.trim())) {
      imageList.unshift(singleImage.trim())
    }
  } else if (singleImage && typeof singleImage === 'object') {
    const u = singleImage.url || singleImage.secure_url || singleImage.src
    if (typeof u === 'string' && u.trim() && !imageList.includes(u.trim())) {
      imageList.unshift(u.trim())
    }
  }

  const uniqueUrls = Array.from(new Set(imageList.filter(Boolean)))
  const imageUrl = uniqueUrls[0] ? getOptimizedImageUrl(uniqueUrls[0]) : '/categories/cleanser.jpg'
  const finalImages = uniqueUrls.length > 0
    ? uniqueUrls.map((u) => getOptimizedImageUrl(u))
    : [imageUrl]

  const categoryName = prod.category || ''
  const norm = categoryName.trim().toLowerCase()
  let categorySlug = 'cleanser'

  if (norm.includes('cleanser')) categorySlug = 'cleanser'
  else if (norm.includes('toner') || norm.includes('mist')) categorySlug = 'toner-mist'
  else if (norm.includes('serum') || norm.includes('essence')) categorySlug = 'serum-essence'
  else if (norm.includes('moisturiser') || norm.includes('moisturizer')) categorySlug = 'moisturiser'
  else if (norm.includes('sun') || norm.includes('spf')) categorySlug = 'sun-protection'
  else if (norm.includes('mask')) categorySlug = 'face-mask'
  else categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'cleanser'

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const skinTypes = (prod.skinTypes || []).map((t) => capitalize(t))
  const skinConcerns = (prod.skinConcerns || []).map((c) => capitalize(c))

  return {
    id: prod.id,
    productId: prod.id,
    name: prod.name,
    slug: prod.slug,
    image: imageUrl,
    images: finalImages,
    price: prod.price,
    salePrice: prod.salePrice || undefined,
    rating: prod.rating || 0,
    reviewCount: prod.reviewCount || 0,
    featured: prod.featured,
    trending: prod.trending,
    onSale: prod.onSale,
    stock: prod.stock,
    category: categorySlug,
    brand: prod.brand,
    skinTypes,
    skinConcerns,
    soldCount: prod.soldCount || 0,
    createdAt: new Date().toISOString().split('T')[0],
    description: prod.description,
    shortDescription: prod.shortDescription,
    ingredients: prod.ingredients || '',
    howToUse: prod.howToUse || '',
    tags: prod.tags,
    visibilityFlags: prod.visibilityFlags || prod.tags || [],
  }
}

export function getAdminProducts(): AdminProduct[] {
  if (_cachedAdminProducts) return _cachedAdminProducts

  let products: AdminProduct[] = []
  if (typeof window === 'undefined') {
    products = adminProducts
  } else {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminProducts))
      products = adminProducts
    } else {
      try {
        products = JSON.parse(stored)
      } catch (e) {
        products = adminProducts
      }
    }
  }

  const reviews = getAdminReviews()
  const result = products.map((prod) => {
    const prodReviews = reviews.filter(
      (r) => r.product === prod.name && r.status === 'approved'
    )
    const count = prodReviews.length
    const avg =
      count > 0
        ? Math.round((prodReviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
        : 0
    return {
      ...prod,
      rating: avg,
      reviewCount: count,
    }
  })

  _cachedAdminProducts = result
  return _cachedAdminProducts
}

export function saveAdminProduct(product: AdminProduct): AdminProduct[] {
  clearStoreCaches()
  const current = getAdminProducts()
  const exists = current.some((p) => p.id === product.id)
  let updated: AdminProduct[]

  if (exists) {
    updated = current.map((p) => (p.id === product.id ? product : p))
  } else {
    updated = [product, ...current]
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    syncToDb('products', updated)
  }
  return getAdminProducts()
}

export function deleteAdminProduct(id: string): AdminProduct[] {
  clearStoreCaches()
  const current = getAdminProducts()
  const updated = current.filter((p) => p.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    syncToDb('products', updated)
  }
  return getAdminProducts()
}

export function getMockProducts(): MockProduct[] {
  if (_cachedMockProducts) return _cachedMockProducts
  const adminProds = getAdminProducts()
  _cachedMockProducts = adminProds.map(mapAdminToMock)
  return _cachedMockProducts
}

export function getAdminOrders(): AdminOrder[] {
  if (typeof window === 'undefined') {
    return adminOrders as AdminOrder[]
  }

  const stored = localStorage.getItem(ORDERS_KEY)
  if (!stored) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(adminOrders))
    return adminOrders as AdminOrder[]
  }

  try {
    return JSON.parse(stored)
  } catch (e) {
    return adminOrders as AdminOrder[]
  }
}

export function saveAdminOrder(order: AdminOrder): AdminOrder[] {
  const current = getAdminOrders()
  const exists = current.some((o) => o.id === order.id)
  let updated: AdminOrder[]

  if (exists) {
    updated = current.map((o) => (o.id === order.id ? order : o))
  } else {
    updated = [order, ...current]
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
  }
  return updated
}

export function getAdminCustomers(): AdminCustomer[] {
  if (typeof window === 'undefined') {
    return adminCustomers
  }

  const stored = localStorage.getItem(CUSTOMERS_KEY)
  if (!stored) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(adminCustomers))
    return adminCustomers
  }

  try {
    return JSON.parse(stored)
  } catch (e) {
    return adminCustomers
  }
}

export function saveAdminCustomer(customer: AdminCustomer): AdminCustomer[] {
  const current = getAdminCustomers()
  const exists = current.some((c) => c.id === customer.id)
  let updated: AdminCustomer[]

  if (exists) {
    updated = current.map((c) => (c.id === customer.id ? customer : c))
  } else {
    updated = [customer, ...current]
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated))
  }
  return updated
}

const COUPONS_KEY = 'cop_coupons'
const BANNERS_KEY = 'cop_banners'
const PROMO_POPUP_KEY = 'cop_promo_popup_v1'

export type PromoPopupConfig = {
  enabled: boolean
  title: string
  message: string
  bannerImageUrl: string
  bannerAlt: string
  ctaLabel: string
  ctaHref: string
  dismissHours: number
}

export const defaultPromoPopupConfig: PromoPopupConfig = {
  enabled: false,
  title: 'Limited Time Offer',
  message: 'Shop our premium edits and save on best sellers.',
  bannerImageUrl: '',
  bannerAlt: 'Promotional banner',
  ctaLabel: 'Shop Now',
  ctaHref: '/products',
  dismissHours: 24,
}

export function getAdminCoupons(): AdminCoupon[] {
  if (typeof window === 'undefined') {
    return adminCoupons
  }

  const stored = localStorage.getItem(COUPONS_KEY)
  if (!stored) {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(adminCoupons))
    return adminCoupons
  }

  try {
    return JSON.parse(stored)
  } catch (e) {
    return adminCoupons
  }
}

export function saveAdminCoupon(coupon: AdminCoupon): AdminCoupon[] {
  const current = getAdminCoupons()
  const exists = current.some((c) => c.id === coupon.id)
  let updated: AdminCoupon[]

  if (exists) {
    updated = current.map((c) => (c.id === coupon.id ? coupon : c))
  } else {
    updated = [coupon, ...current]
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(updated))
    syncToDb('coupons', updated)
  }
  return updated
}

export function deleteAdminCoupon(id: string): AdminCoupon[] {
  const current = getAdminCoupons()
  const updated = current.filter((c) => c.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(updated))
    syncToDb('coupons', updated)
  }
  return updated
}

export function getAdminBanners(): AdminBanner[] {
  if (typeof window === 'undefined') {
    return adminBanners
  }

  const stored = localStorage.getItem(BANNERS_KEY)
  if (!stored) {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(adminBanners))
    return adminBanners
  }

  try {
    return JSON.parse(stored)
  } catch (e) {
    return adminBanners
  }
}

export function saveAdminBanner(banner: AdminBanner): AdminBanner[] {
  const current = getAdminBanners()
  const exists = current.some((b) => b.id === banner.id)
  const updated = exists
    ? current.map((b) => (b.id === banner.id ? banner : b))
    : [banner, ...current]

  if (typeof window !== 'undefined') {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(updated))
    syncToDb('banners', updated)
  }

  return updated
}

export function deleteAdminBanner(id: string): AdminBanner[] {
  const current = getAdminBanners()
  const updated = current.filter((b) => b.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(updated))
    syncToDb('banners', updated)
  }
  return updated
}

export function getPromoPopupConfig(): PromoPopupConfig {
  if (typeof window === 'undefined') {
    return defaultPromoPopupConfig
  }

  const stored = localStorage.getItem(PROMO_POPUP_KEY)
  if (!stored) {
    localStorage.setItem(PROMO_POPUP_KEY, JSON.stringify(defaultPromoPopupConfig))
    return defaultPromoPopupConfig
  }

  try {
    const parsed = JSON.parse(stored) as Partial<PromoPopupConfig>
    return {
      enabled: Boolean(parsed.enabled),
      title: typeof parsed.title === 'string' ? parsed.title : defaultPromoPopupConfig.title,
      message: typeof parsed.message === 'string' ? parsed.message : defaultPromoPopupConfig.message,
      bannerImageUrl:
        typeof parsed.bannerImageUrl === 'string'
          ? parsed.bannerImageUrl
          : defaultPromoPopupConfig.bannerImageUrl,
      bannerAlt:
        typeof parsed.bannerAlt === 'string' ? parsed.bannerAlt : defaultPromoPopupConfig.bannerAlt,
      ctaLabel:
        typeof parsed.ctaLabel === 'string' ? parsed.ctaLabel : defaultPromoPopupConfig.ctaLabel,
      ctaHref:
        typeof parsed.ctaHref === 'string' ? parsed.ctaHref : defaultPromoPopupConfig.ctaHref,
      dismissHours:
        typeof parsed.dismissHours === 'number' && Number.isFinite(parsed.dismissHours)
          ? parsed.dismissHours
          : defaultPromoPopupConfig.dismissHours,
    }
  } catch (e) {
    return defaultPromoPopupConfig
  }
}

export function savePromoPopupConfig(config: PromoPopupConfig): PromoPopupConfig {
  const normalized = {
    enabled: Boolean(config.enabled),
    title: String(config.title || '').trim(),
    message: String(config.message || '').trim(),
    bannerImageUrl: String(config.bannerImageUrl || '').trim(),
    bannerAlt: String(config.bannerAlt || '').trim(),
    ctaLabel: String(config.ctaLabel || '').trim(),
    ctaHref: String(config.ctaHref || '').trim(),
    dismissHours:
      typeof config.dismissHours === 'number' && Number.isFinite(config.dismissHours)
        ? Math.max(0, Math.round(config.dismissHours))
        : defaultPromoPopupConfig.dismissHours,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(PROMO_POPUP_KEY, JSON.stringify(normalized))
    window.dispatchEvent(new Event('cop:promoPopupUpdated'))
    syncToDb('promo_popup', normalized)
  }

  return normalized
}

const REVIEWS_KEY = 'cop_reviews'

export function getAdminReviews(): AdminReview[] {
  if (_cachedAdminReviews) return _cachedAdminReviews

  if (typeof window === 'undefined') {
    return adminReviews
  }

  const stored = localStorage.getItem(REVIEWS_KEY)
  if (!stored) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(adminReviews))
    _cachedAdminReviews = adminReviews
    return _cachedAdminReviews
  }

  try {
    const parsed = JSON.parse(stored)
    _cachedAdminReviews = parsed
    return parsed
  } catch (e) {
    return adminReviews
  }
}

export function saveAdminReview(review: AdminReview): AdminReview[] {
  clearStoreCaches()
  const current = getAdminReviews()
  const exists = current.some((r) => r.id === review.id)
  let updated: AdminReview[]

  if (exists) {
    updated = current.map((r) => (r.id === review.id ? review : r))
  } else {
    updated = [review, ...current]
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated))
    syncToDb('reviews', updated)
  }
  return updated
}

export function deleteAdminReview(id: string): AdminReview[] {
  clearStoreCaches()
  const current = getAdminReviews()
  const updated = current.filter((r) => r.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated))
    syncToDb('reviews', updated)
  }
  return updated
}

const CATEGORIES_KEY = 'cop_categories'

export function getAdminCategories(): AdminCategory[] {
  if (_cachedAdminCategories) return _cachedAdminCategories

  let categories: AdminCategory[] = []
  if (typeof window === 'undefined') {
    categories = adminCategories
  } else {
    const stored = localStorage.getItem(CATEGORIES_KEY)
    if (!stored) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(adminCategories))
      categories = adminCategories
    } else {
      try {
        categories = JSON.parse(stored)
      } catch (e) {
        categories = adminCategories
      }
    }
  }

  const storedProds = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  let products: AdminProduct[] = []
  if (storedProds) {
    try { products = JSON.parse(storedProds) } catch (e) { products = adminProducts }
  } else {
    products = adminProducts
  }

  const result = categories.map((cat) => {
    const count = products.filter((p) => {
      const pCat = (p.category || '').toLowerCase().trim()
      const catName = (cat.name || '').toLowerCase().trim()
      const catSlug = (cat.slug || '').toLowerCase().trim()
      return pCat === catName || pCat === catSlug
    }).length
    return {
      ...cat,
      productCount: count,
    }
  })

  _cachedAdminCategories = result
  return _cachedAdminCategories
}

export function saveAdminCategory(category: AdminCategory): AdminCategory[] {
  clearStoreCaches()
  const current = getAdminCategories()
  const exists = current.some((c) => c.id === category.id)
  let updated: AdminCategory[]

  if (exists) {
    updated = current.map((c) => (c.id === category.id ? category : c))
  } else {
    updated = [category, ...current]
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated))
    syncToDb('categories', updated)
  }
  return updated
}

export function saveAdminCategoriesList(categories: AdminCategory[]): void {
  clearStoreCaches()
  if (typeof window !== 'undefined') {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
    syncToDb('categories', categories)
  }
}

const BRANDS_KEY = 'cop_brands'
const DEFAULT_BRANDS = ['COSRX', 'Beauty of Joseon', 'Anua', 'Some By Mi', 'Round Lab']

export function getAdminBrands(): string[] {
  if (typeof window === 'undefined') {
    return DEFAULT_BRANDS
  }
  const stored = localStorage.getItem(BRANDS_KEY)
  if (!stored) {
    localStorage.setItem(BRANDS_KEY, JSON.stringify(DEFAULT_BRANDS))
    return DEFAULT_BRANDS
  }
  try {
    return JSON.parse(stored)
  } catch (e) {
    return DEFAULT_BRANDS
  }
}

export function saveAdminBrand(brandName: string): string[] {
  const current = getAdminBrands()
  const trimmed = brandName.trim()
  if (!trimmed) return current

  const exists = current.some((b) => b.toLowerCase().trim() === trimmed.toLowerCase().trim())
  if (exists) return current

  const updated = [...current, trimmed]
  if (typeof window !== 'undefined') {
    localStorage.setItem(BRANDS_KEY, JSON.stringify(updated))
    syncToDb('brands', updated)
  }
  return updated
}
