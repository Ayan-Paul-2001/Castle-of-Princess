'use client'

import { useMemo, useState, useEffect } from 'react'
import { Search, DollarSign, Receipt } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { getAdminOrders, type AdminOrder } from '@/lib/products-store'

export default function AdminSalesPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch orders')
        return res.json()
      })
      .then((data) => {
        setOrders(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setOrders(getAdminOrders())
        setIsLoading(false)
      })
  }, [])

  // Filter only paid orders
  const paidOrders = useMemo(() => {
    return orders.filter((order) => order.paymentStatus === 'paid')
  }, [orders])

  // Filter based on search query (by Customer Name or Order ID)
  const filteredSales = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return paidOrders

    return paidOrders.filter((order) =>
      [order.id, order.customer].join(' ').toLowerCase().includes(query)
    )
  }, [paidOrders, search])

  // Total sales calculation of currently filtered/displayed sales
  const totalSales = useMemo(() => {
    return filteredSales.reduce((sum, order) => sum + order.amount, 0)
  }, [filteredSales])

  return (
    <>
      <AdminPageHeader
        eyebrow="Financials"
        title="Sales Ledger"
        description="Monitor finalized revenue, review settled invoices, and calculate total cash intake."
      />

      {/* Financial Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_40%)] bg-white/[0.02] p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <h3 className="mt-1 font-playfair text-3xl font-bold text-gradient-gold">
                ৳{totalSales.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Paid Settlements</p>
              <h3 className="mt-1 font-playfair text-3xl font-bold text-white">
                {filteredSales.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <AdminPanel
        title="Settled Sales Transactions"
        description="A list of all orders that have completed payment successfully."
        action={
          <div className="relative min-w-[260px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or order ID..."
              className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-white outline-none transition-colors focus:border-gold"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                <th className="pb-4 font-medium">Customer Name</th>
                <th className="pb-4 font-medium">Order ID</th>
                <th className="pb-4 font-medium">Order Date</th>
                <th className="pb-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                    <p className="mt-4 text-sm text-gray-500">Loading sales ledgers...</p>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No paid transactions found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 text-sm hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 text-white font-medium">{order.customer}</td>
                    <td className="py-4 text-gold font-medium font-mono">{order.id}</td>
                    <td className="py-4 text-gray-300">{order.date}</td>
                    <td className="py-4 text-white font-medium">৳{order.amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
            {!isLoading && filteredSales.length > 0 && (
              <tfoot>
                <tr className="bg-white/[0.02] border-t border-white/10">
                  <td colSpan={3} className="py-5 pl-4 text-left font-playfair text-lg font-bold text-gradient-gold">
                    Total Sales
                  </td>
                  <td className="py-5 text-left font-playfair text-lg font-bold text-gradient-gold">
                    ৳{totalSales.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </AdminPanel>
    </>
  )
}
