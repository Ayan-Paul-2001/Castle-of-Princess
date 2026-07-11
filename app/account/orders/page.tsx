import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Package, Truck, Clock } from 'lucide-react'
import { auth } from '@/lib/auth/config'
import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/db/models/order'
import { buttonVariants } from '@/components/ui/button'

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

export default async function AccountOrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=%2Faccount%2Forders')
  }

  await connectDB()

  const orders = await Order.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .select('orderNumber total status paymentStatus paymentMethod createdAt')
    .lean()

  return (
    <div className="min-h-screen px-4 py-16 silk-overlay">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-gold font-cormorant text-lg uppercase tracking-[0.32em]">
              Orders
            </span>
            <h1 className="mt-4 font-playfair text-5xl font-bold text-gradient-gold md:text-6xl">
              Your orders
            </h1>
            <p className="mt-4 max-w-2xl text-gray-400">
              Track delivery status and payment confirmation for each purchase.
            </p>
          </div>
          <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Continue shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/40 text-gold">
              <Package className="h-7 w-7" />
            </div>
            <h2 className="mt-8 font-playfair text-3xl text-white">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-md text-gray-400">
              Once you place an order, it will show up here with real-time status updates.
            </p>
            <Link
              href="/products"
              className={buttonVariants({ variant: 'gold', size: 'lg', className: 'mt-8' })}
            >
              Browse products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order: any) => (
              <Link
                key={order.orderNumber}
                href={`/account/orders/${order.orderNumber}`}
                className="group rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/30"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                      Order {order.orderNumber}
                    </p>
                    <p className="mt-2 text-lg font-medium text-white">
                      ৳{Number(order.total || 0).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      {formatDate(new Date(order.createdAt))} • {order.paymentMethod}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.24em] text-gray-200">
                      <Clock className="h-4 w-4 text-gold/80" />
                      {String(order.paymentStatus || 'pending')}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.24em] text-gray-200">
                      <Truck className="h-4 w-4 text-gold/80" />
                      {String(order.status || 'pending')}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors group-hover:text-gold-light">
                      View
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
