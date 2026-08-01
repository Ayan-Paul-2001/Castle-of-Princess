'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import ProductCard from '@/components/products/product-card'
import { useCmsPage } from '@/lib/cms/use-cms-page'
import { getMockProducts, getAdminCategories } from '@/lib/products-store'

const defaultHeroSlides = [
  {
    eyebrow: 'Luxury K-Beauty',
    title: 'Glossy Rituals For Radiant Skin',
    description:
      'Discover premium Korean skincare and cosmetics curated for modern beauty lovers in Bangladesh.',
    accent: 'Exclusive launches, bestsellers, and silky formulas in one destination.',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
    primaryHref: '/products',
    primaryLabel: 'Shop The Collection',
    secondaryHref: '/products?featured=true',
    secondaryLabel: 'View Featured',
  },
  {
    eyebrow: 'Glass Skin Edit',
    title: 'Hydration That Looks Like Light',
    description:
      'Build a glow-first routine with essences, toners, and serums from iconic Korean skincare brands.',
    accent: 'Shop glossy textures and barrier-loving formulas for luminous skin.',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=80',
    primaryHref: '/products?concern=glass-skin',
    primaryLabel: 'Shop Glass Skin',
    secondaryHref: '/products?category=serum-essence',
    secondaryLabel: 'Explore Serums',
  },
  {
    eyebrow: 'Flash Beauty Drop',
    title: 'New Season. New Princess Energy.',
    description:
      'Elevate your beauty shelf with trending Korean skincare, makeup, and limited-time luxury offers.',
    accent: 'Designed for soft glam mornings, silky nights, and premium gifting.',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80',
    primaryHref: '/products?onSale=true',
    primaryLabel: 'Shop Offers',
    secondaryHref: '/about',
    secondaryLabel: 'Our Story',
  },
]

const defaultHeroParticles = [
  { left: '8%', top: '18%', delay: '0.2s' },
  { left: '15%', top: '70%', delay: '1.1s' },
  { left: '22%', top: '38%', delay: '0.7s' },
  { left: '30%', top: '82%', delay: '1.8s' },
  { left: '37%', top: '16%', delay: '0.4s' },
  { left: '43%', top: '58%', delay: '1.4s' },
  { left: '51%', top: '26%', delay: '0.9s' },
  { left: '59%', top: '76%', delay: '1.6s' },
  { left: '66%', top: '35%', delay: '0.6s' },
  { left: '74%', top: '63%', delay: '1.3s' },
  { left: '82%', top: '22%', delay: '0.5s' },
  { left: '89%', top: '48%', delay: '1.9s' },
]

const defaultFeaturedCategories = [
  {
    name: 'Cleanser',
    slug: 'cleanser',
    image: '/categories/Cleanser.jpg',
    description: 'Daily cleansing essentials for soft, balanced skin.',
  },
  {
    name: 'Toner & Mist',
    slug: 'toner-mist',
    image: '/categories/Toner%20%26%20Mist.jpg',
    description: 'Hydrating layers that prep your skin for glow.',
  },
  {
    name: 'Serum & Essence',
    slug: 'serum-essence',
    image: '/categories/Serum%20%26%20Essence.jpg',
    description: 'Targeted treatments for radiance, calm, and clarity.',
  },
  {
    name: 'Moisturiser',
    slug: 'moisturiser',
    image: '/categories/Moisturiser.jpg',
    description: 'Silky moisture to seal in hydration and comfort.',
  },
  {
    name: 'Sun Protection',
    slug: 'sun-protection',
    image: '/categories/Sun%20Protection.jpg',
    description: 'Daily SPF protection with elegant lightweight textures.',
  },
  {
    name: 'Face Mask',
    slug: 'face-mask',
    image: '/categories/Face%20Mask.jpg',
    description: 'Weekly glow rituals for a smoother, brighter finish.',
  },
]

const defaultBestSellingProducts = [
  {
    id: 'best-1',
    productId: 'best-prod-1',
    name: 'COSRX Advanced Snail 96 Mucin Power Essence',
    slug: 'cosrx-advanced-snail-96-mucin-power-essence',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=700&fit=crop',
    price: 3500,
    salePrice: 2800,
    rating: 4.8,
    reviewCount: 245,
    featured: true,
    trending: true,
    onSale: true,
    stock: 25,
  },
  {
    id: 'best-2',
    productId: 'best-prod-2',
    name: 'Beauty of Joseon Relief Toner',
    slug: 'beauty-of-joseon-relief-toner',
    image:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=700&fit=crop',
    price: 2200,
    rating: 4.9,
    reviewCount: 189,
    featured: true,
    trending: false,
    onSale: false,
    stock: 30,
  },
  {
    id: 'best-3',
    productId: 'best-prod-3',
    name: 'Some By Mi AHA BHA PHA Miracle Toner',
    slug: 'some-by-mi-aha-bha-pha-miracle-toner',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=700&fit=crop',
    price: 2800,
    salePrice: 2490,
    rating: 4.7,
    reviewCount: 312,
    featured: false,
    trending: true,
    onSale: true,
    stock: 18,
  },
  {
    id: 'best-4',
    productId: 'best-prod-4',
    name: 'Anua Heartleaf 77% Soothing Toner',
    slug: 'anua-heartleaf-77-soothing-toner',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&h=700&q=80',
    price: 1950,
    salePrice: 1650,
    rating: 4.7,
    reviewCount: 156,
    featured: false,
    trending: true,
    onSale: true,
    stock: 8,
  },
]

