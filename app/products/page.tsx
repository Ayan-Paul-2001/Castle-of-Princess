'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronDown, Sparkles } from 'lucide-react'
import ProductCard from '@/components/products/product-card'
import { Button } from '@/components/ui/button'
import { mockProducts, type MockProduct } from '@/lib/products-mock'
import { getMockProducts, getAdminCategories, getAdminBrands } from '@/lib/products-store'

const defaultBrands = ['COSRX', 'Beauty of Joseon', 'Anua', 'Some By Mi', 'Round Lab']
const skinTypes = ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal']
const skinConcerns = ['Acne', 'Aging', 'Brightening', 'Hydration', 'Pore', 'Dark Spots']

const defaultCategories = [
  'cleanser',
  'toner-mist',
  'serum-essence',
  'moisturiser',
  'sun-protection',
  'face-mask',
]

const defaultCategoryLabels: Record<string, string> = {
  cleanser: 'Cleanser',
  'toner-mist': 'Toner & Mist',
  'serum-essence': 'Serum & Essence',
  moisturiser: 'Moisturiser',
  'sun-protection': 'Sun Protection',
  'face-mask': 'Face Mask',
}

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

function parseConcernFilters(value: string | null): {
  concerns: string[]
  skinTypes: string[]
} {
  if (!value) {
    return { concerns: [], skinTypes: [] }
  }

  switch (value) {
    case 'dry-skin':
      return { concerns: [], skinTypes: ['Dry'] }
    case 'oily-skin':
      return { concerns: [], skinTypes: ['Oily'] }
    case 'sensitive':
      return { concerns: [], skinTypes: ['Sensitive'] }
    case 'acne':
      return { concerns: ['Acne'], skinTypes: [] }
    case 'dark-spots':
      return { concerns: ['Dark Spots'], skinTypes: [] }
    case 'glass-skin':
      return { concerns: ['Hydration', 'Brightening'], skinTypes: [] }
    default:
      return { concerns: [], skinTypes: [] }
  }
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsPageInner />
    </Suspense>
  )
}

function ProductsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryFromQuery = searchParams.get('category')
  const brandFromQuery = searchParams.get('brand')
  const concernFromQuery = searchParams.get('concern')
  const searchFromQuery = searchParams.get('search')
  const sortFromQuery = searchParams.get('sort')
  const featuredFromQuery = searchParams.get('featured')
  const flagFromQuery = searchParams.get('flag') || searchParams.get('tag')
  const initialConcernFilters = parseConcernFilters(concernFromQuery)

  const [products, setProducts] = useState<MockProduct[]>(mockProducts)
  const [search, setSearch] = useState(searchFromQuery || '')
  const [selectedFlag, setSelectedFlag] = useState<string | null>(flagFromQuery)
  const [isSearchedFromHeader, setIsSearchedFromHeader] = useState(!!searchFromQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFromQuery ? [categoryFromQuery] : []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    brandFromQuery ? [brandFromQuery] : []
  )
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>(
    initialConcernFilters.skinTypes
  )
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    initialConcernFilters.concerns
  )
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState(sortFromQuery || 'featured')
  const [showFilters, setShowFilters] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(featuredFromQuery === 'true')

  const [categoriesList, setCategoriesList] = useState<any[]>([])
  const [brandsList, setBrandsList] = useState<string[]>([])

  useEffect(() => {
    const loadLocalData = () => {
      setProducts(getMockProducts())
      setCategoriesList(getAdminCategories())
      setBrandsList(getAdminBrands())
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
    }
  }, [])

  const categories = useMemo(() => {
    if (categoriesList.length === 0) return defaultCategories
    return categoriesList.map((cat) => cat.slug)
  }, [categoriesList])

  const brands = useMemo(() => {
    if (brandsList.length === 0) return defaultBrands
    return brandsList
  }, [brandsList])

  const categoryLabels = useMemo(() => {
    if (categoriesList.length === 0) return defaultCategoryLabels
    const labels: Record<string, string> = {}
    categoriesList.forEach((cat) => {
      labels[cat.slug] = cat.name
    })
    return labels
  }, [categoriesList])

  useEffect(() => {
    const concernFilters = parseConcernFilters(searchParams.get('concern'))
    const searchParam = searchParams.get('search')
    const flagParam = searchParams.get('flag') || searchParams.get('tag')
    setSearch(searchParam || '')
    setIsSearchedFromHeader(!!searchParam)
    setSelectedCategories(searchParams.get('category') ? [searchParams.get('category') as string] : [])
    setSelectedBrands(searchParams.get('brand') ? [searchParams.get('brand') as string] : [])
    setSelectedSkinTypes(concernFilters.skinTypes)
    setSelectedConcerns(concernFilters.concerns)
    setSelectedFlag(flagParam)
    setSortBy(searchParams.get('sort') || 'featured')
    setFeaturedOnly(searchParams.get('featured') === 'true')
  }, [searchParams])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    )
  }

  const toggleSkinType = (type: string) => {
    setSelectedSkinTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setIsSearchedFromHeader(false)
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedSkinTypes([])
    setSelectedConcerns([])
    setSelectedFlag(null)
    setPriceRange([0, 10000])
    setSortBy('featured')
    setFeaturedOnly(false)
    router.push('/products')
  }

  const hasActiveFilters =
    search.length > 0 ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedSkinTypes.length > 0 ||
    selectedConcerns.length > 0 ||
    featuredOnly ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = products.filter((product) => {
      const activePrice = product.salePrice || product.price

      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.brand.toLowerCase().includes(normalizedSearch) ||
        categoryLabels[product.category]?.toLowerCase().includes(normalizedSearch)



      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category)

      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(product.brand)

      const matchesSkinType =
        selectedSkinTypes.length === 0 ||
        selectedSkinTypes.some((type) => product.skinTypes.includes(type))

      const matchesConcern =
        selectedConcerns.length === 0 ||
        selectedConcerns.some((concern) => product.skinConcerns.includes(concern))

      const matchesPrice =
        activePrice >= priceRange[0] && activePrice <= priceRange[1]

      const matchesFeatured = !featuredOnly || product.featured

      const matchesFlag = !selectedFlag || (
        (product.visibilityFlags && product.visibilityFlags.some(f => f.toLowerCase().trim() === selectedFlag.toLowerCase().trim())) ||
        (product.tags && product.tags.some(t => t.toLowerCase().trim() === selectedFlag.toLowerCase().trim())) ||
        (selectedFlag.toLowerCase().includes('featured') && product.featured) ||
        (selectedFlag.toLowerCase().includes('trend') && product.trending) ||
        (selectedFlag.toLowerCase().includes('sale') && product.onSale)
      )

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesSkinType &&
        matchesConcern &&
        matchesPrice &&
        matchesFeatured &&
        matchesFlag
      )
    })

    const sorted = [...filtered]

    switch (sortBy) {
      case 'newest':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'price-low':
        sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case 'price-high':
        sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'best-selling':
        sorted.sort((a, b) => b.soldCount - a.soldCount)
        break
      default:
        sorted.sort((a, b) => {
          const scoreA =
            (a.featured ? 5 : 0) + (a.trending ? 3 : 0) + (a.onSale ? 1 : 0)
          const scoreB =
            (b.featured ? 5 : 0) + (b.trending ? 3 : 0) + (b.onSale ? 1 : 0)
          return scoreB - scoreA
        })
    }

    return sorted
  }, [
    products,
    featuredOnly,
    priceRange,
    search,
    selectedBrands,
    selectedCategories,
    selectedConcerns,
    selectedSkinTypes,
    selectedFlag,
    categoryLabels,
    sortBy,
  ])

  const activeCategoryTitle =
    selectedCategories.length === 1
      ? categoryLabels[selectedCategories[0]] || 'Selected Category'
      : null

  const activeBrandTitle = selectedBrands.length === 1 ? selectedBrands[0] : null

  const selectedSortOption = useMemo(() => {
    return sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0]
  }, [sortBy])

  return (
    <div className="min-h-screen py-12 px-4 silk-overlay">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gradient-gold mb-4">
            {activeCategoryTitle
              ? `${activeCategoryTitle} Collection`
              : activeBrandTitle
                ? `${activeBrandTitle} Collection`
                : 'Our Products'}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {activeCategoryTitle
              ? `Browsing products from the ${activeCategoryTitle} category.`
              : activeBrandTitle
                ? `Browsing the curated ${activeBrandTitle} selection.`
                : 'Discover premium Korean skincare products for your daily routine'}
          </p>
        </div>

        {selectedFlag && (
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/10 p-4 sm:px-6 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-gold shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-semibold">
                  Filtered by Visibility Flag
                </p>
                <p className="text-lg font-bold text-white font-playfair">{selectedFlag}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFlag(null)}
              className="rounded-full border-gold/30 text-gold hover:bg-gold/20"
            >
              Clear Flag ×
            </Button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {!isSearchedFromHeader && (
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 bg-gold rounded-full" />
                )}
              </Button>

              <div className="relative min-w-[190px] md:min-w-[230px] z-30">
                <div className="pointer-events-none absolute inset-y-0 left-5 z-10 flex items-center">
                  <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold/70">
                    Sort
                  </span>
                </div>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="h-[52px] w-full flex items-center justify-between rounded-full border border-white/10 bg-white/[0.05] pl-20 pr-5 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-gold/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-left"
                >
                  <span className="truncate">{selectedSortOption.label}</span>
                  <ChevronDown className={`h-4 w-4 text-gold/80 transition-transform duration-300 shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options */}
                {isSortOpen && (
                  <>
                    {/* Backdrop to close the dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsSortOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-full origin-top-right rounded-2xl border border-white/10 bg-black/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="py-1 space-y-0.5">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSortBy(option.value)
                              setIsSortOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all duration-200 flex items-center justify-between ${
                              sortBy === option.value
                                ? 'bg-gold/15 text-gold font-medium'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <motion.div
            initial={false}
            animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="pt-6 grid grid-cols-1 gap-6">
              <FilterSection
                title="Category"
                items={categories}
                selected={selectedCategories}
                onToggle={toggleCategory}
                labelMap={categoryLabels}
              />
              <FilterSection title="Brands" items={brands} selected={selectedBrands} onToggle={toggleBrand} />
              <FilterSection title="Skin Type" items={skinTypes} selected={selectedSkinTypes} onToggle={toggleSkinType} />
              <FilterSection title="Concern" items={skinConcerns} selected={selectedConcerns} onToggle={toggleConcern} />
              <div>
                <h4 className="font-medium text-white mb-3">Price Range</h4>
                <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                  <span>৳{priceRange[0]}</span>
                  <span>৳{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-gold"
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={() => setFeaturedOnly((value) => !value)}
                    className="w-4 h-4 rounded border-white/20 bg-black/50 text-gold focus:ring-gold focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    Featured products only
                  </span>
                </label>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block space-y-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-gold hover:underline">
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <FilterSection
                  title="Category"
                  items={categories}
                  selected={selectedCategories}
                  onToggle={toggleCategory}
                  labelMap={categoryLabels}
                />
                <FilterSection title="Brands" items={brands} selected={selectedBrands} onToggle={toggleBrand} />
                <FilterSection title="Skin Type" items={skinTypes} selected={selectedSkinTypes} onToggle={toggleSkinType} />
                <FilterSection title="Concern" items={skinConcerns} selected={selectedConcerns} onToggle={toggleConcern} />
                
                <div>
                  <h4 className="font-medium text-white mb-3">Price Range</h4>
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                    <span>৳{priceRange[0]}</span>
                    <span>৳{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-gold"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={() => setFeaturedOnly((value) => !value)}
                      className="w-4 h-4 rounded border-white/20 bg-black/50 text-gold focus:ring-gold focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      Featured products only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {activeCategoryTitle && (
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="glass rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold">
                  Active Category
                </span>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-white">
                  {activeCategoryTitle}
                </span>
              </div>
            )}

            {activeBrandTitle && (
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="glass rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold">
                  Active Brand
                </span>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-white">
                  {activeBrandTitle}
                </span>
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span className="glass rounded-full px-4 py-2 text-gold">
                {filteredProducts.length} Products Found
              </span>
              {search && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Search: {search}
                </span>
              )}
              {featuredOnly && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Featured Only
                </span>
              )}
              {activeBrandTitle && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Brand: {activeBrandTitle}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="glass mt-6 rounded-3xl p-10 text-center">
                <h3 className="font-playfair text-3xl text-white">No products found</h3>
                <p className="mt-3 text-gray-400">
                  Try another category or clear the current filters to see more products.
                </p>
                <Button variant="outline" className="mt-6" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="xl">
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSection({
  title,
  items,
  selected,
  onToggle,
  labelMap,
}: {
  title: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  labelMap?: Record<string, string>
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full font-medium text-white mb-3"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="space-y-2">
          {items.map((item) => (
            <label key={item} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => onToggle(item)}
                className="w-4 h-4 rounded border-white/20 bg-black/50 text-gold focus:ring-gold focus:ring-offset-0"
              />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                {labelMap?.[item] || item}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
