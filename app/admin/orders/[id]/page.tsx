'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { getAdminOrders, type AdminOrder } from '@/lib/products-store'

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((orders: AdminOrder[]) => {
        const found = orders.find((item) => item.id === id)
        setOrder(found || null)
      })
      .catch(() => {
        const orders = getAdminOrders()
        const found = orders.find((item) => item.id === id)
        setOrder(found || null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        <p className="text-lg">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    notFound()
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Order Detail"
        title={order.id}
        description={`Review customer info, payment state, and shipping context for ${order.customer}.`}
        action={
          <Link
            href="/admin/orders"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition-colors hover:border-gold/30 hover:text-gold"
          >
            Back to Orders
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminPanel title="Order Summary">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-500">Customer</p>
              <p className="mt-2 text-white">{order.customer}</p>
              <p className="mt-1 text-sm text-gray-400">{order.email}</p>
              <p className="mt-2 text-xs text-gray-500">Placed on: {order.date}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="mt-2 text-white">৳{order.amount.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-500">Items</p>
              <p className="mt-2 text-white">{order.items}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="mt-2 text-white">{order.paymentMethod || 'Cash on Delivery'}</p>
            </div>
            {order.transactionId && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
                <p className="text-sm text-gray-500 font-medium text-gold mb-2">Transaction Details</p>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-300">
                    Transaction ID: <span className="font-mono text-xs text-white bg-white/5 border border-white/10 rounded px-2 py-0.5 inline-block">{order.transactionId}</span>
                  </p>
                  {order.walletPhone && (
                    <p className="text-sm text-gray-300">
                      Wallet Phone: <span className="text-white font-medium">{order.walletPhone}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
            {order.shippingAddress && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
                <p className="text-sm text-gray-500 font-medium text-gold mb-2">Shipping Address</p>
                <div className="space-y-1">
                  <p className="text-sm text-white font-semibold">{order.shippingAddress.name}</p>
                  <p className="text-xs text-gray-400">{order.shippingAddress.phone}</p>
                  <p className="text-xs text-gray-300 mt-2">{order.shippingAddress.address}</p>
                  <p className="text-xs text-gray-300">
                    {order.shippingAddress.city} - {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Fulfillment State">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-500">Order Status</p>
              <p className="mt-2 text-white capitalize">{order.status}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="mt-2 text-white capitalize">{order.paymentStatus}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-gray-500">Suggested Next Step</p>
              <p className="mt-2 text-gray-300">
                {order.status === 'pending'
                  ? 'Confirm payment and prepare picking workflow.'
                  : order.status === 'processing'
                    ? 'Finalize packing and assign courier tracking.'
                    : order.status === 'shipped'
                      ? 'Monitor delivery progress and customer notifications.'
                      : 'Archive the order and gather review follow-up.'}
              </p>
            </div>
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
