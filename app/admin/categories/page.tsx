'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, X, Upload } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import { getAdminCategories, saveAdminCategoriesList, getAdminBrands } from '@/lib/products-store'
import { syncToDb } from '@/lib/utils/sync'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', slug: '', image: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [brands, setBrands] = useState<string[]>([])
  const [brandForm, setBrandForm] = useState({ name: '' })
  const [editingBrand, setEditingBrand] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    
    const loadLocalData = () => {
      setCategories(getAdminCategories())
      setBrands(getAdminBrands())
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
    }
  }, [])

  const saveCategories = (newCats: typeof categories) => {
    setCategories(newCats)
    saveAdminCategoriesList(newCats)
  }

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault()
    const name = brandForm.name.trim()
    if (!name) {
      toast.error('Enter brand name')
      return
    }

    if (editingBrand) {
      const updated = brands.map((b) =>
        b === editingBrand ? name : b
      )
      setBrands(updated)
      localStorage.setItem('cop_brands', JSON.stringify(updated))
      syncToDb('brands', updated)
      setEditingBrand(null)
      toast.success('Brand updated')
    } else {
      const exists = brands.some((b) => b.toLowerCase().trim() === name.toLowerCase().trim())
      if (exists) {
        toast.error('Brand already exists')
        return
      }
      const updated = [...brands, name]
      setBrands(updated)
      localStorage.setItem('cop_brands', JSON.stringify(updated))
      syncToDb('brands', updated)
      toast.success('Brand added')
    }
    setBrandForm({ name: '' })
  }

  const handleDeleteBrand = (brandName: string) => {
    const updated = brands.filter((b) => b !== brandName)
    setBrands(updated)
    localStorage.setItem('cop_brands', JSON.stringify(updated))
    syncToDb('brands', updated)
    if (editingBrand === brandName) {
      setEditingBrand(null)
      setBrandForm({ name: '' })
    }
    toast.success('Brand removed')
  }

  const uploadCategoryImageFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'castle-of-princess/categories')

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      setUploading(true)
      const url = await uploadCategoryImageFile(file)
      setForm((curr) => ({ ...curr, image: url }))
      toast.success('Image uploaded to Cloudinary')
    } catch (error: any) {
      const message =
        typeof error?.message === 'string' ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) {
      toast.error('Enter category name and slug')
      return
    }

    if (editingId) {
      const updated = categories.map((cat: any) =>
        cat.id === editingId ? { ...cat, name: form.name, slug: form.slug, image: form.image } : cat
      )
      saveCategories(updated)
      setEditingId(null)
      toast.success('Category updated')
    } else {
      const newCat = {
        id: `cat_${Date.now()}`,
        name: form.name,
        slug: form.slug,
        image: form.image,
        productCount: 0,
        featured: false,
      }
      saveCategories([newCat, ...categories])
      toast.success('Category added')
    }
    setForm({ name: '', slug: '', image: '' })
  }

  if (!isMounted) {
    return <div className="min-h-screen" />
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog Structure"
        title="Categories & Brand"
        description="Create and maintain shop categories and brands used across discovery and navigation."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminPanel
          title={editingId ? 'Edit Category' : 'Add Category'}
          description={
            editingId
              ? 'Update the selected shop category details.'
              : 'Create a new shop taxonomy item for the storefront.'
          }
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <input
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              placeholder="Category name"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <input
              value={form.slug}
              onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))}
              placeholder="category-slug"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />

            {/* Category Image upload field */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.24em] text-gray-500">Category Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {form.image ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/40">
                    <Image
                      src={form.image}
                      alt="Category Preview"
                      fill
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        if (target && !target.src.includes('cleanser.jpg')) {
                          target.src = '/categories/cleanser.jpg'
                        }
                      }}
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/[0.03]"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      onClick={() => setForm((curr) => ({ ...curr, image: '' }))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-8 text-center transition-colors hover:border-gold/40 hover:bg-gold/5"
                  disabled={uploading}
                >
                  <Upload className="mb-2 h-6 w-6 text-gray-400" />
                  <p className="text-sm font-medium text-white">
                    {uploading ? 'Uploading...' : 'Upload category image'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP or GIF</p>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="gold" className="flex-1" disabled={uploading}>
                {editingId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingId ? 'Update Category' : 'Save Category'}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setForm({ name: '', slug: '', image: '' })
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel title="Category List" description="Feature categories or remove unused ones from the storefront.">
          <div className="space-y-4">
            {categories.map((category: any) => (
              <div
                key={category.id}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 flex items-center justify-center">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        unoptimized
                        className="object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          if (target && !target.src.includes('cleanser.jpg')) {
                            target.src = '/categories/cleanser.jpg'
                          }
                        }}
                      />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-gray-600">No Image</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{category.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      `/{category.slug}` • {category.productCount} products
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const updated = categories.map((item: any) =>
                        item.id === category.id ? { ...item, featured: !item.featured } : item
                      )
                      saveCategories(updated)
                      toast.success(
                        category.featured
                          ? 'Category removed from featured'
                          : 'Category added to featured'
                      )
                    }}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      category.featured
                        ? 'bg-gold/15 text-gold'
                        : 'border border-white/10 bg-white/[0.04] text-gray-300'
                    }`}
                  >
                    {category.featured ? 'Featured' : 'Feature'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingId(category.id)
                      setForm({ name: category.name, slug: category.slug, image: category.image || '' })
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      editingId === category.id
                        ? 'bg-gold/20 border-gold text-gold font-medium'
                        : 'border-white/10 bg-white/[0.04] text-gray-300 hover:border-gold/30 hover:text-gold'
                    }`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      const updated = categories.filter((item: any) => item.id !== category.id)
                      saveCategories(updated)
                      if (editingId === category.id) {
                        setEditingId(null)
                        setForm({ name: '', slug: '', image: '' })
                      }
                      toast.success('Category removed')
                    }}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="my-10 border-t border-white/10" />

      <div className="mb-6">
        <h2 className="font-playfair text-3xl font-bold text-gradient-gold">Brands Management</h2>
        <p className="mt-2 text-sm text-gray-400">Add, edit, or delete brands sold on the storefront.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminPanel
          title={editingBrand ? 'Edit Brand' : 'Add Brand'}
          description={
            editingBrand
              ? 'Update the selected brand details.'
              : 'Create a new brand for the storefront.'
          }
        >
          <form onSubmit={handleSaveBrand} className="space-y-4">
            <input
              value={brandForm.name}
              onChange={(e) => setBrandForm({ name: e.target.value })}
              placeholder="Brand name"
              className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
            />
            <div className="flex gap-3">
              <Button type="submit" variant="gold" className="flex-1">
                {editingBrand ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingBrand ? 'Update Brand' : 'Save Brand'}
              </Button>
              {editingBrand && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingBrand(null)
                    setBrandForm({ name: '' })
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel title="Brand List" description="Manage all available brands.">
          <div className="space-y-4">
            {brands.map((brand) => (
              <div
                key={brand}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{brand}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setEditingBrand(brand)
                      setBrandForm({ name: brand })
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      editingBrand === brand
                        ? 'bg-gold/20 border-gold text-gold font-medium'
                        : 'border-white/10 bg-white/[0.04] text-gray-300 hover:border-gold/30 hover:text-gold'
                    }`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteBrand(brand)}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {brands.length === 0 && (
              <p className="text-gray-500 text-sm italic">No brands found.</p>
            )}
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
