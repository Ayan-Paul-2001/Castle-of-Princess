'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Search, ChevronDown, Check, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { type AdminOrderStatus } from '@/lib/admin-data'
import { getAdminOrders, saveAdminOrder, type AdminOrder } from '@/lib/products-store'

const orderStatuses: AdminOrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'] as const
type PaymentStatus = typeof paymentStatuses[number]

const getStatusClasses = (status: AdminOrderStatus) => {
  const styles: Record<AdminOrderStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  return styles[status]
}

const getPaymentStatusClasses = (status: PaymentStatus) => {
  const styles: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    paid: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    refunded: 'bg-gray-500/20 text-gray-400',
  }

  return styles[status] || 'bg-gray-500/20 text-gray-400'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | AdminOrderStatus>('all')
  const [activeFulfillmentDropdownId, setActiveFulfillmentDropdownId] = useState<string | null>(null)
  const [activePaymentDropdownId, setActivePaymentDropdownId] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setOrders(data))
      .catch(() => setOrders(getAdminOrders()))
  }, [])

  useEffect(() => {
    const handleClose = () => {
      setActiveFulfillmentDropdownId(null)
      setActivePaymentDropdownId(null)
      setIsFilterOpen(false)
    }
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [])

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim()

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        [order.id, order.customer, order.email, order.city, order.transactionId || ''].join(' ').toLowerCase().includes(query)
      const matchesFilter = filter === 'all' || order.status === filter
      return matchesSearch && matchesFilter
    })
  }, [filter, orders, search])

  const exportOrders = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders available to export')
      return
    }

    const escapeHtml = (value: string | number) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    const rows = filteredOrders
      .map(
        (order) => `
          <tr>
            <td>${escapeHtml(order.id)}</td>
            <td>${escapeHtml(order.date)}</td>
            <td>${escapeHtml(order.customer)}</td>
            <td>${escapeHtml(order.email)}</td>
            <td>${escapeHtml(order.transactionId || 'N/A')}</td>
            <td>${escapeHtml(order.items)}</td>
            <td>${escapeHtml(order.amount)}</td>
            <td style="text-transform: uppercase;">${escapeHtml(order.paymentStatus)}</td>
            <td style="text-transform: capitalize;">${escapeHtml(order.status)}</td>
            <td>${escapeHtml(order.city)}</td>
          </tr>
        `
      )
      .join('')

    const workbook = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8" />
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Filtered Orders</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines /></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
        </head>
        <body>
          <table>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Transaction ID</th>
              <th>Items</th>
              <th>Amount (BDT)</th>
              <th>Payment Status</th>
              <th>Fulfillment Status</th>
              <th>City</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `

    const blob = new Blob([workbook], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileDate = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `orders-export-${fileDate}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Orders list exported successfully')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Sales Operations"
        title="Orders"
        description="Track payment state, update fulfillment status, and open detailed order views."
      />

      <AdminPanel
        title="Order Queue"
        description="Filter orders and update status directly from the admin list."
        action={
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders"
                className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-white outline-none transition-colors focus:border-gold"
              />
            </div>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen)
                  setActiveFulfillmentDropdownId(null)
                  setActivePaymentDropdownId(null)
                }}
                className="flex min-w-[170px] items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white outline-none hover:border-gold/30 transition-colors"
              >
                <span className="capitalize">
                  {filter === 'all' ? 'All Statuses' : filter}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 z-30 w-48 rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-md">
                  <button
                    onClick={() => {
                      setFilter('all')
                      setIsFilterOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                      filter === 'all' ? 'text-gold font-medium' : 'text-gray-300'
                    }`}
                  >
                    <span>All Statuses</span>
                    {filter === 'all' && <Check className="h-4 w-4 text-gold" />}
                  </button>
                  {orderStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilter(status)
                        setIsFilterOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                        filter === status ? 'text-gold font-medium' : 'text-gray-300'
                      }`}
                    >
                      <span className="capitalize">{status}</span>
                      {filter === status && <Check className="h-4 w-4 text-gold" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="gold" onClick={exportOrders}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                <th className="pb-4 font-medium">Order</th>
                <th className="pb-4 font-medium">Customer</th>
                <th className="pb-4 font-medium">Transaction ID</th>
                <th className="pb-4 font-medium">Items</th>
                <th className="pb-4 font-medium">Amount</th>
                <th className="pb-4 font-medium">Payment</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gold">{order.id}</p>
                      {(order.email?.includes('guest') || order.customer?.includes('Guest') || (order as any).user === 'guest') && (
                        <span className="bg-amber-500/20 text-amber-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{order.date}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-white">{order.customer}</p>
                    <p className="mt-1 text-sm text-gray-500">{order.email}</p>
                  </td>
                  <td className="py-4">
                    {order.transactionId ? (
                      <div>
                        <p className="font-mono text-xs text-white bg-white/5 border border-white/10 rounded px-2 py-0.5 inline-block">
                          {order.transactionId}
                        </p>
                        {order.paymentMethod && (
                          <p className="mt-1 text-xs text-gray-400 font-medium">
                            {order.paymentMethod} {order.walletPhone ? `(${order.walletPhone})` : ''}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-4 text-gray-300">{order.items}</td>
                  <td className="py-4 text-white">৳{order.amount.toLocaleString()}</td>
                  <td className="py-4">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setActivePaymentDropdownId(activePaymentDropdownId === order.id ? null : order.id)
                          setActiveFulfillmentDropdownId(null)
                          setIsFilterOpen(false)
                        }}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all border border-white/5 hover:border-gold/30 outline-none capitalize ${getPaymentStatusClasses(order.paymentStatus as any)}`}
                      >
                        <span>{order.paymentStatus}</span>
                        <ChevronDown className="h-4 w-4 opacity-75" />
                      </button>
                      
                      {activePaymentDropdownId === order.id && (
                        <div className="absolute left-0 mt-2 z-30 w-40 rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-md">
                          {paymentStatuses.map((pStatus) => (
                            <button
                              key={pStatus}
                              onClick={async () => {
                                const updated = { ...order, paymentStatus: pStatus }
                                saveAdminOrder(updated)
                                setOrders((current) =>
                                  current.map((item) =>
                                    item.id === order.id ? updated : item
                                  )
                                )
                                setActivePaymentDropdownId(null)
                                
                                try {
                                  const res = await fetch('/api/admin/orders', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: order.id, paymentStatus: pStatus }),
                                  })
                                  if (!res.ok) {
                                    toast.error('Failed to update payment status in database')
                                  } else {
                                    toast.success(`Order ${order.id} payment updated to ${pStatus}`)
                                  }
                                } catch (e) {
                                  toast.error('Failed to update payment status in database')
                                }
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                                order.paymentStatus === pStatus ? 'text-gold font-medium' : 'text-gray-300'
                              }`}
                            >
                              <span className="capitalize">{pStatus}</span>
                              {order.paymentStatus === pStatus && <Check className="h-4 w-4 text-gold" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setActiveFulfillmentDropdownId(activeFulfillmentDropdownId === order.id ? null : order.id)
                          setActivePaymentDropdownId(null)
                          setIsFilterOpen(false)
                        }}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all border border-white/5 hover:border-gold/30 outline-none capitalize ${getStatusClasses(order.status)}`}
                      >
                        <span>{order.status}</span>
                        <ChevronDown className="h-4 w-4 opacity-75" />
                      </button>
                      
                      {activeFulfillmentDropdownId === order.id && (
                        <div className="absolute left-0 mt-2 z-30 w-40 rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-md">
                          {orderStatuses.map((status) => (
                            <button
                              key={status}
                              onClick={async () => {
                                const updated = { ...order, status }
                                saveAdminOrder(updated)
                                setOrders((current) =>
                                  current.map((item) =>
                                    item.id === order.id ? updated : item
                                  )
                                )
                                setActiveFulfillmentDropdownId(null)
                                
                                try {
                                  const res = await fetch('/api/admin/orders', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: order.id, status }),
                                  })
                                  if (!res.ok) {
                                    toast.error('Failed to update status in database')
                                  } else {
                                    toast.success(`Order ${order.id} updated to ${status}`)
                                  }
                                } catch (e) {
                                  toast.error('Failed to update status in database')
                                }
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                                order.status === status ? 'text-gold font-medium' : 'text-gray-300'
                              }`}
                            >
                              <span className="capitalize">{status}</span>
                              {order.status === status && <Check className="h-4 w-4 text-gold" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm text-gold hover:underline">
                      View order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </>
  )
}
