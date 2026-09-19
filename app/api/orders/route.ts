import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/db/models/order'
import { auth } from '@/lib/auth/config'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id || 'guest'

    await connectDB()

    const {
      products,
      shippingAddress,
      couponCode,
      discount: clientDiscount,
      shippingZone,
      paymentMethod,
      walletPhone,
      walletTransactionId,
      shippingCost: clientShippingCost,
    } = await request.json()

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'No products in cart' },
        { status: 400 }
      )
    }

    const subtotal = products.reduce(
      (sum: number, item: any) => sum + (item.salePrice || item.price) * item.quantity,
      0
    )

    const normalizedZone =
      shippingZone === 'outside' || shippingZone === 'dhaka'
        ? shippingZone
        : typeof shippingAddress?.city === 'string' &&
            shippingAddress.city.trim().toLowerCase() === 'dhaka'
          ? 'dhaka'
          : 'outside'

    const baseShippingCost = normalizedZone === 'outside' ? 120 : 70
    const shippingCost = clientShippingCost !== undefined ? Number(clientShippingCost) : baseShippingCost
    let discount = Number(clientDiscount) || 0

    // Apply coupon if provided
    if (couponCode && !clientDiscount) {
      // Coupon validation logic fallback
      discount = 0
    }

    const total = subtotal + shippingCost - discount

    const normalizedPaymentMethod =
      paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'cod'
        ? paymentMethod
        : 'cod'

    const notes =
      normalizedPaymentMethod === 'bkash' || normalizedPaymentMethod === 'nagad'
        ? [
            walletPhone
              ? `${normalizedPaymentMethod === 'nagad' ? 'Nagad' : 'bKash'}: ${String(walletPhone).trim()}`
              : null,
            walletTransactionId ? `TrxID: ${String(walletTransactionId).trim()}` : null,
          ]
            .filter(Boolean)
            .join(' | ')
        : undefined

    // Create order
    const order = await Order.create({
      user: userId,
      products: products.map((item: any) => ({
        product: item.productId,
        name: item.name,
        image: item.image,
        variant: item.variant,
        quantity: item.quantity,
        price: item.salePrice || item.price,
      })),
      subtotal,
      shippingCost,
      discount,
      coupon: couponCode,
      total,
      shippingAddress,
      paymentMethod:
        normalizedPaymentMethod === 'bkash'
          ? 'bKash'
          : normalizedPaymentMethod === 'nagad'
            ? 'Nagad'
            : 'Cash on Delivery',
      paymentStatus: 'pending',
      status: 'pending',
      notes,
      transactionId: walletTransactionId ? String(walletTransactionId).trim() : undefined,
      walletPhone: walletPhone ? String(walletPhone).trim() : undefined,
    })

    return NextResponse.json({
      order,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