const defaultFeaturedProducts = [
  {
    id: 'feat-1',
    productId: 'feat-prod-1',
    name: 'Round Lab Dokdo Tone Softening Lotion',
    slug: 'round-lab-dokdo-tone-softening-lotion',
    image:
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&h=700&fit=crop',
    price: 2400,
    rating: 4.8,
    reviewCount: 98,
    featured: true,
    trending: false,
    onSale: false,
    stock: 22,
  },
  {
    id: 'feat-2',
    productId: 'feat-prod-2',
    name: 'COSRX Low pH Good Morning Cleanser',
    slug: 'cosrx-low-ph-good-morning-cleanser',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=700&fit=crop',
    price: 1800,
    salePrice: 1500,
    rating: 4.5,
    reviewCount: 423,
    featured: true,
    trending: true,
    onSale: true,
    stock: 40,
  },
  {
    id: 'feat-3',
    productId: 'feat-prod-3',
    name: 'Premium Glow Barrier Cream',
    slug: 'premium-glow-barrier-cream',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=700&fit=crop',
    price: 3200,
    salePrice: 2890,
    rating: 4.9,
    reviewCount: 134,
    featured: true,
    trending: false,
    onSale: true,
    stock: 16,
  },
  {
    id: 'feat-4',
    productId: 'feat-prod-4',
    name: 'Silky UV Defense Sun Essence',
    slug: 'silky-uv-defense-sun-essence',
    image:
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&h=700&fit=crop',
    price: 2600,
    rating: 4.6,
    reviewCount: 87,
    featured: true,
    trending: true,
    onSale: false,
    stock: 11,
  },
]

const defaultAllProductsMini = [
  {
    name: 'Snail Mucin Essence',
    slug: 'cosrx-advanced-snail-96-mucin-power-essence',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop',
    price: '৳2,800',
  },
  {
    name: 'Relief Toner',
    slug: 'beauty-of-joseon-relief-toner',
    image:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&h=300&fit=crop',
    price: '৳2,200',
  },
  {
    name: 'Heartleaf Toner',
    slug: 'anua-heartleaf-77-soothing-toner',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&h=300&q=80',
    price: '৳1,650',
  },
  {
    name: 'Miracle Toner',
    slug: 'some-by-mi-aha-bha-pha-miracle-toner',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
    price: '৳2,490',
  },
  {
    name: 'Dokdo Lotion',
    slug: 'round-lab-dokdo-tone-softening-lotion',
    image:
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=300&h=300&fit=crop',
    price: '৳2,400',
  },
  {
    name: 'Morning Cleanser',
    slug: 'cosrx-low-ph-good-morning-cleanser',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop',
    price: '৳1,500',
  },
  {
    name: 'Barrier Cream',
    slug: 'premium-glow-barrier-cream',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
    price: '৳2,890',
  },
  {
    name: 'Sun Essence',
    slug: 'silky-uv-defense-sun-essence',
    image:
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=300&h=300&fit=crop',
    price: '৳2,600',
  },
]

const defaultGalleryImages = [
  {
    title: 'Glossy Shelf',
    subtitle: 'Luxury skincare display',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=900&h=1200&fit=crop&auto=format',
    span: 'md:row-span-2',
  },
  {
    title: 'Radiance Ritual',
    subtitle: 'Silky textures and soft glow',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&h=900&fit=crop&auto=format',
    span: '',
  },
  {
    title: 'K-Beauty Mood',
    subtitle: 'Modern feminine beauty',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=900&fit=crop&auto=format',
    span: '',
  },
  {
    title: 'Premium Care',
    subtitle: 'Hydration, calm, and glow',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=1200&fit=crop&auto=format',
    span: '',
  },
  {
    title: 'Beauty Ritual',
    subtitle: 'Editorial-inspired luxury frame',
    image:
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=900&h=1200&fit=crop&auto=format',
    span: 'md:col-span-2',
  },
  {
    title: 'Silk Glow',
    subtitle: 'Soft gold ambience',
    image:
      'https://images.unsplash.com/photo-1526045478516-99145907023c?w=900&h=1200&fit=crop&auto=format',
    span: '',
  },
  {
    title: 'Night Ritual',
    subtitle: 'Cinematic skincare mood',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=900&fit=crop&auto=format',
    span: '',
  },
  {
    title: 'Gloss Finish',
    subtitle: 'Luminous textures',
    image:
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=900&h=900&fit=crop&auto=format',
    span: '',
  },
]

const defaultFeaturedBrands = [
  'COSRX',
  'Beauty of Joseon',
  'Anua',
  'Some By Mi',
  'Round Lab',
  'SKIN1004',
  'Laneige',
  'Innisfree',
]

