'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import { syncToDb } from '@/lib/utils/sync'

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Castle of Princess',
    supportEmail: 'hello@castleofprincess.com',
    supportPhone: '+880 1XXX-XXXXXX',
    currency: 'BDT',
    sslcommerzSandbox: true,
    freeShippingThreshold: '2000',
    location: 'Dhaka, Bangladesh',
    hours: 'Sat - Thu, 10AM - 8PM',
  })

  const [brandSettings, setBrandSettings] = useState({
    homepageHeadline: 'Premium Korean skincare for Bangladesh',
    metaDescription: 'Luxury K-beauty, curated skincare rituals, and premium beauty discovery.',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
  })

  const [favicon, setFavicon] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFaviconFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'castle-of-princess/brand')

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

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      setUploading(true)
      const url = await uploadFaviconFile(file)
      setFavicon(url)
      toast.success('Favicon uploaded to Cloudinary')
    } catch (error: any) {
      const message =
        typeof error?.message === 'string' ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const savedStore = localStorage.getItem('cop_store_settings')
    const savedBrand = localStorage.getItem('cop_brand_settings')
    const savedFavicon = localStorage.getItem('cop_favicon')

    if (savedStore) {
      try {
        setStoreSettings(current => ({ ...current, ...JSON.parse(savedStore) }))
      } catch (e) {
        console.error('Error parsing store settings:', e)
      }
    }
    if (savedBrand) {
      try {
        const parsedBrand = JSON.parse(savedBrand)
        setBrandSettings(current => ({ ...current, ...parsedBrand }))
        // Fallback: if favicon isn't saved in its own key but exists in old brand settings
        if (!savedFavicon && parsedBrand.favicon) {
          setFavicon(parsedBrand.favicon)
        }
      } catch (e) {
        console.error('Error parsing brand settings:', e)
      }
    }
    if (savedFavicon) {
      setFavicon(savedFavicon)
    }
  }, [])

  const handleSave = (label: string) => {
    if (label === 'Store settings') {
      localStorage.setItem('cop_store_settings', JSON.stringify(storeSettings))
      window.dispatchEvent(new Event('cop:storeSettingsUpdated'))
      syncToDb('store_settings', storeSettings)
    } else if (label === 'Brand settings') {
      localStorage.setItem('cop_brand_settings', JSON.stringify(brandSettings))
      window.dispatchEvent(new Event('cop:brandSettingsUpdated'))
      syncToDb('brand_settings', brandSettings)
    }
    toast.success(`${label} saved`)
  }

  const handleSaveFavicon = () => {
    localStorage.setItem('cop_favicon', favicon)
    window.dispatchEvent(new Event('cop:faviconUpdated'))
    syncToDb('favicon', favicon)
    toast.success('Favicon settings saved')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage store identity, contact details, payments, shipping thresholds, and brand messaging."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminPanel title="Store Settings" description="Core operational details used across orders and support.">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={storeSettings.storeName}
              onChange={(e) =>
                setStoreSettings((current) => ({ ...current, storeName: e.target.value }))
              }
              placeholder="Store name"
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <input
              value={storeSettings.supportEmail}
              onChange={(e) =>
                setStoreSettings((current) => ({ ...current, supportEmail: e.target.value }))
              }
              placeholder="Support email"
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <input
              value={storeSettings.supportPhone}
              onChange={(e) =>
                setStoreSettings((current) => ({ ...current, supportPhone: e.target.value }))
              }
              placeholder="Support phone"
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <input
              value={storeSettings.freeShippingThreshold}
              onChange={(e) =>
                setStoreSettings((current) => ({
                  ...current,
                  freeShippingThreshold: e.target.value,
                }))
              }
              placeholder="Free shipping threshold"
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <select
              value={storeSettings.currency}
              onChange={(e) =>
                setStoreSettings((current) => ({ ...current, currency: e.target.value }))
              }
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-gold"
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
            </select>
            <input
              value={storeSettings.location || ''}
              onChange={(e) =>
                setStoreSettings((current) => ({ ...current, location: e.target.value }))
              }
              placeholder="Store location"
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <input
              value={storeSettings.hours || ''}
              onChange={(e) =>
                setStoreSettings((current) => ({ ...current, hours: e.target.value }))
              }
              placeholder="Store hours"
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white">
              <input
                type="checkbox"
                checked={storeSettings.sslcommerzSandbox}
                onChange={(e) =>
                  setStoreSettings((current) => ({
                    ...current,
                    sslcommerzSandbox: e.target.checked,
                  }))
                }
              />
              SSLCommerz Sandbox
            </label>
          </div>
          <div className="mt-6">
            <Button variant="gold" onClick={() => handleSave('Store settings')}>
              Save Store Settings
            </Button>
          </div>
        </AdminPanel>

        <AdminPanel title="Brand Settings" description="Control homepage messaging and social destination links.">
          <div className="space-y-4">
            <input
              value={brandSettings.homepageHeadline}
              onChange={(e) =>
                setBrandSettings((current) => ({
                  ...current,
                  homepageHeadline: e.target.value,
                }))
              }
              placeholder="Homepage headline"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <textarea
              value={brandSettings.metaDescription}
              onChange={(e) =>
                setBrandSettings((current) => ({
                  ...current,
                  metaDescription: e.target.value,
                }))
              }
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition-colors focus:border-gold"
            />
            <input
              value={brandSettings.instagram}
              onChange={(e) =>
                setBrandSettings((current) => ({ ...current, instagram: e.target.value }))
              }
              placeholder="Instagram URL"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <input
              value={brandSettings.facebook}
              onChange={(e) =>
                setBrandSettings((current) => ({ ...current, facebook: e.target.value }))
              }
              placeholder="Facebook URL"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
          </div>
          <div className="mt-6">
            <Button variant="gold" onClick={() => handleSave('Brand settings')}>
              Save Brand Settings
            </Button>
          </div>
        </AdminPanel>
      </div>

      <div className="mt-6">
        <AdminPanel title="Favicon Settings" description="Upload and configure the site icon (favicon).">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-[0.22em] text-gray-500">Favicon File</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Icon'}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/x-icon,image/png,image/svg+xml,image/jpeg"
              className="hidden"
              onChange={handleFaviconUpload}
            />
            <input
              value={favicon || ''}
              onChange={(e) => setFavicon(e.target.value)}
              placeholder="Favicon URL (https://...)"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            {favicon ? (
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 flex items-center justify-center">
                  <img
                    src={favicon}
                    alt="Favicon Preview"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Favicon Active</p>
                  <p className="text-xs text-gray-500 truncate">Will be loaded as site icon</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  onClick={() => {
                    setFavicon('')
                    toast.success('Favicon reference cleared (Click Save to apply)')
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : null}
          </div>
          <div className="mt-6">
            <Button variant="gold" onClick={handleSaveFavicon} disabled={uploading}>
              Save Favicon Settings
            </Button>
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
