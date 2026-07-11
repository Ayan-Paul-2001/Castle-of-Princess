'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils/cn'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface ProductCardProps {
  id: string
  productId: string
  name: string
  slug: string
  image: string
  price: number
  salePrice?: number
  rating?: number
  reviewCount?: number
  featured?: boolean
  trending?: boolean
  onSale?: boolean
  stock?: number
}

export default function ProductCard({
  id,
  productId,
  name,
  slug,
  image,
  price,
  salePrice,
  rating = 0,
  reviewCount = 0,
  featured,
  trending,
  onSale,
  stock = 10,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { addItem, openCart } = useCartStore()
  const { isInWishlist, toggleItem } = useWishlistStore()
  const inWishlist = isMounted ? isInWishlist(productId) : false

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: `${productId}-${Date.now()}`,
      productId,
      name,
      image,
      price,
      salePrice,
      quantity: 1,
    })
    openCart()
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const wishlistItem = { id, productId, slug, name, image, price, salePrice }
    const exists = isInWishlist(productId)

    toggleItem(wishlistItem)
    toast.success(exists ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const discount = salePrice
    ? Math.round(((price - salePrice) / price) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${slug}`} className="block h-full">
        <div className="glass flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:glow-gold">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black">
            <Image
              src={image || '/categories/Cleanser.jpg'}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {/* Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Badges */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
              {featured && (
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-gold to-gold-light text-black text-[10px] sm:text-xs font-bold rounded-full">
                  Featured
                </span>
              )}
              {trending && (
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full">
                  Trending
                </span>
              )}
              {onSale && discount > 0 && (
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full animate-pulse">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div
              className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 transition-all duration-300 ${
                isHovered
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-100 translate-x-0 md:opacity-0 md:translate-x-4'
              }`}
            >
              <button
                onClick={handleToggleWishlist}
                className={`p-1.5 sm:p-2 rounded-full backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
                  inWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
              <button
                className="p-1.5 sm:p-2 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="View product details"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Add to Cart Button (Desktop Hover Only) */}
            <div
              className={`absolute bottom-3 left-3 right-3 transition-all duration-500 hidden sm:block ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Button
                variant="gold"
                size="sm"
                className="w-full group"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Stock Status */}
            {stock <= 5 && stock > 0 && (
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-1 bg-orange-500/90 text-white text-[10px] sm:text-xs font-medium rounded">
                  Only {stock} left
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gold/80 uppercase tracking-wider mb-1">
              Premium
            </p>
            <h3 className="mb-1.5 sm:mb-2 min-h-[2.5rem] sm:min-h-[3.5rem] font-semibold text-white text-xs sm:text-sm line-clamp-2 transition-colors group-hover:text-gold">
              {name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-gold text-xs sm:text-sm">
                    {i < Math.floor(rating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500">({reviewCount})</span>
            </div>

            {/* Price */}
            <div className="mt-auto flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="flex flex-col">
                {salePrice ? (
                  <>
                    <span className="text-gold font-bold text-sm sm:text-base md:text-lg">
                      {formatPrice(salePrice)}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm line-through">
                      {formatPrice(price)}
                    </span>
                  </>
                ) : (
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                    {formatPrice(price)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button (Mobile Only, Always Visible) */}
            <div className="mt-3 block sm:hidden">
              <Button
                variant="gold"
                size="sm"
                className="w-full h-8 px-2 text-xs rounded-lg group"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
