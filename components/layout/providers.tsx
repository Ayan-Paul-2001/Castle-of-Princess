'use client'

import { ReactNode, useEffect, useState, Suspense } from 'react'
import Header from './header/header'
import Footer from './footer/footer'
import CartDrawer from '@/components/cart/cart-drawer'
import { SessionProvider, useSession } from 'next-auth/react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { getPromoPopupConfig, type PromoPopupConfig } from '@/lib/products-store'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

function StoreSync() {
  const { data: session, status } = useSession()
  const setActiveCartUser = useCartStore((state) => state.setActiveUser)
  const setActiveWishlistUser = useWishlistStore((state) => state.setActiveUser)

  useEffect(() => {
    if (status === 'loading') return
    const userId = session?.user?.email || session?.user?.id || 'guest'
    setActiveCartUser(userId)
    setActiveWishlistUser(userId)
  }, [session, status, setActiveCartUser, setActiveWishlistUser])

  return null
}

const PROMO_DISMISSED_AT_KEY = 'cop_promo_popup_dismissed_at_v1'

function PromoPopup() {
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<PromoPopupConfig | null>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const evaluate = (cfg: PromoPopupConfig) => {
      setConfig(cfg)
      const params = new URLSearchParams(window.location.search)
      const forcePreview = params.get('promoPreview') === '1'
      if (forcePreview) {
        setOpen(true)
        return
      }

      if (pathname.startsWith('/admin')) {
        setOpen(false)
        return
      }

      if (!cfg.enabled) {
        setOpen(false)
        return
      }

      const dismissedAtRaw = localStorage.getItem(PROMO_DISMISSED_AT_KEY)
      const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0
      const dismissMs = Math.max(0, (cfg.dismissHours || 0) * 60 * 60 * 1000)
      if (
        dismissMs > 0 &&
        Number.isFinite(dismissedAt) &&
        dismissedAt > 0 &&
        Date.now() - dismissedAt < dismissMs
      ) {
        setOpen(false)
        return
      }

      setOpen(true)
    }

    evaluate(getPromoPopupConfig())

    const handleUpdated = () => {
      evaluate(getPromoPopupConfig())
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cop_promo_popup_v1' || e.key === PROMO_DISMISSED_AT_KEY) {
        handleUpdated()
      }
    }

    window.addEventListener('cop:promoPopupUpdated', handleUpdated as EventListener)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('cop:promoPopupUpdated', handleUpdated as EventListener)
      window.removeEventListener('storage', handleStorage)
    }
  }, [pathname])

  if (!mounted || !open || !config || !config.enabled) return null

  const ctaHref = config.ctaHref?.trim() || '/products'
  const ctaLabel = config.ctaLabel?.trim() || 'Shop Now'
  const bannerUrl = config.bannerImageUrl?.trim()
  const bannerAlt = config.bannerAlt?.trim() || 'Promotional banner'
  const isDataUrl = Boolean(bannerUrl && bannerUrl.startsWith('data:'))

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="glass w-full max-w-lg rounded-3xl border border-white/10 p-6 sm:p-7">
        {bannerUrl && (
          <Link
            href={ctaHref}
            onClick={() => {
              localStorage.setItem(PROMO_DISMISSED_AT_KEY, String(Date.now()))
              setOpen(false)
            }}
            className="mb-5 block overflow-hidden rounded-2xl border border-white/10 bg-black/30"
          >
            <div className="relative aspect-[16/9] w-full">
              {isDataUrl ? (
                <img src={bannerUrl} alt={bannerAlt} className="h-full w-full object-cover" />
              ) : (
                <Image
                  src={bannerUrl}
                  alt={bannerAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, 520px"
                  className="object-cover"
                />
              )}
            </div>
          </Link>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-playfair text-xl font-semibold text-white sm:text-2xl">
              {config.title || 'Limited Time Offer'}
            </p>
            <p className="mt-2 text-sm text-gray-200 sm:text-base">{config.message}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              localStorage.setItem(PROMO_DISMISSED_AT_KEY, String(Date.now()))
              setOpen(false)
            }}
            className="rounded-full border border-white/10 bg-black/40 p-2 text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={ctaHref} className="w-full sm:w-auto">
            <Button variant="gold" className="w-full sm:w-auto">
              {ctaLabel}
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(PROMO_DISMISSED_AT_KEY, String(Date.now()))
              setOpen(false)
            }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-white/[0.08]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

