'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Sparkles, Upload } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  getAdminProducts,
  getPromoPopupConfig,
  saveAdminProduct,
  savePromoPopupConfig,
  type AdminProduct,
  type PromoPopupConfig,
} from '@/lib/products-store'

export default function AdminCampaignsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [promoUploading, setPromoUploading] = useState(false)
  const [promo, setPromo] = useState<PromoPopupConfig>(() => ({
    enabled: false,
    title: '',
    message: '',
    bannerImageUrl: '',
    bannerAlt: '',
    ctaLabel: '',
    ctaHref: '',
    dismissHours: 24,
  }))

  const [productQuery, setProductQuery] = useState('')
  const promoBannerInputRef = useRef<HTMLInputElement>(null)
  const PROMO_DISMISSED_AT_KEY = 'cop_promo_popup_dismissed_at_v1'

  useEffect(() => {
    const loadLocalData = () => {
      setProducts(getAdminProducts())
      setPromo(getPromoPopupConfig())
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const hay = `${p.name} ${p.brand} ${p.category} ${p.slug}`.toLowerCase()
      return hay.includes(q)
    })
  }, [products, productQuery])

  const handleSavePromo = () => {
    const updated = savePromoPopupConfig(promo)
    setPromo(updated)
    toast.success('Promo popup saved')
  }

  const uploadPromoBannerFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'castle-of-princess/promo-popup')

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      try {
        const json = await response.json()
        const message = typeof json?.error === 'string' ? json.error : 'Upload failed'
        throw new Error(message)
      } catch (error) {
        throw new Error('Upload failed')
      }
    }

    const json = await response.json()
    const url = json?.url as string | undefined
    if (!url) {
      throw new Error('Upload failed')
    }
    return url
  }

  const handleToggleHighlight = (product: AdminProduct, key: 'featured' | 'trending') => {
    const updatedProduct = { ...product, [key]: !product[key] }
    const updated = saveAdminProduct(updatedProduct)
    setProducts(updated)
    toast.success(updatedProduct[key] ? 'Product highlighted' : 'Highlight removed')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Growth & Merchandising"
        title="Campaigns"
        description="Control the promo popup and highlight products for the storefront."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminPanel
          title="Promotional Popup"
          description="Enable a storefront popup for announcements and limited-time offers."
          action={
            <div className="flex flex-wrap gap-2">
              <Link href="/?promoPreview=1" className="inline-flex">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  try {
                    localStorage.removeItem(PROMO_DISMISSED_AT_KEY)
                    window.dispatchEvent(new Event('cop:promoPopupUpdated'))
                    toast.success('Popup reset')
                  } catch (error) {
                    toast.error('Reset failed')
                  }
                }}
              >
                Reset
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <input
              ref={promoBannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                try {
                  setPromoUploading(true)
                  const url = await uploadPromoBannerFile(file)
                  setPromo((p) => ({ ...p, bannerImageUrl: url }))
                  toast.success('Banner uploaded to Cloudinary')
                } catch (error: any) {
                  const message =
                    typeof error?.message === 'string' ? error.message : 'Upload failed'
                  toast.error(message)
                } finally {
                  setPromoUploading(false)
                }
              }}
            />

            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <span className="text-sm font-medium text-white">Enabled</span>
              <button
                type="button"
                onClick={() => {
                  const next = { ...promo, enabled: !promo.enabled }
                  if (next.enabled) {
                    try {
                      localStorage.removeItem(PROMO_DISMISSED_AT_KEY)
                    } catch (error) {
                      null
                    }
                  }
                  const saved = savePromoPopupConfig(next)
                  setPromo(saved)
                  toast.success(saved.enabled ? 'Promo enabled' : 'Promo disabled')
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  promo.enabled
                    ? 'bg-gold/15 text-gold'
                    : 'border border-white/10 bg-white/[0.04] text-gray-200'
                }`}
              >
                {promo.enabled ? 'On' : 'Off'}
              </button>
            </label>

            <input
              value={promo.title}
              onChange={(e) => setPromo((p) => ({ ...p, title: e.target.value }))}
              placeholder="Popup title"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />

            <textarea
              value={promo.message}
              onChange={(e) => setPromo((p) => ({ ...p, message: e.target.value }))}
              placeholder="Popup message"
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition-colors focus:border-gold"
            />

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  Banner image
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => promoBannerInputRef.current?.click()}
                  disabled={promoUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {promoUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>

              <input
                value={promo.bannerImageUrl}
                onChange={(e) => setPromo((p) => ({ ...p, bannerImageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
              />

              {promo.bannerImageUrl ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div
                    className="aspect-[16/9] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${promo.bannerImageUrl})` }}
                  />
                </div>
              ) : null}
            </div>

            <input
              value={promo.bannerAlt}
              onChange={(e) => setPromo((p) => ({ ...p, bannerAlt: e.target.value }))}
              placeholder="Banner alt text (optional)"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={promo.ctaLabel}
                onChange={(e) => setPromo((p) => ({ ...p, ctaLabel: e.target.value }))}
                placeholder="CTA label"
                className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
              />
              <input
                value={promo.ctaHref}
                onChange={(e) => setPromo((p) => ({ ...p, ctaHref: e.target.value }))}
                placeholder="CTA link (e.g. /products)"
                className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
              />
            </div>

            <input
              type="number"
              value={promo.dismissHours}
              onChange={(e) =>
                setPromo((p) => ({ ...p, dismissHours: Number(e.target.value) }))
              }
              placeholder="Dismiss hours"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />

            <Button type="button" variant="gold" onClick={handleSavePromo}>
              <Sparkles className="mr-2 h-4 w-4" />
              Save Promo Popup
            </Button>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Highlight Products"
          description="Mark products as featured or trending for homepage sections."
        >
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
          />

          <div className="mt-4 space-y-3">
            {filteredProducts.slice(0, 18).map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{product.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.brand} • {product.category}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleHighlight(product, 'featured')}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      product.featured
                        ? 'bg-gold/15 text-gold'
                        : 'border border-white/10 bg-white/[0.04] text-gray-200'
                    }`}
                  >
                    {product.featured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleHighlight(product, 'trending')}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      product.trending
                        ? 'bg-gold/15 text-gold'
                        : 'border border-white/10 bg-white/[0.04] text-gray-200'
                    }`}
                  >
                    {product.trending ? 'Trending' : 'Trend'}
                  </button>
                </div>
              </div>
            ))}

            {filteredProducts.length > 18 && (
              <p className="text-sm text-gray-500">
                Showing first 18 results. Refine your search to find more.
              </p>
            )}
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
