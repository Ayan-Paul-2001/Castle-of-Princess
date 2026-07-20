'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, ChevronDown, Check } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import {
  getAdminCoupons,
  saveAdminCoupon,
  deleteAdminCoupon,
  type AdminCoupon,
} from '@/lib/products-store'
import { useShippingDiscountStore } from '@/stores/shipping-discount-store'
import { syncToDb } from '@/lib/utils/sync'


export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isTypeOpen, setIsTypeOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const [form, setForm] = useState({
    code: '',
    discount: '',
    type: 'percent' as 'percent' | 'fixed',
    minimumSpend: '',
    expiresAt: '',
    description: '',
  })

  const shippingDiscountStore = useShippingDiscountStore()

  useEffect(() => {
    setIsMounted(true)
    setCoupons(getAdminCoupons())

    const handleSync = () => {
      useShippingDiscountStore.persist.rehydrate()
      setCoupons(getAdminCoupons())
    }

    window.addEventListener('cop:syncComplete', handleSync)
    // Run once on mount in case sync completed before this effect ran
    useShippingDiscountStore.persist.rehydrate()

    return () => {
      window.removeEventListener('cop:syncComplete', handleSync)
    }
  }, [])


  useEffect(() => {
    const handleClose = () => setIsTypeOpen(false)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [])

  if (!isMounted) {
    return null
  }

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.discount || !form.expiresAt) {
      toast.error('Complete the coupon form first')
      return
    }

    const updatedCoupon: AdminCoupon = {
      id: editingId || `coupon_${Date.now()}`,
      code: form.code.toUpperCase().trim(),
      discount: Number(form.discount),
      type: form.type,
      minimumSpend: Number(form.minimumSpend) || 0,
      expiresAt: form.expiresAt,
      active: editingId ? (coupons.find((c) => c.id === editingId)?.active ?? true) : true,
      description: form.description.trim() || undefined,
    }

    const updatedList = saveAdminCoupon(updatedCoupon)
    setCoupons(updatedList)

    toast.success(editingId ? 'Coupon updated successfully' : 'Coupon created successfully')
    handleCancelEdit()
  }

  const handleEditClick = (coupon: AdminCoupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      discount: String(coupon.discount),
      type: coupon.type,
      minimumSpend: String(coupon.minimumSpend),
      expiresAt: coupon.expiresAt,
      description: coupon.description || '',
    })
  }

  const handleDeleteClick = (id: string) => {
    const updated = deleteAdminCoupon(id)
    setCoupons(updated)
    toast.success('Coupon deleted')
    if (editingId === id) {
      handleCancelEdit()
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({
      code: '',
      discount: '',
      type: 'percent',
      minimumSpend: '',
      expiresAt: '',
      description: '',
    })
  }

  const handleSaveShippingDiscount = () => {
    const stateStr = localStorage.getItem('cop_shipping_discount_store')
    if (stateStr) {
      try {
        syncToDb('shipping_settings', JSON.parse(stateStr))
      } catch (err) {
        console.error('Failed to parse shipping settings for sync:', err)
      }
    }
    toast.success('Shipping discount settings saved successfully')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Marketing"
        title="Coupons"
        description="Create promotional offers and toggle their active state for campaign testing."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <AdminPanel
            title={editingId ? 'Edit Coupon' : 'Create Coupon'}
            description="Set up a fixed amount or percentage-based campaign code."
            action={
              editingId ? (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" /> Cancel Edit
                </button>
              ) : undefined
            }
          >
            <form onSubmit={handleCreateCoupon} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Coupon Code
                </label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))}
                  placeholder="e.g. GLOW10"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Discount Value
                </label>
                <input
                  value={form.discount}
                  onChange={(e) => setForm((current) => ({ ...current, discount: e.target.value }))}
                  placeholder="e.g. 10 or 500"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>

              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Discount Type
                </label>
                <button
                  type="button"
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  className="flex w-full items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white outline-none hover:border-gold/30 transition-colors"
                >
                  <span>{form.type === 'percent' ? 'Percent' : 'Fixed Amount'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {isTypeOpen && (
                  <div className="absolute left-0 mt-2 z-30 w-full rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-md">
                    {(['percent', 'fixed'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setForm((current) => ({ ...current, type: t }))
                          setIsTypeOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                          form.type === t ? 'text-gold font-medium' : 'text-gray-300'
                        }`}
                      >
                        <span>{t === 'percent' ? 'Percent' : 'Fixed Amount'}</span>
                        {form.type === t && <Check className="h-4 w-4 text-gold" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Minimum Spend
                </label>
                <input
                  value={form.minimumSpend}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, minimumSpend: e.target.value }))
                  }
                  placeholder="e.g. 2000"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((current) => ({ ...current, expiresAt: e.target.value }))}
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Short Note / Details
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="e.g. 10% off for new users during Summer Sale"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>

              <Button type="submit" variant="gold" className="md:col-span-2 mt-2">
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? 'Update Coupon' : 'Save Coupon'}
              </Button>
            </form>
          </AdminPanel>

          <AdminPanel
            title="Discount on Shipping"
            description="Configure automatic free shipping rules based on order total."
          >
            <div className="grid gap-4">
              <div className="flex items-center gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const newActive = !shippingDiscountStore.active
                    shippingDiscountStore.setActive(newActive)
                    toast.success(newActive ? 'Shipping discount enabled' : 'Shipping discount disabled')
                  }}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-all duration-200 ${
                    shippingDiscountStore.active
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-white/20 bg-black/40 text-transparent hover:border-gold/50'
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </button>
                <span
                  onClick={() => {
                    const newActive = !shippingDiscountStore.active
                    shippingDiscountStore.setActive(newActive)
                    toast.success(newActive ? 'Shipping discount enabled' : 'Shipping discount disabled')
                  }}
                  className="text-sm text-gray-300 cursor-pointer hover:text-white select-none font-medium"
                >
                  Enable Discount on Shipping
                </span>
              </div>

              <div className={`grid gap-4 md:grid-cols-2 transition-opacity duration-300 ${!shippingDiscountStore.active ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Shipping Condition
                  </label>
                  <select
                    value={shippingDiscountStore.condition}
                    disabled={!shippingDiscountStore.active}
                    onChange={(e) => {
                      const newCond = e.target.value as any
                      shippingDiscountStore.setCondition(newCond)
                      toast.success(`Condition updated to ${newCond}`)
                    }}
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white outline-none focus:border-gold cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="upper" className="bg-black text-white">Upper</option>
                    <option value="lower" className="bg-black text-white">Lower</option>
                    <option value="total" className="bg-black text-white">Total</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Amount (৳)
                  </label>
                  <input
                    type="number"
                    value={shippingDiscountStore.threshold || ''}
                    disabled={!shippingDiscountStore.active}
                    onChange={(e) => {
                      const newThreshold = Number(e.target.value) || 0
                      shippingDiscountStore.setThreshold(newThreshold)
                    }}
                    placeholder="e.g. 2000"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="gold"
                disabled={!shippingDiscountStore.active}
                onClick={handleSaveShippingDiscount}
                className="mt-2 w-full"
              >
                Save Shipping Settings
              </Button>
            </div>
          </AdminPanel>

          <AdminPanel
            title="Shipping Fee Settings"
            description="Set standard delivery fees for inside and outside Dhaka."
          >
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Inside Dhaka (৳)
                  </label>
                  <input
                    type="number"
                    value={shippingDiscountStore.shippingDhaka ?? 70}
                    onChange={(e) => {
                      const fee = Number(e.target.value) || 0
                      shippingDiscountStore.setShippingDhaka(fee)
                    }}
                    placeholder="e.g. 70"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Outside Dhaka (৳)
                  </label>
                  <input
                    type="number"
                    value={shippingDiscountStore.shippingOutside ?? 120}
                    onChange={(e) => {
                      const fee = Number(e.target.value) || 0
                      shippingDiscountStore.setShippingOutside(fee)
                    }}
                    placeholder="e.g. 120"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="gold"
                onClick={() => {
                  const stateStr = localStorage.getItem('cop_shipping_discount_store')
                  if (stateStr) {
                    try {
                      syncToDb('shipping_settings', JSON.parse(stateStr))
                    } catch (err) {
                      console.error('Failed to parse shipping settings for sync:', err)
                    }
                  }
                  toast.success('Shipping fees updated successfully!')
                }}
                className="mt-2 w-full"
              >
                Save Shipping Fees
              </Button>
            </div>
          </AdminPanel>
        </div>

        <AdminPanel title="Coupon List" description="Manage discount codes, edit configurations, or remove coupons.">
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between hover:border-gold/20 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white text-lg tracking-wider">{coupon.code}</p>
                    <button
                      onClick={() => {
                        const updated = { ...coupon, active: !coupon.active }
                        const list = saveAdminCoupon(updated)
                        setCoupons(list)
                        toast.success(coupon.active ? 'Coupon deactivated' : 'Coupon activated')
                      }}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        coupon.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  {coupon.description && (
                    <p className="mt-1 text-sm text-gold/80 italic">&quot;{coupon.description}&quot;</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {coupon.type === 'percent'
                      ? `${coupon.discount}% off`
                      : `৳${coupon.discount} off`}
                    {' '}• Min spend ৳{coupon.minimumSpend} • Expires {coupon.expiresAt}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleEditClick(coupon)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 hover:border-gold/30 hover:text-gold hover:bg-gold/5 transition-all"
                    title="Edit Coupon"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(coupon.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-400 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
                    title="Delete Coupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {coupons.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No coupons available. Create one to get started!</p>
            )}
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
