'use client'

import { useState, useEffect, useRef } from 'react'
import { getAdminCoupons, type AdminCoupon, getMockProducts } from '@/lib/products-store'
import { type MockProduct } from '@/lib/products-mock'
import { type IAddress } from '@/components/account/profile-client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, ChevronLeft, ChevronRight, CheckCircle2, UserPlus, Zap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useCartStore } from '@/stores/cart-store'
import { useShippingDiscountStore } from '@/stores/shipping-discount-store'
import { formatPrice } from '@/lib/utils/cn'
import { checkoutSchema, CheckoutInput } from '@/lib/utils/validators/schemas'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/products/product-card'
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary-url'

const BKASH_MERCHANT_NUMBER = process.env.NEXT_PUBLIC_BKASH_MERCHANT_NUMBER || '01XXXXXXXXX'
const NAGAD_MERCHANT_NUMBER = process.env.NEXT_PUBLIC_NAGAD_MERCHANT_NUMBER || '01XXXXXXXXX'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [guestOrderSuccess, setGuestOrderSuccess] = useState<{
    orderNumber: string
    name: string
    phone: string
    total: number
    paymentMethod: string
  } | null>(null)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AdminCoupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  const [suggestions, setSuggestions] = useState<MockProduct[]>([])
  const sliderRef = useRef<HTMLDivElement>(null)
  const shippingDiscountRule = useShippingDiscountStore()

  useEffect(() => {
    setIsMounted(true)

    const handleSync = () => {
      useShippingDiscountStore.persist.rehydrate()
    }

    window.addEventListener('cop:syncComplete', handleSync)
    // Run once on mount in case sync completed before this effect ran
    useShippingDiscountStore.persist.rehydrate()

    return () => {
      window.removeEventListener('cop:syncComplete', handleSync)
    }
  }, [])


  useEffect(() => {
    if (!isMounted || items.length === 0) return

    const loadLocalData = () => {
      const cartProductIds = items.map((item) => item.productId)
      const allProducts = getMockProducts()

      // Get categories of products currently in the cart
      const cartCategories = Array.from(
        new Set(
          allProducts
            .filter((p) => cartProductIds.includes(p.id))
            .map((p) => p.category)
        )
      )

      // Filter candidate products that are in the same categories but not already in the cart
      let candidates = allProducts.filter(
        (p) => cartCategories.includes(p.category) && !cartProductIds.includes(p.id)
      )

      // Fallback if no matching category products (or they are all in the cart)
      if (candidates.length === 0) {
        candidates = allProducts.filter((p) => !cartProductIds.includes(p.id))
      }

      // Sort by rating in descending order to get the top reviewed products
      const topRatedCandidates = [...candidates].sort((a, b) => b.rating - a.rating)

      // Take top 15 rated products as our pool to shuffle
      const pool = topRatedCandidates.slice(0, 15)

      // Randomize the sequence on checkout page visit
      const shuffled = [...pool].sort(() => Math.random() - 0.5)

      // Select 8-10 products (we'll limit to 10)
      setSuggestions(shuffled.slice(0, 10))
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
    }
  }, [items, isMounted])

  const handleScroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current
      const scrollAmount = clientWidth * 0.75
      sliderRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleApplyCoupon = () => {
    setCouponError('')
    const code = couponInput.trim().toUpperCase()
    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }

    const coupons = getAdminCoupons()
    const coupon = coupons.find((c) => c.code === code)

    console.log('[DEBUG COUPON APPLY] code:', code, 'coupons list:', coupons, 'found coupon:', coupon)

    if (!coupon) {
      setCouponError('Invalid coupon code')
      return
    }


    if (!coupon.active) {
      setCouponError('This coupon is inactive')
      return
    }

    const today = new Date()
    const expDate = new Date(coupon.expiresAt)
    today.setHours(0, 0, 0, 0)
    expDate.setHours(0, 0, 0, 0)
    if (today.getTime() > expDate.getTime()) {
      setCouponError('This coupon has expired')
      return
    }

    if (subtotal < coupon.minimumSpend) {
      setCouponError(`Minimum spend of ৳${coupon.minimumSpend} required`)
      return
    }

    let calcDiscount = 0
    if (coupon.type === 'percent') {
      calcDiscount = Math.round((subtotal * coupon.discount) / 100)
    } else {
      calcDiscount = coupon.discount
    }

    calcDiscount = Math.min(calcDiscount, subtotal)

    setAppliedCoupon(coupon)
    setDiscountAmount(calcDiscount)
    toast.success(`Coupon "${coupon.code}" applied successfully!`)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponInput('')
    setCouponError('')
    toast.success('Coupon removed')
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingZone: 'dhaka',
      paymentMethod: 'cod',
    },
  })

  const [savedAddresses, setSavedAddresses] = useState<IAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  useEffect(() => {
    fetch('/api/account')
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          setSavedAddresses(data.addresses)
          const defaultAddr = data.addresses.find((addr: any) => addr.isDefault) || data.addresses[0]
          const defaultId = defaultAddr._id || defaultAddr.id
          setSelectedAddressId(defaultId)
          
          // Auto fill fields
          setValue('name', defaultAddr.name)
          setValue('phone', defaultAddr.phone)
          setValue('address', defaultAddr.address)
          setValue('city', defaultAddr.city)
          setValue('postalCode', defaultAddr.postalCode)
          setValue('shippingZone', defaultAddr.city.toLowerCase().trim() === 'dhaka' ? 'dhaka' : 'outside')
        } else {
          setSelectedAddressId('custom')
        }
      })
      .catch(() => {
        setSelectedAddressId('custom')
      })
  }, [setValue])

  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id)
    if (id === 'custom') {
      setValue('name', '')
      setValue('phone', '')
      setValue('address', '')
      setValue('city', '')
      setValue('postalCode', '')
    } else {
      const selectedAddr = savedAddresses.find((addr) => (addr._id || (addr as any).id) === id)
      if (selectedAddr) {
        setValue('name', selectedAddr.name)
        setValue('phone', selectedAddr.phone)
        setValue('address', selectedAddr.address)
        setValue('city', selectedAddr.city)
        setValue('postalCode', selectedAddr.postalCode)
        setValue('shippingZone', selectedAddr.city.toLowerCase().trim() === 'dhaka' ? 'dhaka' : 'outside')
      }
    }
  }

  const subtotal = getTotalPrice()
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const shippingZone = watch('shippingZone')
  const paymentMethod = watch('paymentMethod')
  const customerPhone = watch('phone')

  const feeDhaka = shippingDiscountRule?.shippingDhaka ?? 70
  const feeOutside = shippingDiscountRule?.shippingOutside ?? 120
  console.log('[DEBUG CHECKOUT] shippingDiscountRule:', {
    active: shippingDiscountRule?.active,
    shippingDhaka: shippingDiscountRule?.shippingDhaka,
    shippingOutside: shippingDiscountRule?.shippingOutside,
    threshold: shippingDiscountRule?.threshold,
    condition: shippingDiscountRule?.condition
  })
  let baseShipping = shippingZone === 'outside' ? feeOutside : feeDhaka

  let isFreeShipping = false
  if (shippingDiscountRule && shippingDiscountRule.active) {
    const threshold = Number(shippingDiscountRule.threshold) || 0
    const cond = shippingDiscountRule.condition ?? 'upper'
    if (cond === 'total' && subtotal === threshold) {
      isFreeShipping = true
    } else if (cond === 'upper' && subtotal >= threshold) {
      isFreeShipping = true
    } else if (cond === 'lower' && subtotal <= threshold) {
      isFreeShipping = true
    }
    console.log('[Free Shipping Eval]', { active: shippingDiscountRule.active, cond, subtotal, threshold, isFreeShipping })
  }
  const shipping = isFreeShipping ? 0 : baseShipping
  const total = subtotal + shipping - discountAmount
  const walletMerchantNumber =
    paymentMethod === 'nagad' ? NAGAD_MERCHANT_NUMBER : BKASH_MERCHANT_NUMBER

  const onSubmit = async (data: CheckoutInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: items,
          shippingAddress: {
            name: data.name,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
          },
          shippingZone: data.shippingZone,
          paymentMethod: data.paymentMethod,
          walletPhone: data.walletPhone,
          walletTransactionId: data.walletTransactionId,
          couponCode: appliedCoupon?.code || undefined,
          discount: discountAmount,
          shippingCost: shipping,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to create order')
        return
      }

      toast.success('Order placed successfully!')
      clearCart()

      if (session?.user) {
        router.push('/account')
      } else {
        setGuestOrderSuccess({
          orderNumber: result.order?.orderNumber || 'CP' + Date.now().toString().slice(-6),
          name: data.name,
          phone: data.phone,
          total,
          paymentMethod: data.paymentMethod,
        })
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-white">Loading checkout...</h2>
        </div>
      </div>
    )
  }

  if (guestOrderSuccess) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center silk-overlay">
        <div className="max-w-2xl w-full glass rounded-3xl p-8 sm:p-12 text-center border border-gold/30 luxury-shadow">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-gold font-cormorant text-sm uppercase tracking-[0.3em] font-semibold">
            Order Confirmed
          </span>

          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white mt-2 mb-3">
            Thank You for Your Order!
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto mb-6">
            Your order <span className="text-gold font-semibold">#{guestOrderSuccess.orderNumber}</span> has been received and is being processed.
          </p>

          <div className="glass rounded-2xl p-5 mb-8 text-left border border-white/10 space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Customer Name:</span>
              <span className="font-medium text-white">{guestOrderSuccess.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone Number:</span>
              <span className="font-medium text-white">{guestOrderSuccess.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-medium text-white uppercase">{guestOrderSuccess.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10 text-base font-bold">
              <span>Total Amount:</span>
              <span className="text-gold">{formatPrice(guestOrderSuccess.total)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-gold font-semibold">
              Choose Next Action
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href={`/auth/signup?phone=${encodeURIComponent(guestOrderSuccess.phone)}`}>
                <Button variant="gold" size="lg" className="w-full h-14 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <UserPlus className="w-5 h-5" />
                  Option 1: Create Account
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full h-14 flex items-center justify-center gap-2 text-sm sm:text-base border-white/20 hover:border-gold">
                  <ShoppingBag className="w-5 h-5" />
                  Option 2: Continue as Guest
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-400 pt-2">
              Registering lets you track order status & save addresses. Or continue shopping directly!
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-gray-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
          <Link href="/products">
            <Button variant="gold" size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 silk-overlay">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>

        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-center text-gradient-gold mb-12">
          Checkout
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-2 gap-12">
          {/* Shipping Form */}
          <div className="glass rounded-3xl p-8">
            <h2 className="font-playfair text-2xl font-bold text-white mb-6">
              Shipping Information
            </h2>

            {savedAddresses.length > 0 && (
              <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
                <label className="block text-xs uppercase tracking-wider text-gold font-semibold mb-2">
                  Select Shipping Address
                </label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-full text-white outline-none focus:border-gold transition-colors text-sm"
                >
                  {savedAddresses.map((addr) => {
                    const id = addr._id || (addr as any).id
                    return (
                      <option key={id} value={id}>
                        {addr.name} - {addr.address}, {addr.city} {addr.isDefault ? '(Default)' : ''}
                      </option>
                    )
                  })}
                  <option value="custom">Enter a new shipping address</option>
                </select>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Shipping Zone
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 transition-colors hover:border-gold/30">
                    <input
                      type="radio"
                      value="dhaka"
                      {...register('shippingZone')}
                      className="h-4 w-4 accent-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Inside Dhaka</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gold/70">
                        Delivery ৳{shippingDiscountRule?.shippingDhaka ?? 70}
                      </p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 transition-colors hover:border-gold/30">
                    <input
                      type="radio"
                      value="outside"
                      {...register('shippingZone')}
                      className="h-4 w-4 accent-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Outside Dhaka</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gold/70">
                        Delivery ৳{shippingDiscountRule?.shippingOutside ?? 120}
                      </p>
                    </div>
                  </label>
                </div>
                {errors.shippingZone && (
                  <p className="mt-2 text-sm text-red-500">{errors.shippingZone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  className="w-full px-6 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  className="w-full px-6 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                  placeholder="01XXX-XXXXXX"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  {...register('address')}
                  className="w-full px-6 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                  placeholder="House #, Road #, Area"
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    {...register('city')}
                    className="w-full px-6 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                    placeholder="Dhaka"
                  />
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-500">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Postal Code
                  </label>
                  <input
                    {...register('postalCode')}
                    className="w-full px-6 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                    placeholder="1000"
                  />
                  {errors.postalCode && (
                    <p className="mt-2 text-sm text-red-500">{errors.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 transition-colors hover:border-gold/30">
                    <input
                      type="radio"
                      value="cod"
                      {...register('paymentMethod')}
                      className="h-4 w-4 accent-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Cash on Delivery</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gray-500">
                        Pay when you receive
                      </p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 transition-colors hover:border-gold/30">
                    <input
                      type="radio"
                      value="bkash"
                      {...register('paymentMethod')}
                      className="h-4 w-4 accent-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">bKash</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gray-500">
                        Manual verification
                      </p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 transition-colors hover:border-gold/30">
                    <input
                      type="radio"
                      value="nagad"
                      {...register('paymentMethod')}
                      className="h-4 w-4 accent-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Nagad</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-gray-500">
                        Manual verification
                      </p>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-500">{errors.paymentMethod.message}</p>
                )}

                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <div className="mt-5 grid gap-4 rounded-2xl border border-gold/20 bg-gold/10 p-5">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-gold/80">
                        Payment Instructions
                      </p>
                      <p className="mt-3 text-sm text-gray-200">
                        Send money to our{' '}
                        <span className="font-semibold text-white">
                          {paymentMethod === 'nagad' ? 'Nagad' : 'bKash'}
                        </span>{' '}
                        number, then enter your Transaction ID below.
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                            Our Number
                          </p>
                          <p className="mt-2 font-medium text-white">{walletMerchantNumber}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                            Amount
                          </p>
                          <p className="mt-2 font-medium text-white">{formatPrice(total)}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                            Reference
                          </p>
                          <p className="mt-2 font-medium text-white">
                            {customerPhone?.trim() ? customerPhone.trim() : 'Your phone'}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-xs uppercase tracking-[0.26em] text-gold/70">
                        Type: Send Money • Keep screenshot until confirmed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Your wallet number
                      </label>
                      <input
                        {...register('walletPhone')}
                        className="w-full px-6 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                        placeholder="01XXXXXXXXX"
                      />
                      {errors.walletPhone && (
                        <p className="mt-2 text-sm text-red-500">{errors.walletPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Transaction ID (TrxID)
                      </label>
                      <input
                        {...register('walletTransactionId')}
                        className="w-full px-6 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors"
                        placeholder="e.g. 9A7B6C5D"
                      />
                      {errors.walletTransactionId && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.walletTransactionId.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass rounded-3xl p-8 h-fit">
            <h2 className="font-playfair text-2xl font-bold text-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={getOptimizedImageUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        if (target && !target.src.includes('cleanser.jpg')) {
                          target.src = '/categories/cleanser.jpg'
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatPrice(item.salePrice || item.price)}
                    </p>
                  </div>
                  <span className="text-gold font-bold">
                    {formatPrice((item.salePrice || item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Input */}
            <div className="border-t border-white/10 pt-6 pb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coupon / Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1 px-4 py-2.5 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors text-white uppercase text-sm disabled:opacity-50"
                />
                {appliedCoupon ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveCoupon}
                    className="rounded-full px-5 py-2.5 text-xs text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gold"
                    onClick={handleApplyCoupon}
                    className="rounded-full px-5 py-2.5 text-xs"
                  >
                    Apply
                  </Button>
                )}
              </div>
              {couponError && (
                <p className="mt-2 text-xs text-red-400 font-medium">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="mt-2 text-xs text-emerald-400 font-medium">
                  Coupon &quot;{appliedCoupon.code}&quot; applied: {appliedCoupon.description || (appliedCoupon.type === 'percent' ? `${appliedCoupon.discount}% off` : `৳${appliedCoupon.discount} off`)}
                </p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    Free
                    {shippingDiscountRule && shippingDiscountRule.active && (
                      <span className="text-[10px] text-emerald-400/80 ml-1 uppercase tracking-wider font-semibold">
                        (Auto Promo)
                      </span>
                    )}
                  </span>
                ) : (
                  <span>{formatPrice(shipping)}</span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 text-sm">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-gold">{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="xl"
              className="w-full mt-8"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Placing order...'
                : paymentMethod === 'bkash'
                  ? 'Place Order (bKash)'
                  : paymentMethod === 'nagad'
                    ? 'Place Order (Nagad)'
                    : 'Place Order (Cash on Delivery)'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Wallet orders will be confirmed after manual verification.
            </p>
          </div>
        </form>

        {suggestions.length > 0 && (
          <div className="mt-16 pt-16 border-t border-white/10">
            <style dangerouslySetInnerHTML={{ __html: `
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}} />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-playfair text-3xl font-bold text-white">Similar Products You May Like</h2>
                <p className="text-sm text-gray-400 mt-1">Recommended based on items in your cart</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="p-3 rounded-full border border-white/10 bg-black/40 text-white hover:border-gold/50 hover:text-gold transition-colors backdrop-blur-sm focus:outline-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="p-3 rounded-full border border-white/10 bg-black/40 text-white hover:border-gold/50 hover:text-gold transition-colors backdrop-blur-sm focus:outline-none"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={sliderRef}
              className="flex overflow-x-auto gap-6 pb-6 scroll-smooth snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {suggestions.map((product) => (
                <div key={product.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start flex-shrink-0">
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
