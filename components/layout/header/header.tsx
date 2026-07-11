'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

const headerSearchCatalog = [
  {
    name: 'COSRX Advanced Snail 96 Mucin Power Essence',
    slug: 'cosrx-advanced-snail-96-mucin-power-essence',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=160&h=160&fit=crop',
    brand: 'COSRX',
  },
  {
    name: 'Beauty of Joseon Relief Toner',
    slug: 'beauty-of-joseon-relief-toner',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=160&h=160&fit=crop',
    brand: 'Beauty of Joseon',
  },
  {
    name: 'Some By Mi AHA BHA PHA Miracle Toner',
    slug: 'some-by-mi-aha-bha-pha-miracle-toner',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=160&h=160&fit=crop',
    brand: 'Some By Mi',
  },
  {
    name: 'Anua Heartleaf 77% Soothing Toner',
    slug: 'anua-heartleaf-77-soothing-toner',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=160&h=160&q=80',
    brand: 'Anua',
  },
  {
    name: 'Round Lab Dokdo Tone Softening Lotion',
    slug: 'round-lab-dokdo-tone-softening-lotion',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=160&h=160&fit=crop',
    brand: 'Round Lab',
  },
  {
    name: 'COSRX Low pH Good Morning Cleanser',
    slug: 'cosrx-low-ph-good-morning-cleanser',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=160&h=160&fit=crop',
    brand: 'COSRX',
  },
]

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Brands', href: '/brands' },
  { name: 'Skin Concerns', href: '/concerns' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getTotalItems, openCart } = useCartStore()
  const { getTotalItems: getWishlistTotalItems } = useWishlistStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Castle of Princess',
  })

  useEffect(() => {
    const q = searchParams.get('search') || ''
    setSearchQuery(q)
  }, [searchParams])

  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [isMounted, setIsMounted] = useState(false)
  const searchBoxRef = useRef<HTMLDivElement | null>(null)
  const totalItems = getTotalItems()
  const wishlistTotalItems = getWishlistTotalItems()
  const safeTotalItems = isMounted ? totalItems : 0
  const safeWishlistTotalItems = isMounted ? wishlistTotalItems : 0

  const { data: session, status } = useSession()
  const user = session?.user
  const role = (user as any)?.role

  const navItems = useMemo(() => {
    const items = [...navigation]
    if (status === 'authenticated' && role === 'admin') {
      items.unshift({ name: 'Dashboard', href: '/admin' })
    }
    return items
  }, [status, role])

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    const ranked = headerSearchCatalog
      .map((item) => {
        const name = item.name.toLowerCase()
        const brand = item.brand.toLowerCase()
        const exactStart = name.startsWith(query) ? 2 : 0
        const nameHit = name.includes(query) ? 1 : 0
        const brandHit = brand.includes(query) ? 1 : 0
        const score = exactStart + nameHit + brandHit
        return { item, score }
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((row) => row.item)

    return ranked
  }, [searchQuery])

  const navigateToSearch = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    setMobileMenuOpen(false)
    setShowSuggestions(false)
    setActiveSuggestion(-1)
    router.push(`/products?search=${encodeURIComponent(trimmed)}`)
  }

  useEffect(() => {
    setIsMounted(true)
    const loadLocalData = () => {
      const savedStore = localStorage.getItem('cop_store_settings')
      if (savedStore) {
        try {
          setStoreSettings(JSON.parse(savedStore))
        } catch (e) {
          console.error('Error parsing store settings in header:', e)
        }
      }
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    window.addEventListener('cop:storeSettingsUpdated', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
      window.removeEventListener('cop:storeSettingsUpdated', loadLocalData)
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setShowSuggestions(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (activeSuggestion === -1) return
    if (activeSuggestion >= suggestions.length) {
      setActiveSuggestion(suggestions.length - 1)
    }
  }, [activeSuggestion, suggestions.length])

  return (
    <>
      <header className="relative lg:sticky lg:top-0 z-50 glass-dark">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="font-playfair text-2xl md:text-3xl font-bold text-gradient-gold">
                  {storeSettings.storeName}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-gold ${
                    pathname === item.href ? 'text-gold' : 'text-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {status === 'authenticated' ? (
                <Link
                  href="/account"
                  className="p-2 text-gray-300 hover:text-gold transition-colors"
                  title="My Account"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/login?callbackUrl=/account"
                  className="p-2 text-gray-300 hover:text-gold transition-colors"
                  title="Login"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              <Link
                href="/wishlist"
                className="relative p-2 text-gray-300 hover:text-gold transition-colors"
              >
                <Heart className="w-5 h-5" />
                {safeWishlistTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {safeWishlistTotalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 text-gray-300 hover:text-gold transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {safeTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {safeTotalItems}
                  </span>
                )}
              </button>

              {status !== 'authenticated' && (
                <Link href="/auth/login">
                  <Button variant="gold" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center space-x-4">
              <Link
                href="/wishlist"
                className="relative p-2 text-gray-300 hover:text-gold"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {safeWishlistTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {safeWishlistTotalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 text-gray-300 hover:text-gold"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {safeTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {safeTotalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-gold"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Search Drawer removed in favor of always-visible header search inputs */}

          {/* Header Search Bar (always visible, positioned down below main navigation section) */}
          <div className="pb-4 relative max-w-xl mx-auto w-full" ref={searchBoxRef}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                navigateToSearch(searchQuery)
                setShowSuggestions(false)
              }}
              className="relative"
            >
              <input
                type="text"
                inputMode="search"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setActiveSuggestion(-1)
                  setShowSuggestions(true)
                }}
                placeholder="Search products..."
                className="w-full h-10 pl-5 pr-16 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors text-sm text-white placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setShowSuggestions(false)
                    if (pathname === '/products') {
                      router.push('/products')
                    }
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gold transition-colors"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%-0.25rem)] overflow-hidden rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.slug}
                      type="button"
                      onMouseEnter={() => setActiveSuggestion(index)}
                      onClick={() => {
                        setSearchQuery('')
                        setShowSuggestions(false)
                        setMobileMenuOpen(false)
                        router.push(`/products/${suggestion.slug}`)
                      }}
                      className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors text-gray-200 hover:bg-white/[0.04]"
                    >
                      <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <Image
                          src={suggestion.image}
                          alt={suggestion.name}
                          fill
                          className="object-cover opacity-95"
                          sizes="40px"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {suggestion.name}
                        </span>
                        <span className="mt-1 block text-[10px] uppercase tracking-[0.24em] text-gold/70">
                          {suggestion.brand}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-dark border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-base font-medium transition-colors hover:text-gold ${
                      pathname === item.href ? 'text-gold' : 'text-gray-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  {status === 'authenticated' ? (
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-300 hover:text-gold"
                    >
                      My Account
                    </Link>
                  ) : (
                    <Link
                      href="/auth/login?callbackUrl=/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-300 hover:text-gold"
                    >
                      My Account
                    </Link>
                  )}
                  <Link href="/wishlist" className="text-gray-300 hover:text-gold">
                    Wishlist
                  </Link>
                  {status !== 'authenticated' && (
                    <Link href="/auth/login">
                      <Button variant="gold" size="lg" className="w-full">
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
