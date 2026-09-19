'use client'

import { use, useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Heart, Minus, Plus, Truck, Shield, RotateCcw, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { formatPrice } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { mockProducts, type MockProduct } from '@/lib/products-mock'
import { getMockProducts, getAdminReviews, saveAdminReview, type AdminReview } from '@/lib/products-store'
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary-url'

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  
  const [product, setProduct] = useState<MockProduct>(() => {
    return mockProducts.find(
      (p) => p.slug === slug || p.slug === slug.replace('soothing', 'sooting')
    ) || mockProducts[0]
  })

  const [selectedImage, setSelectedImage] = useState(0)
  const [mainImgSrc, setMainImgSrc] = useState<string>(() => {
    const p = mockProducts.find(
      (item) => item.slug === slug || item.slug === slug.replace('soothing', 'sooting')
    ) || mockProducts[0]
    return getOptimizedImageUrl(p.images?.[0] || (p as any).image)
  })

  const [reviewsList, setReviewsList] = useState<AdminReview[]>([])
  const { data: session, status: sessionStatus } = useSession()

  const [selectedRating, setSelectedRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim()) {
      toast.error('Please write your review content')
      return
    }

    setIsSubmitting(true)

    try {
      const newReview: AdminReview = {
        id: `rev_${Date.now()}`,
        product: mockProduct.name,
        customer: session?.user?.name || 'Princess Customer',
        rating: selectedRating,
        title: '',
        comment: reviewComment.trim(),
        status: 'approved',
      }

      const updated = saveAdminReview(newReview)
      setReviewsList(updated)
      
      setReviewComment('')
      setSelectedRating(5)
      
      toast.success('Thank you! Your review has been published and synced.')
    } catch (err) {
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const loadLocalData = () => {
      const list = getMockProducts()
      const found = list.find(
        (p) => p.slug === slug || p.slug === slug.replace('soothing', 'sooting')
      )
      if (found) {
        setProduct(found)
        const primary = found.images?.[0] || (found as any).image
        setMainImgSrc(getOptimizedImageUrl(primary))
      }
      setReviewsList(getAdminReviews())
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
    }
  }, [slug])

  const mockProduct = product
  const router = useRouter()

  useEffect(() => {
    const activeUrl = mockProduct.images?.[selectedImage] || (mockProduct as any).image
    setMainImgSrc(getOptimizedImageUrl(activeUrl))
  }, [mockProduct, selectedImage])

  const productReviews = useMemo(() => {
    return reviewsList.filter((r) => r.product === mockProduct.name && r.status === 'approved')
  }, [reviewsList, mockProduct])

  const { averageRating, totalReviews, ratingCounts } = useMemo(() => {
    const total = productReviews.length
    if (total > 0) {
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0)
      const avg = (sum / total).toFixed(1)
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      productReviews.forEach((r) => {
        const rating = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5
        counts[rating]++
      })
      return {
        averageRating: avg,
        totalReviews: total,
        ratingCounts: counts,
      }
    } else {
      const mockRating = mockProduct.rating
      const mockTotal = mockProduct.reviewCount
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      
      if (mockTotal > 0) {
        if (mockRating >= 4.5) {
          counts[5] = Math.round(mockTotal * 0.75)
          counts[4] = Math.round(mockTotal * 0.18)
          counts[3] = Math.round(mockTotal * 0.05)
          counts[2] = Math.round(mockTotal * 0.01)
          counts[1] = Math.max(0, mockTotal - (counts[5] + counts[4] + counts[3] + counts[2]))
        } else if (mockRating >= 4.0) {
          counts[5] = Math.round(mockTotal * 0.55)
          counts[4] = Math.round(mockTotal * 0.30)
          counts[3] = Math.round(mockTotal * 0.10)
          counts[2] = Math.round(mockTotal * 0.03)
          counts[1] = Math.max(0, mockTotal - (counts[5] + counts[4] + counts[3] + counts[2]))
        } else {
          counts[5] = Math.round(mockTotal * 0.40)
          counts[4] = Math.round(mockTotal * 0.30)
          counts[3] = Math.round(mockTotal * 0.15)
          counts[2] = Math.round(mockTotal * 0.10)
          counts[1] = Math.max(0, mockTotal - (counts[5] + counts[4] + counts[3] + counts[2]))
        }
      }

      return {
        averageRating: mockRating.toFixed(1),
        totalReviews: mockTotal,
        ratingCounts: counts,
      }
    }
  }, [productReviews, mockProduct])
  const [quantity, setQuantity] = useState(1)
  const [expanded, setExpanded] = useState<string | null>('description')
  
  const { addItem, openCart } = useCartStore()
  const { isInWishlist, toggleItem } = useWishlistStore()

  const inWishlist = isInWishlist(mockProduct.id)
  const discount = mockProduct.salePrice
    ? Math.round(((mockProduct.price - mockProduct.salePrice) / mockProduct.price) * 100)
    : 0

  const handleAddToCart = () => {
    addItem({
      id: `${mockProduct.id}-${Date.now()}`,
      productId: mockProduct.id,
      name: mockProduct.name,
      image: mockProduct.images[0],
      price: mockProduct.price,
      salePrice: mockProduct.salePrice,
      quantity,
    })
    openCart()
  }

  const handleBuyNow = () => {
    addItem({
      id: `${mockProduct.id}-${Date.now()}`,
      productId: mockProduct.id,
      name: mockProduct.name,
      image: mockProduct.images[0],
      price: mockProduct.price,
      salePrice: mockProduct.salePrice,
      quantity,
    })
    router.push('/checkout')
  }

  const handleToggleWishlist = () => {
    const exists = isInWishlist(mockProduct.id)

    toggleItem({
      id: mockProduct.id,
      productId: mockProduct.id,
      slug: mockProduct.slug,
      name: mockProduct.name,
      image: mockProduct.images[0],
      price: mockProduct.price,
      salePrice: mockProduct.salePrice,
    })

    toast.success(exists ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div className="min-h-screen py-12 px-4 silk-overlay">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gold transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white">{mockProduct.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden glass bg-black/40">
              <Image
                src={mainImgSrc}
                alt={mockProduct.name}
                fill
                quality={95}
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain p-3"
                priority
                onError={() => {
                  if (mainImgSrc !== '/categories/cleanser.jpg' && mainImgSrc !== '/placeholder.jpg') {
                    setMainImgSrc('/categories/cleanser.jpg')
                  }
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {mockProduct.featured && (
                  <span className="px-4 py-2 bg-gradient-to-r from-gold to-gold-light text-black text-sm font-bold rounded-full">
                    Featured
                  </span>
                )}
                {mockProduct.onSale && discount > 0 && (
                  <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-xl transition-all hover:scale-110 ${
                  inWishlist ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {(mockProduct.images || []).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all bg-black/40 ${
                    selectedImage === index
                      ? 'ring-2 ring-gold glow-gold'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={getOptimizedImageUrl(image)}
                    alt={`${mockProduct.name} ${index + 1}`}
                    fill
                    quality={90}
                    sizes="150px"
                    className="object-contain p-1"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      if (target && !target.src.includes('cleanser.jpg')) {
                        target.src = '/categories/cleanser.jpg'
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-gold font-medium mb-2">{mockProduct.brand}</p>
              <h1 className="font-playfair text-4xl font-bold text-white mb-4">
                {mockProduct.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(Number(averageRating))
                          ? 'text-gold fill-gold'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">
                  {averageRating} ({totalReviews} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-gold">
                {formatPrice(mockProduct.salePrice || mockProduct.price)}
              </span>
              {mockProduct.salePrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(mockProduct.price)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-300 text-lg">
              {mockProduct.shortDescription}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {mockProduct.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-500 font-medium">
                    In Stock ({mockProduct.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Quantity:</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 glass rounded-full hover:bg-white/10 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(mockProduct.stock, quantity + 1))}
                  className="p-2 glass rounded-full hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                variant="gold"
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={mockProduct.stock <= 0}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={handleBuyNow}
                disabled={mockProduct.stock <= 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gold" />
                <span className="text-sm text-gray-400">Free Shipping over ৳2000</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gold" />
                <span className="text-sm text-gray-400">100% Authentic</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-gold" />
                <span className="text-sm text-gray-400">Easy Returns</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-4 pt-6">
              <Accordion
                title="Description"
                expanded={expanded === 'description'}
                onToggle={() => setExpanded(expanded === 'description' ? null : 'description')}
              >
                <div className="prose prose-invert max-w-none">
                  {mockProduct.description.split('\n\n').map((p, i) => (
                    <p key={i} className="text-gray-300 mb-4 whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </Accordion>

              <Accordion
                title="Ingredients"
                expanded={expanded === 'ingredients'}
                onToggle={() => setExpanded(expanded === 'ingredients' ? null : 'ingredients')}
              >
                <p className="text-gray-300">{mockProduct.ingredients}</p>
              </Accordion>

              <Accordion
                title="How to Use"
                expanded={expanded === 'howToUse'}
                onToggle={() => setExpanded(expanded === 'howToUse' ? null : 'howToUse')}
              >
                <p className="text-gray-300">{mockProduct.howToUse}</p>
              </Accordion>

              <Accordion
                title="Shipping & Returns"
                expanded={expanded === 'shipping'}
                onToggle={() => setExpanded(expanded === 'shipping' ? null : 'shipping')}
              >
                <div className="space-y-2 text-gray-300">
                  <p><strong>Shipping:</strong> Delivery within 3-5 business days in Dhaka, 5-7 days outside Dhaka.</p>
                  <p><strong>Returns:</strong> 7-day return policy for unopened products.</p>
                </div>
              </Accordion>
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="mb-8">
            <h2 className="font-playfair text-3xl font-bold text-white">
              Customer Reviews
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Hear what our princess community says about this item.
            </p>
          </div>

          {/* Premium Rating & Breakdown Card */}
          <div className="mb-10 bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Left Column: Big Average Score */}
              <div className="flex flex-col items-center justify-center text-center pb-6 md:pb-0 border-b md:border-b-0 md:border-r border-white/10 md:pr-8 w-full md:w-1/3">
                <p className="text-5xl font-extrabold text-gold tracking-tight">{averageRating}</p>
                <div className="flex items-center justify-center mt-3 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(Number(averageRating)) ? 'text-gold fill-gold' : 'text-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Right Column: Progress Bars */}
              <div className="w-full md:w-2/3 space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars as 1|2|3|4|5] || 0
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                  return (
                    <div key={stars} className="flex items-center gap-4 text-sm">
                      <span className="w-12 text-gray-400 font-semibold flex items-center gap-1 justify-end">
                        {stars} <Star className="w-3.5 h-3.5 text-gold fill-gold inline" />
                      </span>
                      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="h-full bg-gradient-to-r from-gold via-gold/80 to-gold-light rounded-full transition-all duration-1000 ease-out"
                        />
                      </div>
                      <span className="w-10 text-gray-400 font-semibold text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Write a Review Section */}
          <div className="mb-10 glass rounded-3xl p-6 md:p-8 border border-white/10 bg-white/[0.01]">
            <h3 className="font-playfair text-2xl font-bold text-white mb-2">
              Write a Product Review
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Share your thoughts and rating with other shoppers.
            </p>

            {sessionStatus === 'authenticated' ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= selectedRating ? 'text-gold fill-gold' : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Review Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked, how it felt on your skin, etc."
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none transition-colors focus:border-gold resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  disabled={isSubmitting}
                  className="rounded-full px-8"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-black/40 p-6 text-center space-y-4">
                <p className="text-gray-300 text-sm">
                  You must be signed in to submit a review for this product.
                </p>
                <Button
                  onClick={() => {
                    const callbackUrl = encodeURIComponent(window.location.pathname)
                    router.push(`/auth/login?callbackUrl=${callbackUrl}`)
                  }}
                  variant="gold"
                  className="rounded-full px-8"
                >
                  Login to Write a Review
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {productReviews.map((review) => (
              <div
                key={review.id}
                className="glass rounded-2xl p-6 border border-white/5 bg-white/[0.01]"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-gold fill-gold' : 'text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      By <span className="text-white font-medium">{review.customer}</span>
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-4 text-sm text-gray-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                    {review.comment}
                  </p>
                )}

                {/* Admin Reply */}
                {review.reply && (
                  <div className="mt-4 pl-4 border-l-2 border-gold/40 space-y-1">
                    <p className="text-xs uppercase tracking-wider text-gold font-semibold">
                      {review.replyBy || 'Castle of Princess'}
                    </p>
                    <p className="text-sm text-gray-200 bg-gold/5 p-4 rounded-xl border border-gold/10">
                      {review.reply}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {productReviews.length === 0 && (
              <div className="text-center py-12 glass rounded-2xl border border-white/5 bg-white/[0.01]">
                <p className="text-gray-500 text-sm">No reviews yet for this product. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function Accordion({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-white">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
