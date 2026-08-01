'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { formatPrice } from '@/lib/utils/cn'

export default function WishlistPage() {
  const { items, clearWishlist, removeItem } = useWishlistStore()
  const { addItem, openCart } = useCartStore()

  const handleMoveToCart = (item: (typeof items)[number]) => {
    addItem({
      id: `${item.productId}-${Date.now()}`,
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      salePrice: item.salePrice,
      quantity: 1,
    })
    removeItem(item.productId)
    openCart()
    toast.success('Moved to cart')
  }

  const handleRemove = (productId: string) => {
    removeItem(productId)
    toast.success('Removed from wishlist')
  }

  const handleClearWishlist = () => {
    clearWishlist()
    toast.success('Wishlist cleared')
  }

  return (
    <div className="min-h-screen silk-overlay px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
        >
          <div className="rounded-[calc(2rem-1px)] bg-black/75 p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-5 py-2 text-xs uppercase tracking-[0.32em] text-gold">
                  <Heart className="h-4 w-4" />
                  Saved Items
                </span>
                <h1 className="mt-6 font-playfair text-5xl font-bold text-white md:text-6xl">
                  Your Wishlist
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
                  Save your favorite skincare picks and come back when you&apos;re ready to add
                  them to cart.
                </p>
              </div>

              {items.length > 0 && (
                <Button variant="outline" onClick={handleClearWishlist}>
                  Clear Wishlist
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="glass mt-10 rounded-[2rem] p-10 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-playfair text-4xl text-white">Your wishlist is empty</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Start saving premium Korean skincare products so you can revisit them anytime.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-4 font-semibold text-black transition-opacity hover:opacity-90"
            >
              Explore Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
              >
                <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
                  <div className="relative min-h-[220px]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 220px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="flex flex-col p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-gold/70">Saved Product</p>
                    <h2 className="mt-3 font-playfair text-3xl text-white">{item.name}</h2>

                    <div className="mt-5">
                      {item.salePrice ? (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-semibold text-gold">
                            {formatPrice(item.salePrice)}
                          </span>
                          <span className="text-gray-500 line-through">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-semibold text-white">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-8">
                      <Button variant="gold" onClick={() => handleMoveToCart(item)}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Move to Cart
                      </Button>

                      <Button variant="outline" onClick={() => handleRemove(item.productId)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>

                      <Button variant="outline" asChild>
                        <Link href={item.slug ? `/products/${item.slug}` : '/products'}>
                          View Product
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
