import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowRight, Package, Truck, CreditCard } from 'lucide-react'
import { auth } from '@/lib/auth/config'
import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/db/models/order'
import { buttonVariants } from '@/components/ui/button'
import { getAdminProducts } from '@/lib/products-store'

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=%2Faccount%2Forders')
  }

  const { orderNumber } = await params

  await connectDB()

  const order = await Order.findOne({
    orderNumber,
    user: session.user.id,
  })
    .select('orderNumber products subtotal shippingCost total status paymentStatus paymentMethod createdAt notes shippingAddress')
    .lean()

  const allProducts = getAdminProducts()
  const productMap = new Map(allProducts.map((p) => [p.id, p]))

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen px-4 py-16 silk-overlay">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-gold font-cormorant text-lg uppercase tracking-[0.32em]">
              Order Details
            </span>
            <h1 className="mt-4 font-playfair text-5xl font-bold text-gradient-gold md:text-6xl">
              {order.orderNumber}
            </h1>
            <p className="mt-4 text-gray-400">{formatDate(new Date(order.createdAt))}</p>
          </div>
          <Link href="/account/orders" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Back to orders
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-3xl text-white">Items</h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.24em] text-gray-200">
                <Package className="h-4 w-4 text-gold/80" />
                {order.products.length} items
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {order.products.map((item: any) => {
                const prodDetail = productMap.get(item.product)
                const slug = prodDetail?.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                return (
                  <div
                    key={`${item.product}-${item.name}-${item.variant || ''}`}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{item.name}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.26em] text-gray-500">
                          Qty {item.quantity}
                          {item.variant ? ` • ${item.variant}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <p className="text-sm font-semibold text-gold">
                        ৳{Number(item.price * item.quantity).toLocaleString()}
                      </p>
                      <Link
                        href={`/products/${slug}`}
                        className="inline-flex items-center justify-center rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:bg-gold/10 hover:border-gold/40 transition-all"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]">
              <div className="rounded-[calc(2rem-1px)] bg-black/75 p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Status</p>
                <div className="mt-5 grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
                    <span className="text-sm text-gray-300">Order</span>
                    <span className="text-sm font-medium text-white capitalize">
                      {String(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
                    <span className="text-sm text-gray-300">Payment</span>
                    <span className="text-sm font-medium text-white capitalize">
                      {String(order.paymentStatus)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-5 py-4">
                    <span className="text-sm text-gray-300">Method</span>
                    <span className="text-sm font-medium text-white">{String(order.paymentMethod)}</span>
                  </div>
                  {order.shippingAddress && (
                    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 mt-1">
                      <span className="text-sm text-gray-300">Shipping Address</span>
                      <div className="text-sm text-white">
                        <p className="font-semibold">{(order.shippingAddress as any).name}</p>
                        <p className="text-xs text-gray-400 mt-1">{(order.shippingAddress as any).phone}</p>
                        <p className="text-xs text-gray-300 mt-2">{(order.shippingAddress as any).address}</p>
                        <p className="text-xs text-gray-300">
                          {(order.shippingAddress as any).city} - {(order.shippingAddress as any).postalCode}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Total</p>
              <div className="mt-6 space-y-3 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">৳{Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">৳{Number(order.shippingCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-4 text-base font-semibold">
                  <span className="text-white">Grand total</span>
                  <span className="text-gold">৳{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {order.notes ? (
              <div className="rounded-[2rem] border border-gold/20 bg-gold/10 p-8">
                <div className="flex items-center gap-2 text-gold">
                  <CreditCard className="h-5 w-5" />
                  <p className="text-xs uppercase tracking-[0.3em]">Payment note</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-200">{String(order.notes)}</p>
              </div>
            ) : null}

            <Link
              href="/contact"
              className={buttonVariants({ variant: 'gold', size: 'lg', className: 'w-full' })}
            >
              Need help? Contact us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

