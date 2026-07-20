'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import { getAdminBanners, saveAdminBanner, type AdminBanner } from '@/lib/products-store'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([])
  const [placementFilter, setPlacementFilter] = useState<'all' | 'home-hero' | 'category-strip' | 'flash-sale'>('all')
  const [form, setForm] = useState({
    title: '',
    placement: 'home-hero' as 'home-hero' | 'category-strip' | 'flash-sale',
    cta: '',
  })

  useEffect(() => {
    setBanners(getAdminBanners())
  }, [])

  const filteredBanners = useMemo(() => {
    if (placementFilter === 'all') return banners
    return banners.filter((banner) => banner.placement === placementFilter)
  }, [banners, placementFilter])

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.cta) {
      toast.error('Fill out the banner fields')
      return
    }

    const updated = saveAdminBanner({
      id: `banner_${Date.now()}`,
      title: form.title,
      placement: form.placement,
      cta: form.cta,
      active: true,
    })
    setBanners(updated)
    setForm({ title: '', placement: 'home-hero', cta: '' })
    toast.success('Banner added')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Campaign Visuals"
        title="Banners"
        description="Control homepage, sale, and category promotional blocks from one place."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminPanel title="Create Banner" description="Draft a promotional message and assign its placement.">
          <form onSubmit={handleCreateBanner} className="space-y-4">
            <input
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              placeholder="Campaign title"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <select
              value={form.placement}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  placement: e.target.value as 'home-hero' | 'category-strip' | 'flash-sale',
                }))
              }
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-gold"
            >
              <option value="home-hero">Home Hero</option>
              <option value="category-strip">Category Strip</option>
              <option value="flash-sale">Flash Sale</option>
            </select>
            <input
              value={form.cta}
              onChange={(e) => setForm((current) => ({ ...current, cta: e.target.value }))}
              placeholder="CTA label"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <Button type="submit" variant="gold">
              <Plus className="mr-2 h-4 w-4" />
              Save Banner
            </Button>
          </form>
        </AdminPanel>

        <AdminPanel
          title="Banner Inventory"
          description="Toggle live campaigns or filter by placement."
          action={
            <select
              value={placementFilter}
              onChange={(e) =>
                setPlacementFilter(
                  e.target.value as 'all' | 'home-hero' | 'category-strip' | 'flash-sale'
                )
              }
              className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-gold"
            >
              <option value="all">All placements</option>
              <option value="home-hero">Home Hero</option>
              <option value="category-strip">Category Strip</option>
              <option value="flash-sale">Flash Sale</option>
            </select>
          }
        >
          <div className="space-y-4">
            {filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{banner.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {banner.placement} • CTA: {banner.cta}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const updated = saveAdminBanner({ ...banner, active: !banner.active })
                    setBanners(updated)
                    toast.success(banner.active ? 'Banner paused' : 'Banner activated')
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    banner.active
                      ? 'bg-gold/15 text-gold'
                      : 'border border-white/10 bg-white/[0.04] text-gray-300'
                  }`}
                >
                  {banner.active ? 'Live' : 'Paused'}
                </button>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