const defaultCustomerReviews = [
  {
    name: 'Nusrat Jahan',
    location: 'Dhaka',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&auto=format',
    title: 'The products feel genuinely premium',
    review:
      'My order arrived beautifully packed and every product felt authentic. The COSRX essence completely changed my skin texture within weeks.',
  },
  {
    name: 'Farzana Ahmed',
    location: 'Chattogram',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&auto=format',
    title: 'Luxury shopping experience',
    review:
      'The website looks elegant and the skincare selection is amazing. I loved how easy it was to find products for sensitive skin.',
  },
  {
    name: 'Sadia Rahman',
    location: 'Sylhet',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&auto=format',
    title: 'Best K-beauty store I have tried',
    review:
      'I ordered toner, cleanser, and sunscreen. Everything was original, delivery was smooth, and my skin has never looked this fresh.',
  },
]

const defaultLandingBeautyShots = [
  {
    title: 'Glow Ritual',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1200&fit=crop&auto=format',
  },
  {
    title: 'Editorial Shelf',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&auto=format',
  },
  {
    title: 'Soft Luxury',
    image:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&h=1200&fit=crop&auto=format',
  },
]

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [brandSettings, setBrandSettings] = useState({
    homepageHeadline: '',
    metaDescription: '',
  })

  const { page } = useCmsPage('home')

  const enabledTypes = useMemo(
    () => new Set(page.sections.filter((section) => section.enabled).map((section) => section.type)),
    [page.sections]
  )

  const getSectionData = (type: string) =>
    (page.sections.find((section) => section.type === type)?.data ?? {}) as any

  const heroData = getSectionData('home.hero')
  const heroSlides = useMemo(() => {
    const fallbackImages = [
      '/categories/Face%20Mask.jpg',
      '/categories/Serum%20%26%20Essence.jpg',
      '/categories/Sun%20Protection.jpg',
      ...defaultHeroSlides.map((slide) => slide.image),
    ].filter((image) => typeof image === 'string' && image.trim().length > 0)

    const rawSlides = Array.isArray(heroData.slides) ? heroData.slides : null
    const baseSlides = rawSlides && rawSlides.length > 0 ? rawSlides : defaultHeroSlides

    const normalized = (baseSlides ?? [])
      .filter(Boolean)
      .map((slide: any, index: number) => {
        const hasImage = typeof slide?.image === 'string' && slide.image.trim().length > 0
        const result = {
          ...slide,
          image: hasImage ? slide.image : fallbackImages[index % fallbackImages.length],
        }
        if (index === 0) {
          if (brandSettings.homepageHeadline) {
            result.title = brandSettings.homepageHeadline
          }
          if (brandSettings.metaDescription) {
            result.description = brandSettings.metaDescription
          }
        }
        return result
      })
      .filter((slide: any) => typeof slide?.image === 'string' && slide.image.trim().length > 0)

    return normalized.length > 0 ? normalized : defaultHeroSlides
  }, [heroData.slides, brandSettings])
  const heroParticles = (heroData.particles ?? defaultHeroParticles) as any[]
  const heroAutoSlideMs = Number(heroData.autoSlideMs ?? 5000) || 5000

  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const [realCategories, setRealCategories] = useState<any[]>([])

  const categoriesData = getSectionData('home.categories')
  const rawFeaturedCategories = (categoriesData.items ?? defaultFeaturedCategories) as any[]

  const featuredCategories = useMemo(() => {
    if (realCategories.length === 0) {
      return rawFeaturedCategories
    }

    const featuredAdmin = realCategories.filter((rc) => rc.featured)
    const cmsMap = new Map<string, any>()
    rawFeaturedCategories.forEach((item) => {
      cmsMap.set(item.slug.toLowerCase().trim(), item)
    })

    return featuredAdmin.map((rc) => {
      const slugKey = rc.slug.toLowerCase().trim()
      const cmsCat = cmsMap.get(slugKey)

      return {
        name: rc.name,
        slug: rc.slug,
        image: rc.image || cmsCat?.image || 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80',
        description: cmsCat?.description || `Explore our premium selection of ${rc.name.toLowerCase()} products.`,
      }
    })
  }, [rawFeaturedCategories, realCategories])

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return featuredCategories
    const query = categorySearchQuery.toLowerCase().trim()
    return featuredCategories.filter(
      (category) =>
        (category.name && category.name.toLowerCase().includes(query)) ||
        (category.description && category.description.toLowerCase().includes(query))
    )
  }, [featuredCategories, categorySearchQuery])

  const bestSellingData = getSectionData('home.bestSelling')
  const landingBeautyShots = (bestSellingData.beautyShots ?? defaultLandingBeautyShots) as any[]

  const [realProducts, setRealProducts] = useState<any[]>([])

  useEffect(() => {
    const loadLocalData = () => {
      setRealProducts(getMockProducts())
      setRealCategories(getAdminCategories())
      const savedBrand = localStorage.getItem('cop_brand_settings')
      if (savedBrand) {
        try {
          setBrandSettings(prev => ({ ...prev, ...JSON.parse(savedBrand) }))
        } catch (e) {
          console.error('Error parsing brand settings on homepage:', e)
        }
      }
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
    }
  }, [])

  const bestSellingProducts = useMemo(() => {
    const raw = (bestSellingData.products ?? defaultBestSellingProducts) as any[]
    if (realProducts.length === 0) return raw
    return raw.map((p) => {
      const real = realProducts.find(
        (rp) => rp.slug === p.slug || rp.id === p.productId || rp.id === p.id
      )
      if (real) {
        return {
          ...p,
          rating: real.rating,
          reviewCount: real.reviewCount,
        }
      }
      return p
    })
  }, [bestSellingData.products, realProducts])

  const featuredData = getSectionData('home.featuredProducts')
  const featuredProducts = useMemo(() => {
    const raw = (featuredData.products ?? defaultFeaturedProducts) as any[]
    if (realProducts.length === 0) return raw
    return raw.map((p) => {
      const real = realProducts.find(
        (rp) => rp.slug === p.slug || rp.id === p.productId || rp.id === p.id
      )
      if (real) {
        return {
          ...p,
          rating: real.rating,
          reviewCount: real.reviewCount,
        }
      }
      return p
    })
  }, [featuredData.products, realProducts])

  const allProductsData = getSectionData('home.allProductsMini')
  const allProductsMini = (allProductsData.items ?? defaultAllProductsMini) as any[]

  const galleryData = getSectionData('home.gallery')
  const galleryImages = (galleryData.items ?? defaultGalleryImages) as any[]

  const brandsData = getSectionData('home.brands')
  const featuredBrands = (brandsData.brands ?? defaultFeaturedBrands) as any[]

  const concernsData = getSectionData('home.concerns')
  const concerns = (concernsData.items ??
    [
      { name: 'Acne', icon: '🔥' },
      { name: 'Dry Skin', icon: '💧' },
      { name: 'Oily Skin', icon: '⚡' },
      { name: 'Sensitive', icon: '🌸' },
      { name: 'Glass Skin', icon: '✨' },
      { name: 'Dark Spots', icon: '🌙' },
    ]) as any[]

  const reviewsData = getSectionData('home.reviews')
  const customerReviews = (reviewsData.items ?? defaultCustomerReviews) as any[]

  const newsletterData = getSectionData('home.newsletter')
  const newsletterImages = (newsletterData.images ?? landingBeautyShots.slice(0, 2)) as any[]

  const normalizedGalleryImages = useMemo(() => {
    const items = (galleryImages ?? []).filter(Boolean)
    return items.filter(
      (item) => typeof item?.image === 'string' && item.image.trim().length > 0
    )
  }, [galleryImages])

  useEffect(() => {
    setActiveSlide((current) => {
      if (heroSlides.length === 0) return 0
      return Math.min(current, heroSlides.length - 1)
    })
  }, [heroSlides.length])

  useEffect(() => {
    if (heroSlides.length < 2) return
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, heroAutoSlideMs)

    return () => window.clearInterval(interval)
  }, [heroSlides.length, heroAutoSlideMs])

  const currentSlide = heroSlides[activeSlide] ?? heroSlides[0] ?? defaultHeroSlides[0]

  const goToPreviousSlide = () => {
    setActiveSlide((current) =>
      current === 0 ? heroSlides.length - 1 : current - 1
    )
  }

  const goToNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length)
  }

  const concernHints: Record<string, string> = {
    'acne care': 'Breakouts & marks',
    hydration: 'Plump + dewy',
    brightening: 'Glow + clarity',
    antiaging: 'Firm + smooth',
    soothing: 'Calm redness',
    'pore care': 'Refine texture',
  }

  const orderedSections = useMemo(() => {
    if (!page.sections) return []
    return [...page.sections]
  }, [page.sections])

  return (
    <main className="min-h-screen">
      {orderedSections.map((section) => {
        if (!section.enabled) return null

        switch (section.type) {
          case 'home.hero':
            return (
              <section key={section.id} className="relative min-h-[100svh] overflow-hidden">
                <link rel="preload" href={currentSlide.image} as="image" fetchPriority="high" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.image}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={currentSlide.image}
                      alt={currentSlide.title || "Hero banner"}
                      fill
                      priority
                      fetchPriority="high"
                      sizes="100vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
                <div className="absolute inset-0 silk-overlay" />

                {/* Floating particles */}
                <div className="absolute inset-0 hidden overflow-hidden sm:block">
                  {heroParticles.map((particle, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-gold/20 rounded-full animate-pulse"
                      style={{
                        left: particle.left,
                        top: particle.top,
                        animationDelay: particle.delay,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 flex min-h-[100svh] items-center px-4 pt-24 pb-10 sm:pb-16 lg:pt-28">
                  <div className="mx-auto grid w-full max-w-7xl gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="max-w-4xl text-center sm:text-left"
                      >
                        <div className="mb-3 sm:mb-6">
                          <span className="inline-flex rounded-full border border-gold/30 bg-black/30 px-4 py-1.5 text-xs uppercase tracking-[0.35em] text-gold backdrop-blur-xl sm:px-5 sm:py-2 sm:text-sm">
                            {currentSlide.eyebrow}
                          </span>
                        </div>

                        <h1 className="font-playfair text-2xl font-bold leading-tight text-white sm:text-5xl md:text-7xl xl:text-8xl">
                          Castle of Princess
                        </h1>

                        <h2 className="mt-2 sm:mt-4 max-w-4xl font-playfair text-xl font-semibold leading-tight text-gradient-gold sm:text-3xl md:text-5xl">
                          {currentSlide.title}
                        </h2>

                        <p className="mx-auto mt-2.5 max-w-2xl text-sm font-light text-gray-200 sm:mx-0 sm:mt-6 sm:text-lg md:text-xl">
                          {currentSlide.description}
                        </p>

                        <p className="mx-auto mt-2 max-w-2xl text-[11px] uppercase tracking-[0.25em] text-gold/80 sm:mx-0 sm:text-sm md:text-base">
                          {currentSlide.accent}
                        </p>

                        <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
                          <Link
                            href={currentSlide.primaryHref}
                            className={buttonVariants({
                              variant: 'gold',
                              className: 'w-full h-11 px-5 text-sm sm:w-auto sm:h-16 sm:px-10 sm:text-lg',
                            })}
                          >
                            {currentSlide.primaryLabel}
                            <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
                          </Link>
                          <Link
                            href={currentSlide.secondaryHref}
                            className={buttonVariants({
                              variant: 'outline',
                              className: 'w-full h-11 px-5 text-sm sm:w-auto sm:h-16 sm:px-10 sm:text-lg',
                            })}
                          >
                            {currentSlide.secondaryLabel}
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex flex-col items-center gap-4 sm:gap-5 lg:items-end">
                      <div className="glass hidden w-full max-w-[280px] rounded-[2rem] p-5 lg:block">
                        <p className="font-cormorant text-lg uppercase tracking-[0.3em] text-gold">
                          Banner Slider
                        </p>
                        <div className="mt-4 space-y-3">
                          {heroSlides.map((slide: any, index: number) => (
                            <button
                              key={slide.title}
                              type="button"
                              onClick={() => setActiveSlide(index)}
                              className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${activeSlide === index
                                ? 'border-gold/50 bg-white/10 shadow-[0_0_30px_rgba(212,175,55,0.18)]'
                                : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'
                                }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                  <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70">
                                    {slide.eyebrow}
                                  </p>
                                  <p className="mt-2 line-clamp-2 font-playfair text-xl text-white">
                                    {slide.title}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={goToPreviousSlide}
                          className="glass flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:border-gold/40 hover:text-gold"
                          aria-label="Previous banner"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2">
                          {heroSlides.map((slide: any, index: number) => (
                            <button
                              key={slide.title}
                              type="button"
                              onClick={() => setActiveSlide(index)}
                              className={`h-2.5 rounded-full transition-all ${activeSlide === index ? 'w-10 bg-gold' : 'w-2.5 bg-white/35'
                                }`}
                              aria-label={`Go to banner ${index + 1}`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={goToNextSlide}
                          className="glass flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:border-gold/40 hover:text-gold"
                          aria-label="Next banner"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 animate-bounce sm:block">
                  <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center">
                    <div className="w-1.5 h-3 bg-gold rounded-full mt-2 animate-pulse" />
                  </div>
                </div>
              </section>
            )
          case 'home.categories':
            return (
              <section key={section.id} className="px-4 py-10 sm:py-20">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-6 sm:mb-12 text-center">
                    <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-widest">
                      {categoriesData.eyebrow || 'Categories'}
                    </span>
                    <h2 className="mt-2 sm:mt-4 font-playfair text-2xl sm:text-4xl md:text-5xl font-bold">
                      {categoriesData.title || 'Explore The Beauty Wardrobe'}
                    </h2>
                    <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-sm sm:text-base text-gray-400">
                      {categoriesData.description}
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-8 sm:mb-12 max-w-xl mx-auto relative group">
                    <div className="glass flex items-center rounded-full border border-white/10 px-4 py-2.5 sm:px-6 sm:py-3.5 focus-within:border-gold/40 focus-within:shadow-[0_0_25px_rgba(212,175,55,0.18)] transition-all duration-300">
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gold/70 shrink-0 ml-1" />
                      <input
                        type="text"
                        placeholder="Search your desired categories"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none px-2 sm:px-4 text-sm sm:text-base font-light text-center"
                      />
                      {categorySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCategorySearchQuery('')}
                          className="text-gray-400 hover:text-gold transition-colors mr-1"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredCategories.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16 glass rounded-[2rem] border border-white/5 max-w-lg mx-auto p-8"
                    >
                      <p className="text-gray-400 text-lg mb-4 font-light">
                        No categories found matching &quot;{categorySearchQuery}&quot;
                      </p>
                      <button
                        type="button"
                        onClick={() => setCategorySearchQuery('')}
                        className={buttonVariants({ variant: 'outline', size: 'sm', className: 'border-gold/30 hover:border-gold hover:text-gold transition-colors' })}
                      >
                        Reset Search
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      {/* Desktop Grid View */}
                      <div className="hidden sm:grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredCategories.map((category, index) => (
                          <motion.div
                            key={category.slug}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, delay: index * 0.08 }}
                          >
                            <Link
                              href={`/products?category=${category.slug}`}
                              className="group block overflow-hidden rounded-[2rem] glass luxury-shadow"
                            >
                              <div className="relative aspect-[4/4.8] overflow-hidden">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),transparent_45%,rgba(255,255,255,0.08))]" />

                                <div className="absolute inset-x-0 bottom-0 p-6">
                                  <div className="glass inline-flex rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold">
                                    Category
                                  </div>
                                  <h3 className="mt-4 font-playfair text-3xl font-semibold text-white">
                                    {category.name}
                                  </h3>
                                  <p className="mt-3 max-w-sm text-sm text-gray-300">
                                    {category.description}
                                  </p>
                                  <div className="mt-5 inline-flex items-center text-sm font-medium text-gold">
                                    Shop This Category
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* Mobile Grid View */}
                      <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:hidden">
                        {filteredCategories.map((category, index) => (
                          <motion.div
                            key={category.slug}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.04 }}
                          >
                            <Link
                              href={`/products?category=${category.slug}`}
                              className="group flex flex-col items-center"
                            >
                              <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 group-hover:border-gold/40 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] luxury-shadow">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  sizes="(max-width: 640px) 33vw, 120px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                              </div>
                              <span className="mt-2 text-center text-xs font-medium tracking-wide text-gray-300 group-hover:text-gold transition-colors duration-300 line-clamp-2">
                                {category.name}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )
          case 'home.bestSelling':
            return (
              <section key={section.id} className="px-4 py-10 sm:py-20 silk-overlay">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-6 sm:mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                      <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-widest">
                        {bestSellingData.eyebrow}
                      </span>
                      <h2 className="mt-2 sm:mt-4 font-playfair text-2xl sm:text-4xl md:text-5xl font-bold">
                        {bestSellingData.title}
                      </h2>
                      <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-400">
                        {bestSellingData.description}
                      </p>
                    </div>
                    <Link
                      href={bestSellingData.ctaHref}
                      className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-auto h-11 sm:h-14 sm:px-8 text-sm sm:text-base' })}
                    >
                      {bestSellingData.ctaLabel}
                    </Link>
                  </div>

                  <>
                    {/* Desktop Beauty Shots View */}
                    <div className="hidden sm:grid mb-10 gap-4 sm:grid-cols-3">
                      {landingBeautyShots.map((shot, index) => (
                        <motion.div
                          key={shot.title}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.45, delay: index * 0.08 }}
                          className="group relative overflow-hidden rounded-[2rem] glass luxury-shadow"
                        >
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={shot.image}
                              alt={shot.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                              <p className="font-playfair text-2xl text-white">{shot.title}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Mobile Beauty Shots View */}
                    <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:hidden mb-8">
                      {landingBeautyShots.map((shot, index) => (
                        <motion.div
                          key={shot.title}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                        >
                          <div className="group flex flex-col items-center">
                            <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 group-hover:border-gold/40 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] luxury-shadow">
                              <Image
                                src={shot.image}
                                alt={shot.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 33vw, 120px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <span className="mt-2 text-center text-xs font-medium tracking-wide text-gray-300 group-hover:text-gold transition-colors duration-300 line-clamp-2">
                              {shot.title}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>

                  <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {bestSellingProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                      >
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case 'home.featuredProducts':
            return (
              <section key={section.id} className="px-4 py-10 sm:py-20">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-6 sm:mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                      <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-widest">
                        {featuredData.eyebrow}
                      </span>
                      <h2 className="mt-2 sm:mt-4 font-playfair text-2xl sm:text-4xl md:text-5xl font-bold">
                        {featuredData.title}
                      </h2>
                      <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-400">
                        {featuredData.description}
                      </p>
                    </div>
                    <Link
                      href={featuredData.ctaHref}
                      className={buttonVariants({ variant: 'gold', className: 'w-full sm:w-auto h-11 sm:h-14 sm:px-8 text-sm sm:text-base' })}
                    >
                      {featuredData.ctaLabel}
                      <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {featuredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                      >
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case 'home.allProductsMini':
            return (
              <section key={section.id} className="px-4 py-10 sm:py-20 silk-overlay">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-6 sm:mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                      <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-widest">
                        {allProductsData.eyebrow}
                      </span>
                      <h2 className="mt-2 sm:mt-4 font-playfair text-2xl sm:text-4xl md:text-5xl font-bold">
                        {allProductsData.title}
                      </h2>
                      <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-400">
                        {allProductsData.description}
                      </p>
                    </div>
                    <Link
                      href={allProductsData.ctaHref || '/products'}
                      className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-auto h-11 sm:h-14 sm:px-8 text-sm sm:text-base' })}
                    >
                      {allProductsData.ctaLabel || 'View Full Shop'}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {allProductsMini.map((product, index) => (
                      <motion.div
                        key={product.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.35, delay: index * 0.05 }}
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          className="group glass flex items-center gap-3 rounded-2xl p-3 transition-all duration-300 hover:scale-[1.02] hover:glow-gold"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-black/40">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="96px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/70">
                              Premium
                            </p>
                            <h3 className="mt-1 line-clamp-2 text-sm font-medium text-white group-hover:text-gold transition-colors">
                              {product.name}
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-gold">
                              {product.price}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case 'home.gallery':
            return (
              <section key={section.id} className="relative px-4 py-10 sm:py-20">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.15),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_55%)]" />
                <div className="mx-auto max-w-7xl">
                  <div className="mb-6 sm:mb-12 text-center">
                    <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-widest">
                      {galleryData.eyebrow}
                    </span>
                    <h2 className="mt-2 sm:mt-4 font-playfair text-2xl sm:text-4xl md:text-5xl font-bold">
                      {galleryData.title}
                    </h2>
                    <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-sm sm:text-base text-gray-400">
                      {galleryData.description}
                    </p>
                  </div>

                  <>
                    {/* Desktop Gallery View */}
                    <div className="hidden sm:grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-[240px] xl:grid-cols-4 xl:auto-rows-[220px]">
                      {normalizedGalleryImages.map((item, index) => {
                        const mergedSpan = typeof item?.span === 'string' ? item.span.trim() : ''
                        return (
                          <motion.div
                            key={`${item?.image ?? 'gallery'}-${index}`}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, delay: index * 0.06 }}
                            className={mergedSpan}
                          >
                            <Link
                              href={`/products?flag=${encodeURIComponent(item.title)}`}
                              className="group relative block h-full min-h-[240px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-[1px] transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_40px_rgba(212,175,55,0.20)] cursor-pointer"
                            >
                              <div className="relative h-full overflow-hidden rounded-[calc(2rem-1px)] bg-black/80">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover opacity-95 transition-transform duration-700 group-hover:scale-110"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(212,175,55,0.18),transparent_45%,rgba(255,255,255,0.06))]" />
                                <div className="absolute left-6 top-6">
                                  <span className="inline-flex rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-gold/80 backdrop-blur">
                                    {item.subtitle}
                                  </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                                  <div>
                                    <h3 className="font-playfair text-2xl font-semibold text-white md:text-3xl group-hover:text-gold transition-colors">
                                      {item.title}
                                    </h3>
                                    <div className="mt-4 h-px w-20 bg-gradient-to-r from-gold/70 to-transparent transition-all duration-300 group-hover:w-32" />
                                  </div>
                                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Explore →
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Mobile Gallery View */}
                    <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:hidden">
                      {normalizedGalleryImages.map((item, index) => (
                        <motion.div
                          key={`${item?.image ?? 'gallery'}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                        >
                          <Link
                            href={`/products?flag=${encodeURIComponent(item.title)}`}
                            className="group flex flex-col items-center cursor-pointer"
                          >
                            <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 group-hover:border-gold/60 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] luxury-shadow">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 640px) 33vw, 120px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <span className="mt-2 text-center text-xs font-medium tracking-wide text-gray-300 group-hover:text-gold transition-colors duration-300 line-clamp-2">
                              {item.title}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </>
                </div>
              </section>
            )
          case 'home.brands':
            return (
              <section key={section.id} className="py-10 sm:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-8 sm:mb-16">
                    <span className="text-gold font-cormorant text-base sm:text-lg tracking-widest uppercase">
                      {brandsData.eyebrow || 'Premium Brands'}
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold mt-2 sm:mt-4">
                      {brandsData.title || 'Featured Korean Brands'}
                    </h2>
                    <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-sm sm:text-base text-gray-400">
                      {brandsData.description ||
                        'A curated lineup of iconic Korean beauty names trusted for glow, hydration, barrier care, and elevated daily rituals.'}
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-stretch">
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5 }}
                      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
                    >
                      <div className="relative h-full min-h-[420px] overflow-hidden rounded-[calc(2rem-1px)] bg-black/80">
                        <Image
                          src={
                            brandsData.heroImage ||
                            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=1500&fit=crop&auto=format'
                          }
                          alt={brandsData.heroImageAlt || 'Premium Korean beauty campaign'}
                          fill
                          className="object-cover opacity-45"
                          sizes="(max-width: 1024px) 100vw, 40vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                        <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-10">
                          <span className="inline-flex w-fit rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-gold">
                            {brandsData.heroBadge || 'Trusted Brand Edit'}
                          </span>
                          <h3 className="mt-5 max-w-lg font-playfair text-3xl font-semibold leading-tight text-white md:text-4xl">
                            {brandsData.heroTitle ||
                              'Curated Korean beauty brands with a cleaner, more elevated presentation.'}
                          </h3>
                          <p className="mt-4 max-w-xl text-base leading-7 text-gray-300">
                            {brandsData.heroDescription ||
                              'We handpick globally loved K-beauty names known for barrier care, hydration, and luminous skin results, then present them in a luxury retail atmosphere.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {featuredBrands.map((brand, index) => (
                        <motion.div
                          key={brand}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-[1px] transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                        >
                          <div className="flex h-full items-center gap-4 rounded-[calc(1.75rem-1px)] bg-black/70 px-5 py-5 backdrop-blur-xl">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 font-cormorant text-base uppercase tracking-[0.25em] text-gold">
                              {brand
                                .split(' ')
                                .map((part: string) => part[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-playfair text-xl text-white transition-colors group-hover:text-gold">
                                {brand}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gray-500">
                                Korean Beauty
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          case 'home.concerns':
            return (
              <section key={section.id} className="py-10 sm:py-20 px-4 silk-overlay">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-7 sm:mb-14">
                    <span className="text-gold font-cormorant text-base sm:text-lg tracking-widest uppercase">
                      {concernsData.eyebrow}
                    </span>
                    <h2 className="font-playfair text-2xl sm:text-4xl md:text-5xl font-bold mt-2 sm:mt-4">
                      {concernsData.title}
                    </h2>
                    <p className="mx-auto mt-2 sm:mt-4 max-w-2xl text-sm sm:text-base text-gray-400">
                      Find your perfect solution in one click. We’ll show products curated around your skin goals.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
                    {concerns.map((concern: any, index: number) => {
                      const concernSlug = (concern.name ?? '')
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, '-')
                      const hint =
                        concernHints[(concern.name ?? '').toLowerCase().trim()] ?? 'Curated routine'

                      return (
                        <motion.div
                          key={concern.name}
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.25 }}
                          transition={{ duration: 0.35, delay: index * 0.04 }}
                        >
                          <Link
                            href={`/products?concern=${concernSlug}`}
                            className="group relative flex h-full min-h-[170px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 px-5 py-7 text-center transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.10)]"
                          >
                            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(212,175,55,0.10),transparent_45%,rgba(255,255,255,0.06))]" />
                            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-gold/20 bg-gold/10 text-3xl">
                              {concern.icon}
                            </div>
                            <div className="relative z-10">
                              <p className="font-playfair text-xl text-white transition-colors group-hover:text-gold">
                                {concern.name}
                              </p>
                              <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-gray-500">
                                {hint}
                              </p>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/products"
                      className={buttonVariants({
                        variant: 'default',
                        className:
                          'rounded-full bg-gold text-black hover:bg-gold/90 px-7 py-6 text-sm uppercase tracking-[0.22em]',
                      })}
                    >
                      Browse All Products
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      href="/concerns"
                      className={buttonVariants({
                        variant: 'outline',
                        className:
                          'rounded-full border-white/15 bg-white/[0.03] px-7 py-6 text-sm uppercase tracking-[0.22em] text-white hover:border-gold/30 hover:text-gold',
                      })}
                    >
                      Explore Concerns
                    </Link>
                  </div>
                </div>
              </section>
            )
          case 'home.reviews':
            return (
              <section key={section.id} className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <span className="text-gold font-cormorant text-lg tracking-widest uppercase">
                      {reviewsData.eyebrow}
                    </span>
                    <h2 className="font-playfair text-4xl md:text-5xl font-bold mt-4">
                      {reviewsData.title}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-gray-400">
                      {reviewsData.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {customerReviews.map((review, index) => (
                      <motion.div
                        key={review.name}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                        className="glass luxury-shadow rounded-[2rem] p-8"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gold/20">
                              <Image
                                src={review.image}
                                alt={review.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            <div>
                              <h3 className="font-playfair text-2xl text-white">{review.name}</h3>
                              <p className="mt-1 text-sm uppercase tracking-[0.24em] text-gold/70">
                                {review.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-gold">
                            {Array.from({ length: review.rating }).map((_, starIndex) => (
                              <span key={starIndex} className="text-lg">
                                ★
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                          <div className="relative aspect-[16/10]">
                            <Image
                              src={review.image}
                              alt={`${review.name} beauty portrait`}
                              fill
                              className="object-cover opacity-70"
                              sizes="(max-width: 1280px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                          </div>
                        </div>

                        <p className="mt-8 font-playfair text-2xl leading-snug text-white">
                          {review.title}
                        </p>
                        <p className="mt-4 text-base leading-7 text-gray-300">
                          {review.review}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case 'home.newsletter':
            return (
              <section key={section.id} className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                  <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="grid grid-cols-2 gap-4">
                      {newsletterImages.map((shot: any, index: number) => (
                        <motion.div
                          key={`${shot.title}-newsletter`}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.45, delay: index * 0.08 }}
                          className={`group relative overflow-hidden rounded-[2rem] glass luxury-shadow ${index === 0 ? 'translate-y-6' : ''
                            }`}
                        >
                          <div className="relative aspect-[4/5]">
                            <Image
                              src={shot.image}
                              alt={shot.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              sizes="(max-width: 1024px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="glass rounded-3xl p-12 text-center glow-gold">
                      <span className="text-gold font-cormorant text-lg tracking-widest uppercase">
                        {newsletterData.eyebrow || 'Stay Updated'}
                      </span>
                      <h2 className="font-playfair text-3xl md:text-4xl font-bold mt-4 mb-6">
                        {newsletterData.title || 'Subscribe to Our Newsletter'}
                      </h2>
                      <p className="text-gray-400 mb-8">
                        {newsletterData.description ||
                          'Get exclusive offers, skincare tips, and be the first to know about new arrivals.'}
                      </p>
                      <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="flex-1 px-6 py-4 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                        />
                        <button
                          type="submit"
                          className={buttonVariants({ variant: 'gold', size: 'lg' })}
                        >
                          {newsletterData.buttonLabel || 'Subscribe'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </main>
  )
}
