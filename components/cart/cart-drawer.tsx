'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore, CartItem } from '@/stores/cart-store'
import { formatPrice } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } =
    useCartStore()
  const total = getTotalPrice()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[450px] glass-dark z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-playfair text-2xl font-bold text-white flex items-center">
            <ShoppingBag className="w-6 h-6 mr-3 text-gold" />
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-20 h-20 text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Discover our premium Korean skincare products
              </p>
              <Button variant="gold" onClick={closeCart} asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-2xl font-bold text-gold">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Shipping and taxes calculated at checkout
            </p>
            <div className="space-y-3">
              <Button variant="gold" size="xl" className="w-full" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (qty: number) => void
}) {
  const price = item.salePrice || item.price

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-4 p-4 glass rounded-2xl"
    >
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white line-clamp-2 mb-1">
          {item.name}
        </h3>
        {item.variant && (
          <p className="text-xs text-gray-500 mb-2">Variant: {item.variant}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              className="p-1 glass rounded-full hover:bg-white/10 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="p-1 glass rounded-full hover:bg-white/10 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-gold font-bold">
            {formatPrice(price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="self-start p-2 text-gray-500 hover:text-red-500 transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.div>
  )
}