function FaviconSync() {
  useEffect(() => {
    const updateFavicon = (url: string) => {
      // Remove all existing favicon links to prevent conflicts
      const existingLinks = document.querySelectorAll("link[rel*='icon']")
      existingLinks.forEach((link) => {
        link.parentNode?.removeChild(link)
      })

      // Create a clean new link element
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = url
      document.head.appendChild(link)
    }

    const loadFavicon = () => {
      const savedFavicon = localStorage.getItem('cop_favicon')
      if (savedFavicon) {
        updateFavicon(savedFavicon)
        return
      }

      const savedBrand = localStorage.getItem('cop_brand_settings')
      if (savedBrand) {
        try {
          const parsed = JSON.parse(savedBrand)
          if (parsed.favicon) {
            updateFavicon(parsed.favicon)
            return
          }
        } catch (e) {
          console.error('Error parsing brand settings for favicon:', e)
        }
      }

      // Reset to default
      updateFavicon('/favicon.ico')
    }

    loadFavicon()

    window.addEventListener('cop:faviconUpdated', loadFavicon)
    window.addEventListener('cop:brandSettingsUpdated', loadFavicon)
    window.addEventListener('storage', loadFavicon)

    return () => {
      window.removeEventListener('cop:faviconUpdated', loadFavicon)
      window.removeEventListener('cop:brandSettingsUpdated', loadFavicon)
      window.removeEventListener('storage', loadFavicon)
    }
  }, [])

  return null
}

function StoreDbSync() {
  useEffect(() => {
    fetch('/api/sync')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((dbData) => {
        const keysToSync = [
          { dbKey: 'products', storageKey: 'cop_products' },
          { dbKey: 'categories', storageKey: 'cop_categories' },
          { dbKey: 'brands', storageKey: 'cop_brands' },
          { dbKey: 'store_settings', storageKey: 'cop_store_settings' },
          { dbKey: 'brand_settings', storageKey: 'cop_brand_settings' },
          { dbKey: 'favicon', storageKey: 'cop_favicon' },
          { dbKey: 'banners', storageKey: 'cop_banners' },
          { dbKey: 'coupons', storageKey: 'cop_coupons' },
          { dbKey: 'reviews', storageKey: 'cop_reviews' },
          { dbKey: 'promo_popup', storageKey: 'cop_promo_popup_v1' },
          { dbKey: 'blog_posts', storageKey: 'cop_blog_posts' },
          { dbKey: 'shipping_settings', storageKey: 'cop_shipping_discount_store' },
        ]


        let updatedAny = false

        keysToSync.forEach(({ dbKey, storageKey }) => {
          const dbValue = dbData[dbKey]
          if (dbValue !== undefined) {
            const currentStr = localStorage.getItem(storageKey)
            const newStr = typeof dbValue === 'string' ? dbValue : JSON.stringify(dbValue)
            if (currentStr !== newStr) {
              localStorage.setItem(storageKey, newStr)
              updatedAny = true
            }
          }
        })

        if (updatedAny) {
          window.dispatchEvent(new Event('cop:promoPopupUpdated'))
          window.dispatchEvent(new Event('cop:faviconUpdated'))
          window.dispatchEvent(new Event('cop:brandSettingsUpdated'))
          window.dispatchEvent(new Event('cop:storeSettingsUpdated'))
          window.dispatchEvent(new Event('cop:syncComplete'))
          window.dispatchEvent(new Event('storage'))
        }
      })
      .catch((err) => {
        console.error('Error synchronizing local storage with MongoDB:', err)
      })
  }, [])

  return null
}

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <SessionProvider>
      <StoreSync />
      <StoreDbSync />
      <FaviconSync />
      <Suspense fallback={<div className="h-20" />}>
        <Header />
      </Suspense>
      <main className="min-h-screen">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <PromoPopup />}
    </SessionProvider>
  )
}
