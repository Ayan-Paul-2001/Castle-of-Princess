'use client'

import Image from 'next/image'
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ChevronDown,
  Copy,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import {
  getVisibilityFlags,
  addVisibilityFlag,
  updateVisibilityFlag,
  deleteVisibilityFlag,
  type VisibilityFlag,
} from '@/lib/visibility-flags-store'
import AdminPageHeader from '@/components/admin/admin-page-header'
import { Button } from '@/components/ui/button'
import { type AdminProduct } from '@/lib/admin-data'
import { formatPrice } from '@/lib/utils/cn'
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary-url'
import { productSchema } from '@/lib/utils/validators/schemas'
import { getAdminProducts, saveAdminProduct, deleteAdminProduct, getAdminCategories, saveAdminCategory, type AdminCategory, getAdminBrands, saveAdminBrand } from '@/lib/products-store'

const skinTypeOptions = ['dry', 'oily', 'combination', 'sensitive', 'normal']
const skinConcernOptions = [
  'acne',
  'aging',
  'brightening',
  'hydration',
  'pore',
  'dark spots',
]

type ProductEditorState = AdminProduct

const createBlankProduct = (): ProductEditorState => ({
  id: '',
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  brand: '',
  category: '',
  price: 0,
  salePrice: 0,
  stock: 0,
  images: [],
  skinTypes: [],
  skinConcerns: [],
  tags: [],
  ingredients: '',
  howToUse: '',
  variants: [],
  rating: 0,
  reviewCount: 0,
  status: 'draft',
  featured: false,
  trending: false,
  onSale: false,
  visibilityFlags: [],
  seo: {
    title: '',
    description: '',
    keywords: [],
  },
  sku: '',
})

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const splitCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export default function AdminProductsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<ProductEditorState>(createBlankProduct)
  const [variantNumericDraft, setVariantNumericDraft] = useState<
    Record<string, { stock: string; priceModifier: string }>
  >({})
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [existingCategories, setExistingCategories] = useState<AdminCategory[]>([])
  const [pendingCategoryToCreate, setPendingCategoryToCreate] = useState<string | null>(null)
  const [existingBrands, setExistingBrands] = useState<string[]>([])
  const [pendingBrandToCreate, setPendingBrandToCreate] = useState<string | null>(null)
  const [visibilityFlagsList, setVisibilityFlagsList] = useState<VisibilityFlag[]>([])
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<VisibilityFlag | null>(null)
  const [flagNameInput, setFlagNameInput] = useState('')
  const [flagDescInput, setFlagDescInput] = useState('')

  useEffect(() => {
    setIsMounted(true)
    
    const loadLocalData = () => {
      const prods = getAdminProducts()
      setProducts(prods)
      setExistingCategories(getAdminCategories())
      setExistingBrands(getAdminBrands())
      setVisibilityFlagsList(getVisibilityFlags())
      const first = prods[0]
      if (first) {
        setSelectedId(first.id)
        setDraft(first)
        setVariantNumericDraft(
          first.variants.reduce(
            (accumulator, variant) => {
              accumulator[variant.id] = {
                stock: String(variant.stock),
                priceModifier: String(variant.priceModifier),
              }
              return accumulator
            },
            {} as Record<string, { stock: string; priceModifier: string }>
          )
        )
      }
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    window.addEventListener('cop:visibilityFlagsUpdated', () => {
      setVisibilityFlagsList(getVisibilityFlags())
    })
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
    }
  }, [])

  const syncVariantNumericDraft = (variants: ProductEditorState['variants']) => {
    setVariantNumericDraft(
      variants.reduce(
        (accumulator, variant) => {
          accumulator[variant.id] = {
            stock: String(variant.stock),
            priceModifier: String(variant.priceModifier),
          }
          return accumulator
        },
        {} as Record<string, { stock: string; priceModifier: string }>
      )
    )
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [
          product.name,
          product.brand,
          product.category,
          product.sku,
          ...product.tags,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)

      const matchesStatus =
        statusFilter === 'all' ? true : product.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [products, search, statusFilter])

  const summary = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.status === 'active').length,
      featured: products.filter((product) => product.featured).length,
      lowStock: products.filter((product) => product.stock <= 10).length,
    }),
    [products]
  )

  const categorySuggestions = useMemo(() => {
    const sorted = [...existingCategories]
      .map((cat) => cat.name)
      .sort((first, second) => first.localeCompare(second))

    const query = draft.category.trim().toLowerCase()

    if (!query) return sorted.slice(0, 6)

    return sorted
      .filter((category) => category.toLowerCase().includes(query))
      .slice(0, 6)
  }, [draft.category, existingCategories])

  const brandSuggestions = useMemo(() => {
    const sorted = [...existingBrands].sort((first, second) => first.localeCompare(second))
    const query = draft.brand.trim().toLowerCase()

    if (!query) return sorted.slice(0, 6)

    return sorted
      .filter((brand) => brand.toLowerCase().includes(query))
      .slice(0, 6)
  }, [draft.brand, existingBrands])

  const primaryImage =
    draft.images.find((image) => image.isPrimary) ?? draft.images[0] ?? null

  if (!isMounted) {
    return null
  }

  const openProduct = (product: ProductEditorState) => {
    const nextDraft: ProductEditorState = {
      ...product,
      images: product.images.map((image) => ({ ...image })),
      tags: [...product.tags],
      skinTypes: [...product.skinTypes],
      skinConcerns: [...product.skinConcerns],
      variants: product.variants.map((variant) => ({ ...variant })),
      seo: {
        ...product.seo,
        keywords: [...product.seo.keywords],
      },
    }
    setSelectedId(product.id)
    setDraft(nextDraft)
    syncVariantNumericDraft(nextDraft.variants)
  }

  const handleCreateNew = () => {
    setSelectedId('')
    const nextDraft: ProductEditorState = {
      ...createBlankProduct(),
      sku: `COP-${Date.now()}`,
    }
    setDraft(nextDraft)
    syncVariantNumericDraft(nextDraft.variants)
  }

  const executeSaveProduct = (categoryToCreate?: string, brandToCreate?: string) => {
    const generatedSlug = slugify(draft.slug || draft.name)
    const finalCategory = categoryToCreate || draft.category
    const finalBrand = brandToCreate || draft.brand

    const parsed = productSchema.safeParse({
      name: draft.name,
      slug: generatedSlug,
      description: draft.description,
      shortDescription: draft.shortDescription,
      price: Number(draft.price) || 0,
      salePrice: Number(draft.salePrice) || 0,
      category: finalCategory,
      brand: finalBrand,
      skinTypes: draft.skinTypes,
      skinConcerns: draft.skinConcerns,
      stock: Number(draft.stock) || 0,
      ingredients: draft.ingredients || undefined,
      howToUse: draft.howToUse || undefined,
      tags: draft.tags,
      featured: draft.featured,
      trending: draft.trending,
      onSale: draft.onSale,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Please review product fields')
      return
    }

    if (draft.images.length === 0) {
      toast.error('Upload at least one product image')
      return
    }

    if (categoryToCreate) {
      const newCat: AdminCategory = {
        id: `cat_${Date.now()}`,
        name: categoryToCreate,
        slug: slugify(categoryToCreate),
        productCount: 1,
        featured: false,
      }
      saveAdminCategory(newCat)
    }

    if (brandToCreate) {
      saveAdminBrand(brandToCreate)
    } else if (draft.brand.trim()) {
      saveAdminBrand(draft.brand.trim())
    }

    const normalizedProduct: ProductEditorState = {
      ...draft,
      id: draft.id || `prod_${Date.now()}`,
      sku: draft.sku || `COP-${Date.now()}`,
      slug: generatedSlug,
      category: finalCategory,
      brand: finalBrand,
      price: Number(draft.price) || 0,
      salePrice: Number(draft.salePrice) || 0,
      stock: Number(draft.stock) || 0,
      rating: Number(draft.rating) || 0,
      reviewCount: Number(draft.reviewCount) || 0,
      onSale: Boolean(draft.salePrice && Number(draft.salePrice) > 0),
      images: (() => {
        const primaryIdx = draft.images.findIndex((img) => img.isPrimary)
        const targetIdx = primaryIdx !== -1 ? primaryIdx : 0
        return draft.images.map((image, index) => ({
          ...image,
          isPrimary: index === targetIdx,
        }))
      })(),
    }

    const updatedList = saveAdminProduct(normalizedProduct)
    setProducts(updatedList)
    setExistingCategories(getAdminCategories())
    setExistingBrands(getAdminBrands())

    setSelectedId(normalizedProduct.id)
    setDraft(normalizedProduct)
    toast.success(draft.id ? 'Product updated' : 'Product created')
  }

  const handleSaveProduct = () => {
    const productCategoryName = draft.category.trim()
    const productBrandName = draft.brand.trim()
    if (!productCategoryName) {
      toast.error('Category is required')
      return
    }

    const allCategories = getAdminCategories()
    const categoryExists = allCategories.some(
      (cat) =>
        cat.name.toLowerCase().trim() === productCategoryName.toLowerCase() ||
        cat.slug.toLowerCase().trim() === slugify(productCategoryName)
    )

    if (!categoryExists) {
      setPendingCategoryToCreate(productCategoryName)
      return
    }

    const allBrands = getAdminBrands()
    const brandExists = allBrands.some(
      (b) => b.toLowerCase().trim() === productBrandName.toLowerCase()
    )

    if (productBrandName && !brandExists) {
      setPendingBrandToCreate(productBrandName)
      return
    }

    executeSaveProduct()
  }

  const handleDeleteProduct = () => {
    if (!draft.id) {
      handleCreateNew()
      toast.success('Draft cleared')
      return
    }

    const remainingProducts = deleteAdminProduct(draft.id)
    setProducts(remainingProducts)

    if (remainingProducts[0]) {
      openProduct(remainingProducts[0])
    } else {
      handleCreateNew()
    }

    toast.success('Product deleted')
  }

  const handleDuplicateProduct = () => {
    if (!draft.name) {
      toast.error('Select or create a product first')
      return
    }

    const duplicate: ProductEditorState = {
      ...draft,
      id: '',
      name: `${draft.name} Copy`,
      slug: `${slugify(draft.slug || draft.name)}-copy`,
      sku: `COP-${Date.now()}`,
      status: 'draft',
      images: draft.images.map((image) => ({
        ...image,
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      })),
      variants: draft.variants.map((variant) => ({
        ...variant,
        id: `variant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      })),
    }

    setSelectedId('')
    setDraft(duplicate)
    syncVariantNumericDraft(duplicate.variants)
    toast.success('Duplicate ready to save')
  }

  const addFilesToGallery = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const uploadToast = toast.loading(`Uploading ${fileArray.length} image(s)...`)
    try {
      const uploadPromises = fileArray.map(async (file, i) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'castle-of-princess/products')

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Upload failed')
        }

        const data = await res.json()
        return {
          id: `image_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          url: data.secure_url || data.url,
          alt: file.name.replace(/\.[^.]+$/, ''),
          isPrimary: false,
        }
      })

      const results = await Promise.allSettled(uploadPromises)
      
      const successfulImages: Array<{ id: string; url: string; alt: string; isPrimary: boolean }> = []
      const failedFiles: string[] = []

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          successfulImages.push(result.value)
        } else {
          const fileError = result.reason as Error
          console.error(`Upload error for file ${fileArray[idx].name}:`, fileError)
          failedFiles.push(fileArray[idx].name)
        }
      })

      if (successfulImages.length > 0) {
        setDraft((current) => {
          const combined = [...current.images, ...successfulImages]
          const primaryIdx = combined.findIndex((img) => img.isPrimary)
          const targetIdx = primaryIdx !== -1 ? primaryIdx : 0
          return {
            ...current,
            images: combined.map((img, idx) => ({
              ...img,
              isPrimary: idx === targetIdx,
            })),
          }
        })
      }

      if (failedFiles.length === 0) {
        toast.success(`Successfully uploaded ${successfulImages.length} image(s)`, { id: uploadToast })
      } else if (successfulImages.length > 0) {
        toast.success(
          `Uploaded ${successfulImages.length} image(s). Failed to upload: ${failedFiles.join(', ')}`,
          { id: uploadToast, duration: 6000 }
        )
      } else {
        toast.error(`Failed to upload: ${failedFiles.join(', ')}`, { id: uploadToast })
      }
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message || 'Unknown error'}`, { id: uploadToast })
    }
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return
    addFilesToGallery(event.target.files)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!event.dataTransfer.files?.length) return
    addFilesToGallery(event.dataTransfer.files)
  }

  const updateVariant = (
    id: string,
    field: 'name' | 'value' | 'stock' | 'priceModifier',
    value: string
  ) => {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              [field]:
                field === 'stock' || field === 'priceModifier' ? Number(value) : value,
            }
          : variant
      ),
    }))
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Run your catalog with a richer WooCommerce-style workflow: manage content, pricing, gallery images, SEO, and product variants in one editor."
        action={
          <Button variant="gold" onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total products', value: summary.total },
          { label: 'Published', value: summary.active },
          { label: 'Featured', value: summary.featured },
          { label: 'Low stock', value: summary.lowStock },
        ].map((item) => (
          <div
            key={item.label}
            className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(212,175,55,0.14),rgba(255,255,255,0.04)_38%,rgba(255,255,255,0.02))] p-5"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <section className="glass rounded-[2rem] p-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-gold/70">Catalog Rail</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Product Library</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Browse the catalog, filter by status, and jump straight into editing.
                </p>
              </div>
              <div className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-gold">
                {filteredProducts.length}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products"
                  className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-white outline-none transition-colors focus:border-gold"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'all' | 'active' | 'draft')
                  }
                  className="appearance-none rounded-full border border-white/10 bg-black/40 px-5 py-3 pr-10 text-white outline-none transition-colors focus:border-gold"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
              <span className="text-xs uppercase tracking-[0.24em] text-gold">Live list</span>
              <span className="text-gray-400">
                {filteredProducts.length} / {products.length}
              </span>
            </div>

            <div className="mt-4 space-y-3 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto xl:pr-2">
              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
                  <p className="text-sm font-medium text-white">No products found</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Try another search or switch the status filter.
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const libraryImage =
                    Array.isArray(product.images)
                      ? (product.images.find((image: any) => image?.isPrimary) ?? product.images[0] ?? (product as any).image ?? null)
                      : ((product as any).image ?? null)

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => openProduct(product)}
                      className={`group w-full rounded-[1.4rem] border p-3 text-left transition-all ${
                        selectedId === product.id
                          ? 'border-gold/40 bg-gold/10 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                          {libraryImage ? (
                            <Image
                              src={getOptimizedImageUrl(libraryImage)}
                              alt={typeof libraryImage === 'object' ? libraryImage.alt || product.name : product.name}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                if (target && !target.src.includes('cleanser.jpg')) {
                                  target.src = '/categories/cleanser.jpg'
                                }
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-[11px] text-gray-500">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-white">{product.name}</p>
                              <p className="mt-1 truncate text-sm text-gray-500">
                                {product.brand} • {product.category}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${
                                product.status === 'active'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-white/10 text-gray-300'
                              }`}
                            >
                              {product.status}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 font-medium text-gold">
                              {formatPrice(product.salePrice || product.price)}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-gray-300">
                              Stock {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </section>

          <section className="glass rounded-[2rem] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-gold/70">Current Focus</p>
            <h3 className="mt-3 text-xl font-semibold text-white">
              {draft.name || 'Untitled Product'}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {draft.shortDescription ||
                'Select a product to start shaping its storefront story, pricing, media, and discovery settings.'}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Status</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {draft.status === 'active' ? 'Published' : 'Draft'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">SKU</p>
                <p className="mt-2 break-all text-sm font-medium text-white">
                  {draft.sku || 'Pending'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Gallery</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {draft.images.length} image{draft.images.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(212,175,55,0.16),rgba(255,255,255,0.04)_35%,rgba(0,0,0,0.32)_100%)] p-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-[240px_1fr]">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-gray-400">
                  <span>Showcase</span>
                  <span className="text-gold">Primary</span>
                </div>
                <div className="relative aspect-square bg-black/40">
                  {primaryImage ? (
                    <Image
                      src={getOptimizedImageUrl(primaryImage.url)}
                      alt={primaryImage.alt}
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
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                      Upload product media
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-gold">
                    {draft.status === 'active' ? 'Published' : 'Draft'}
                  </span>
                  {draft.featured && (
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                      Featured
                    </span>
                  )}
                  {draft.trending && (
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                      Trending
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-500">
                    {draft.brand || 'Brand'} • {draft.category || 'Category'}
                  </p>
                  <h2 className="mt-3 break-words font-playfair text-4xl leading-tight text-white">
                    {draft.name || 'Untitled Product'}
                  </h2>
                  <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-300">
                    {draft.shortDescription ||
                      'Shape the product story here with stronger content, richer media, and sharper merchandising controls.'}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDuplicateProduct}
                    className="flex-1 min-w-[120px] bg-white/[0.03]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteProduct}
                    className="flex-1 min-w-[120px] bg-white/[0.03]"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button variant="gold" onClick={handleSaveProduct} className="flex-1 min-w-[140px]">
                    Save Product
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 grid-cols-1">
            <section className="glass rounded-[2rem] p-6">
              <div className="mb-5 border-b border-white/10 pb-5">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                  Story Builder
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Identity & Narrative
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Control how the product is named, categorized, and described across the
                  storefront.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-gray-400">Product name</label>
                  <input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((current) => ({
                        ...current,
                        name: e.target.value,
                        slug: current.slug ? current.slug : slugify(e.target.value),
                      }))
                    }
                    placeholder="Luxury product title"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Slug</label>
                  <input
                    value={draft.slug}
                    onChange={(e) =>
                      setDraft((current) => ({
                        ...current,
                        slug: slugify(e.target.value),
                      }))
                    }
                    placeholder="product-slug"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">SKU</label>
                  <input
                    value={draft.sku}
                    onChange={(e) =>
                      setDraft((current) => ({ ...current, sku: e.target.value }))
                    }
                    placeholder="COP-XXXX"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Brand</label>
                  <input
                    value={draft.brand}
                    onChange={(e) =>
                      setDraft((current) => ({ ...current, brand: e.target.value }))
                    }
                    placeholder="Brand name"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {brandSuggestions.length > 0 &&
                      brandSuggestions.map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setDraft((current) => ({ ...current, brand }))}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
                        >
                          {brand}
                        </button>
                      ))
                    }
                  </div>
                  {draft.brand.trim() !== '' && brandSuggestions.length === 0 && (
                    <p className="px-1 text-xs text-amber-400 font-medium mt-2">
                      Not existing brand
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Category</label>
                  <input
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((current) => ({ ...current, category: e.target.value }))
                    }
                    placeholder="Category"
                    className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categorySuggestions.length > 0 &&
                      categorySuggestions.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setDraft((current) => ({ ...current, category }))}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
                        >
                          {category}
                        </button>
                      ))
                    }
                  </div>
                  {draft.category.trim() !== '' && categorySuggestions.length === 0 && (
                    <p className="px-1 text-xs text-amber-400 font-medium mt-2">
                      Not existing category
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-gray-400">Short description</label>
                  <textarea
                    rows={3}
                    value={draft.shortDescription}
                    onChange={(e) =>
                      setDraft((current) => ({
                        ...current,
                        shortDescription: e.target.value,
                      }))
                    }
                    placeholder="A crisp product summary for cards and hero placements"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-gray-400">Full description</label>
                  <textarea
                    rows={7}
                    value={draft.description}
                    onChange={(e) =>
                      setDraft((current) => ({ ...current, description: e.target.value }))
                    }
                    placeholder="Write the full editorial-style product description"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>
            </section>

            <section className="glass rounded-[2rem] p-6">
              <div className="mb-5 border-b border-white/10 pb-5">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                  Ritual Notes
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Ingredients & Usage
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Add the conversion-focused details customers look for on the product page.
                </p>
              </div>

              <div className="space-y-4">
                <textarea
                  rows={6}
                  value={draft.ingredients || ''}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      ingredients: e.target.value,
                    }))
                  }
                  placeholder="Key ingredients"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition-colors focus:border-gold"
                />
                <textarea
                  rows={6}
                  value={draft.howToUse || ''}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      howToUse: e.target.value,
                    }))
                  }
                  placeholder="How to use"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition-colors focus:border-gold"
                />
              </div>
            </section>
          </div>

          <div className="grid gap-6 grid-cols-1">
            <section className="glass rounded-[2rem] p-6">
              <div className="mb-5 border-b border-white/10 pb-5">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                  Media Atelier
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Gallery Studio</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Upload and arrange the visual story customers will see first.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gold/30 bg-gold/5 px-6 py-10 text-center transition-colors hover:border-gold/60 hover:bg-gold/10"
              >
                <ImagePlus className="mb-4 h-8 w-8 text-gold" />
                <p className="font-medium text-white">Drop product images here</p>
                <p className="mt-2 text-sm text-gray-400">
                  Upload multiple images for gallery, hover, and detail page storytelling.
                </p>
              </button>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {draft.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <div className="relative aspect-[4/3] bg-black/40">
                      <Image
                        src={getOptimizedImageUrl(image.url)}
                        alt={image.alt}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {image.isPrimary && (
                        <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-black">
                          Primary
                        </span>
                      )}
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <input
                        value={image.alt}
                        onChange={(e) =>
                          setDraft((current) => ({
                            ...current,
                            images: current.images.map((item) =>
                              item.id === image.id ? { ...item, alt: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="Alt text"
                        className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-white outline-none transition-colors focus:border-gold"
                      />
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant={image.isPrimary ? 'gold' : 'outline'}
                          size="sm"
                          disabled={image.isPrimary}
                          onClick={() =>
                            setDraft((current) => {
                              const selected = current.images.find((item) => item.id === image.id)
                              if (!selected) return current
                              const others = current.images.filter((item) => item.id !== image.id)
                              const updatedSelected = { ...selected, isPrimary: true }
                              const updatedOthers = others.map((item) => ({ ...item, isPrimary: false }))
                              return {
                                ...current,
                                images: [updatedSelected, ...updatedOthers],
                              }
                            })
                          }
                        >
                          {image.isPrimary ? 'Primary' : 'Set Primary'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDraft((current) => {
                              const remaining = current.images.filter((item) => item.id !== image.id)
                              if (image.isPrimary && remaining.length > 0) {
                                remaining[0] = { ...remaining[0], isPrimary: true }
                              }
                              return {
                                ...current,
                                images: remaining,
                              }
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass rounded-[2rem] p-6">
              <div className="mb-5 border-b border-white/10 pb-5">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                  Discovery Layer
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">SEO & Search</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Tune metadata for better search visibility and richer sharing previews.
                </p>
              </div>

              <div className="grid gap-4">
                <input
                  value={draft.seo.title}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      seo: {
                        ...current.seo,
                        title: e.target.value,
                      },
                    }))
                  }
                  placeholder="SEO title"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
                <textarea
                  rows={6}
                  value={draft.seo.description}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      seo: {
                        ...current.seo,
                        description: e.target.value,
                      },
                    }))
                  }
                  placeholder="SEO description"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition-colors focus:border-gold"
                />
                <input
                  value={draft.seo.keywords.join(', ')}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      seo: {
                        ...current.seo,
                        keywords: splitCsv(e.target.value),
                      },
                    }))
                  }
                  placeholder="korean skincare bangladesh, glow serum, premium beauty"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>
            </section>
          </div>

          <section className="glass rounded-[2rem] p-6">
            <div className="mb-5 border-b border-white/10 pb-5">
              <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                Option Matrix
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Variants</h3>
              <p className="mt-2 text-sm text-gray-400">
                Manage size, shade, or option-based product variations in one wide workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Variant Combinations</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Create size, shade, or pack options with stock and price adjustments.
                  </p>
                </div>
                <div className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-medium text-gold">
                  {draft.variants.length} variant{draft.variants.length === 1 ? '' : 's'}
                </div>
              </div>

              {draft.variants.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                  <p className="text-base font-medium text-white">No variants added yet</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Add options like size, shade, or bundle type for this product.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {draft.variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5"
                    >
                      <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                            Variant {index + 1}
                          </p>
                          <p className="mt-2 text-sm text-gray-400">
                            Define the label, value, stock, and pricing difference.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDraft((current) => ({
                              ...current,
                              variants: current.variants.filter((item) => item.id !== variant.id),
                            }))
                            setVariantNumericDraft((current) => {
                              const { [variant.id]: _, ...rest } = current
                              return rest
                            })
                          }}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <label className="mb-2 block text-sm text-gray-400">Option name</label>
                          <input
                            value={variant.name}
                            onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                            placeholder="Size"
                            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-400">Option value</label>
                          <input
                            value={variant.value}
                            onChange={(e) => updateVariant(variant.id, 'value', e.target.value)}
                            placeholder="50 ml"
                            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-400">Stock</label>
                          <input
                            inputMode="numeric"
                            value={variantNumericDraft[variant.id]?.stock ?? String(variant.stock)}
                            onChange={(e) => {
                              const nextValue = e.target.value
                              setVariantNumericDraft((current) => ({
                                ...current,
                                [variant.id]: {
                                  stock: nextValue,
                                  priceModifier:
                                    current[variant.id]?.priceModifier ??
                                    String(variant.priceModifier),
                                },
                              }))

                              if (nextValue.trim() === '') {
                                setDraft((current) => ({
                                  ...current,
                                  variants: current.variants.map((item) =>
                                    item.id === variant.id ? { ...item, stock: 0 } : item
                                  ),
                                }))
                                return
                              }

                              const parsed = Number(nextValue)
                              if (!Number.isFinite(parsed)) return

                              setDraft((current) => ({
                                ...current,
                                variants: current.variants.map((item) =>
                                  item.id === variant.id ? { ...item, stock: parsed } : item
                                ),
                              }))
                            }}
                            onBlur={() => {
                              setVariantNumericDraft((current) => {
                                const currentValue = current[variant.id]?.stock ?? ''
                                const parsed = Number(currentValue)
                                if (currentValue.trim() !== '' && !Number.isFinite(parsed)) {
                                  return {
                                    ...current,
                                    [variant.id]: {
                                      stock: String(variant.stock),
                                      priceModifier:
                                        current[variant.id]?.priceModifier ??
                                        String(variant.priceModifier),
                                    },
                                  }
                                }
                                return current
                              })
                            }}
                            placeholder="0"
                            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-400">Price +/-</label>
                          <input
                            inputMode="decimal"
                            value={
                              variantNumericDraft[variant.id]?.priceModifier ??
                              String(variant.priceModifier)
                            }
                            onChange={(e) => {
                              const nextValue = e.target.value
                              setVariantNumericDraft((current) => ({
                                ...current,
                                [variant.id]: {
                                  stock: current[variant.id]?.stock ?? String(variant.stock),
                                  priceModifier: nextValue,
                                },
                              }))

                              if (nextValue.trim() === '') {
                                setDraft((current) => ({
                                  ...current,
                                  variants: current.variants.map((item) =>
                                    item.id === variant.id
                                      ? { ...item, priceModifier: 0 }
                                      : item
                                  ),
                                }))
                                return
                              }

                              const parsed = Number(nextValue)
                              if (!Number.isFinite(parsed)) return

                              setDraft((current) => ({
                                ...current,
                                variants: current.variants.map((item) =>
                                  item.id === variant.id
                                    ? { ...item, priceModifier: parsed }
                                    : item
                                ),
                              }))
                            }}
                            onBlur={() => {
                              setVariantNumericDraft((current) => {
                                const currentValue = current[variant.id]?.priceModifier ?? ''
                                const parsed = Number(currentValue)
                                if (currentValue.trim() !== '' && !Number.isFinite(parsed)) {
                                  return {
                                    ...current,
                                    [variant.id]: {
                                      stock: current[variant.id]?.stock ?? String(variant.stock),
                                      priceModifier: String(variant.priceModifier),
                                    },
                                  }
                                }
                                return current
                              })
                            }}
                            placeholder="0"
                            className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                onClick={() =>
                  setDraft((current) => {
                    const newId = `variant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
                    setVariantNumericDraft((numericDraft) => ({
                      ...numericDraft,
                      [newId]: { stock: '0', priceModifier: '0' },
                    }))
                    return {
                      ...current,
                      variants: [
                        ...current.variants,
                        {
                          id: newId,
                          name: '',
                          value: '',
                          stock: 0,
                          priceModifier: 0,
                        },
                      ],
                    }
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-6 2xl:sticky 2xl:top-8 2xl:self-start">
          <section className="glass rounded-[2rem] p-6">
            <div className="mb-5 border-b border-white/10 pb-5">
              <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                Commerce Console
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Pricing & Inventory</h3>
              <p className="mt-2 text-sm text-gray-400">
                Set pricing, stock, review proof, and publishing controls from one command box.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Regular price</label>
                <input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      price: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Sale price</label>
                <input
                  type="number"
                  min={0}
                  value={draft.salePrice || 0}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      salePrice: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Stock</label>
                <input
                  type="number"
                  min={0}
                  value={draft.stock}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      stock: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Status</label>
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      status: e.target.value as 'active' | 'draft',
                    }))
                  }
                  className="w-full appearance-none rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                >
                  <option value="active">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </section>

          <section className="glass rounded-[2rem] p-6">
            <div className="mb-5 border-b border-white/10 pb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                  Merchandising
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Visibility Flags</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Control placement, custom trend tags, and Luxury Gallery matching.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingFlag(null)
                  setFlagNameInput('')
                  setFlagDescInput('')
                  setIsFlagModalOpen(true)
                }}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                <Plus className="mr-1 h-4 w-4" /> Add Flag
              </Button>
            </div>

            <div className="space-y-3">
              {visibilityFlagsList.map((flag) => {
                const isSelected =
                  (draft.visibilityFlags && draft.visibilityFlags.includes(flag.name)) ||
                  (flag.id === 'featured' && draft.featured) ||
                  (flag.id === 'trending' && draft.trending) ||
                  (flag.id === 'onSale' && draft.onSale)

                return (
                  <div
                    key={flag.id}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-gold/50 bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const currentFlags = draft.visibilityFlags || []
                        let updatedFlags: string[]
                        if (isSelected) {
                          updatedFlags = currentFlags.filter((f) => f !== flag.name)
                        } else {
                          updatedFlags = [...currentFlags, flag.name]
                        }

                        setDraft((current) => ({
                          ...current,
                          visibilityFlags: updatedFlags,
                          featured: flag.id === 'featured' ? !isSelected : current.featured,
                          trending: flag.id === 'trending' ? !isSelected : current.trending,
                          onSale: flag.id === 'onSale' ? !isSelected : current.onSale,
                        }))
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{flag.name}</span>
                        {isSelected && (
                          <span className="inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gold font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      {flag.description && (
                        <p className="mt-1 text-sm text-gray-400">{flag.description}</p>
                      )}
                    </button>

                    <div className="flex items-center space-x-2 ml-4">
                      <Sparkles className={`h-5 w-5 ${isSelected ? 'text-gold' : 'text-gray-600'}`} />
                      {!flag.isSystem && (
                        <div className="flex items-center space-x-1 pl-2 border-l border-white/10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingFlag(flag)
                              setFlagNameInput(flag.name)
                              setFlagDescInput(flag.description || '')
                              setIsFlagModalOpen(true)
                            }}
                            className="p-1.5 text-gray-400 hover:text-gold transition-colors"
                            title="Edit Flag"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Delete visibility flag "${flag.name}"?`)) {
                                deleteVisibilityFlag(flag.id)
                                toast.success(`Deleted flag "${flag.name}"`)
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Flag"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="glass rounded-[2rem] p-6">
            <div className="mb-5 border-b border-white/10 pb-5">
              <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                Skin Mapping
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Taxonomy</h3>
              <p className="mt-2 text-sm text-gray-400">
                Connect this product to skin types, concerns, and campaign-ready tags.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm text-gray-400">Skin types</p>
                <div className="flex flex-wrap gap-3">
                  {skinTypeOptions.map((option) => {
                    const active = draft.skinTypes.includes(option)
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            skinTypes: active
                              ? current.skinTypes.filter((item) => item !== option)
                              : [...current.skinTypes, option],
                          }))
                        }
                        className={`rounded-full px-4 py-2 text-sm capitalize transition-colors ${
                          active
                            ? 'bg-gold/15 text-gold'
                            : 'border border-white/10 bg-white/[0.04] text-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm text-gray-400">Skin concerns</p>
                <div className="flex flex-wrap gap-3">
                  {skinConcernOptions.map((option) => {
                    const active = draft.skinConcerns.includes(option)
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            skinConcerns: active
                              ? current.skinConcerns.filter((item) => item !== option)
                              : [...current.skinConcerns, option],
                          }))
                        }
                        className={`rounded-full px-4 py-2 text-sm capitalize transition-colors ${
                          active
                            ? 'bg-gold/15 text-gold'
                            : 'border border-white/10 bg-white/[0.04] text-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Tags</label>
                <input
                  value={draft.tags.join(', ')}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      tags: splitCsv(e.target.value),
                    }))
                  }
                  placeholder="glass skin, soothing, hydration"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold"
                />
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Confirmation Modal for New Category */}
      {pendingCategoryToCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-black/95 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-playfair text-2xl font-semibold text-white">
              New Category Detected
            </h3>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">
              The category <strong className="text-gold">&ldquo;{pendingCategoryToCreate}&rdquo;</strong> does not exist. Would you like to create this category and save the product?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setPendingCategoryToCreate(null)}
                className="rounded-full border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                type="button"
                onClick={() => {
                  const newCat: AdminCategory = {
                    id: `cat_${Date.now()}`,
                    name: pendingCategoryToCreate,
                    slug: slugify(pendingCategoryToCreate),
                    productCount: 1,
                    featured: false,
                  }
                  saveAdminCategory(newCat)
                  setPendingCategoryToCreate(null)

                  // Check if brand is also new before executing save
                  const productBrandName = draft.brand.trim()
                  const allBrands = getAdminBrands()
                  const brandExists = allBrands.some(
                    (b) => b.toLowerCase().trim() === productBrandName.toLowerCase()
                  )

                  if (productBrandName && !brandExists) {
                    setPendingBrandToCreate(productBrandName)
                  } else {
                    executeSaveProduct(pendingCategoryToCreate)
                  }
                }}
                className="rounded-full"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for New Brand */}
      {pendingBrandToCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-black/95 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-playfair text-2xl font-semibold text-white">
              New Brand Detected
            </h3>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">
              The brand <strong className="text-gold">&ldquo;{pendingBrandToCreate}&rdquo;</strong> does not exist. Would you like to create this brand and save the product?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setPendingBrandToCreate(null)}
                className="rounded-full border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                type="button"
                onClick={() => {
                  executeSaveProduct(undefined, pendingBrandToCreate)
                  setPendingBrandToCreate(null)
                }}
                className="rounded-full"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* CRUD Modal for Visibility Flags */}
      {isFlagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl">
            <h3 className="font-playfair text-2xl font-semibold text-white mb-2">
              {editingFlag ? 'Edit Visibility Flag' : 'Add New Visibility Flag'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Visibility flags control homepage features and match items in the Luxury Beauty Gallery.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-gold/70 block mb-2 font-medium">
                  Flag Name
                </label>
                <input
                  type="text"
                  value={flagNameInput}
                  onChange={(e) => setFlagNameInput(e.target.value)}
                  placeholder="e.g. Radiance Ritual, K-Beauty Mood"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gold/70 block mb-2 font-medium">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={flagDescInput}
                  onChange={(e) => setFlagDescInput(e.target.value)}
                  placeholder="e.g. Silky textures and soft glow"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsFlagModalOpen(false)}
                className="rounded-full border-white/10 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                type="button"
                onClick={() => {
                  if (!flagNameInput.trim()) {
                    toast.error('Flag name is required')
                    return
                  }
                  if (editingFlag) {
                    updateVisibilityFlag(editingFlag.id, flagNameInput, flagDescInput)
                    toast.success(`Updated flag "${flagNameInput.trim()}"`)
                  } else {
                    addVisibilityFlag(flagNameInput, flagDescInput)
                    toast.success(`Added visibility flag "${flagNameInput.trim()}"`)
                  }
                  setIsFlagModalOpen(false)
                }}
                className="rounded-full"
              >
                {editingFlag ? 'Save Changes' : 'Create Flag'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
