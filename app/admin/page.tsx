'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  X,
  AlertTriangle,
  Search,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import StatsCard from '@/components/admin/stats-card'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import {
  getAdminProducts,
  getAdminOrders,
  getAdminCustomers,
  type AdminProduct,
  type AdminOrder,
  type AdminCustomer,
} from '@/lib/products-store'

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }
  return styles[status] || styles.pending
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gold/30 bg-black/90 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs text-gray-400">{payload[0].payload.label}</p>
        <p className="mt-1 text-sm font-bold text-gold">
          ৳{payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly')
  const [showTopProductsModal, setShowTopProductsModal] = useState(false)
  const [showLowStockModal, setShowLowStockModal] = useState(false)
  const [topProductSearch, setTopProductSearch] = useState('')
  const [lowStockSearch, setLowStockSearch] = useState('')

  useEffect(() => {
    setProducts(getAdminProducts())
    setOrders(getAdminOrders())
    setCustomers(getAdminCustomers())
    setIsLoaded(true)
  }, [])

  // Revenue chart data
  const chartData = useMemo(() => {
    if (orders.length === 0) return []
    const active = orders.filter((o) => o.paymentStatus === 'paid')

    // Find latest date in active orders, or default to today
    const maxDateStr = active.reduce((max, o) => (o.date > max ? o.date : max), new Date().toISOString().split('T')[0])
    const maxDate = new Date(maxDateStr)

    if (revenueFilter === 'daily') {
      const daily = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(maxDate)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const revenue = active.filter((o) => o.date === dateStr).reduce((sum, o) => sum + o.amount, 0)
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        daily.push({ label, revenue })
      }
      return daily
    }

    if (revenueFilter === 'yearly') {
      const yearly = []
      const currentYear = maxDate.getFullYear()
      for (let i = 2; i >= 0; i--) {
        const year = currentYear - i
        const revenue = active
          .filter((o) => new Date(o.date).getFullYear() === year)
          .reduce((sum, o) => sum + o.amount, 0)
        yearly.push({ label: `${year}`, revenue })
      }
      return yearly
    }

    // Default: monthly (current year)
    const currentYear = maxDate.getFullYear()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, index) => {
      const revenue = active
        .filter((o) => {
          const oDate = new Date(o.date)
          return oDate.getFullYear() === currentYear && oDate.getMonth() === index
        })
        .reduce((sum, o) => sum + o.amount, 0)
      return { label: `${month} ${currentYear}`, revenue }
    })
  }, [orders, revenueFilter])

  // Calculate dynamic stats
  const periodsData = useMemo(() => {
    const active = orders.filter((o) => o.paymentStatus === 'paid')
    if (active.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        conversionRate: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        conversionRateChange: 0,
      }
    }

    // Find latest date in active orders, or default to today
    const maxDateStr = active.reduce((max, o) => (o.date > max ? o.date : max), new Date().toISOString().split('T')[0])
    const maxDate = new Date(maxDateStr)

    let currentOrders: typeof active = []
    let previousOrders: typeof active = []

    if (revenueFilter === 'daily') {
      const currentStart = new Date(maxDate)
      currentStart.setDate(currentStart.getDate() - 6)
      const currentStartStr = currentStart.toISOString().split('T')[0]
      const currentEndStr = maxDateStr

      const prevStart = new Date(currentStart)
      prevStart.setDate(prevStart.getDate() - 7)
      const prevStartStr = prevStart.toISOString().split('T')[0]
      const prevEnd = new Date(currentStart)
      prevEnd.setDate(prevEnd.getDate() - 1)
      const prevEndStr = prevEnd.toISOString().split('T')[0]

      currentOrders = active.filter((o) => o.date >= currentStartStr && o.date <= currentEndStr)
      previousOrders = active.filter((o) => o.date >= prevStartStr && o.date <= prevEndStr)
    } else if (revenueFilter === 'yearly') {
      const currentYear = maxDate.getFullYear()
      currentOrders = active.filter((o) => {
        const oYear = new Date(o.date).getFullYear()
        return oYear >= currentYear - 2 && oYear <= currentYear
      })
      previousOrders = active.filter((o) => {
        const oYear = new Date(o.date).getFullYear()
        return oYear >= currentYear - 5 && oYear <= currentYear - 3
      })
    } else {
      // Default: monthly (current year vs previous year)
      const currentYear = maxDate.getFullYear()
      currentOrders = active.filter((o) => new Date(o.date).getFullYear() === currentYear)
      previousOrders = active.filter((o) => new Date(o.date).getFullYear() === currentYear - 1)
    }

    // Calculate metric values
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = currentOrders.length
    const totalCustomers = new Set(currentOrders.map((o) => o.email)).size

    const prevRevenue = previousOrders.reduce((sum, o) => sum + o.amount, 0)
    const prevOrders = previousOrders.length
    const prevCustomers = new Set(previousOrders.map((o) => o.email)).size

    // Dynamic conversion rate calculation
    // Mocking traffic based on customer/order counts so we get realistic ratios
    const currentVisits = totalCustomers * 20 + totalOrders * 5 + 50
    const prevVisits = prevCustomers * 20 + prevOrders * 5 + 50
    
    const conversionRate = currentVisits === 0 ? 0 : Math.round((totalOrders / currentVisits) * 1000) / 10
    const prevConversionRate = prevVisits === 0 ? 0 : Math.round((prevOrders / prevVisits) * 1000) / 10

    // Helper for percentage change calculation
    const calcChange = (currentValue: number, previousValue: number) => {
      if (previousValue === 0) {
        return currentValue > 0 ? 100 : 0
      }
      return Math.round(((currentValue - previousValue) / previousValue) * 1000) / 10
    }

    const revenueChange = calcChange(totalRevenue, prevRevenue)
    const ordersChange = calcChange(totalOrders, prevOrders)
    const customersChange = calcChange(totalCustomers, prevCustomers)
    const conversionRateChange = calcChange(conversionRate, prevConversionRate)

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      conversionRate,
      revenueChange,
      ordersChange,
      customersChange,
      conversionRateChange,
    }
  }, [orders, revenueFilter, chartData])

  const dynamicMetrics = useMemo(() => {
    return [
      { title: 'Total Revenue', value: periodsData.totalRevenue, change: periodsData.revenueChange, format: 'currency' as const },
      { title: 'Total Orders', value: periodsData.totalOrders, change: periodsData.ordersChange },
      { title: 'Total Customers', value: periodsData.totalCustomers, change: periodsData.customersChange },
      { title: 'Conversion Rate', value: periodsData.conversionRate, change: periodsData.conversionRateChange, format: 'percentage' as const },
    ]
  }, [periodsData])

  // Filter top products
  const sortedTopProducts = useMemo(() => {
    return [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
  }, [products])

  const topProductsToShow = useMemo(() => {
    return sortedTopProducts.slice(0, 10)
  }, [sortedTopProducts])

  // Low stock products (quantity <= 10)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= 10)
  }, [products])

  const lowStockToShow = useMemo(() => {
    return lowStockProducts.slice(0, 5)
  }, [lowStockProducts])

  // Recent orders
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [orders])

  // Revenue chart data is defined above to allow dynamic stats synchronization

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin Overview"
        title="Dashboard"
        description="Monitor revenue, orders, inventory, and customer activity across your beauty storefront."
        action={
          <Link
            href="/admin/orders"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition-colors hover:border-gold/30 hover:text-gold"
          >
            View Orders
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dynamicMetrics.map((stat, index) => {
          const iconMap = [DollarSign, ShoppingBag, Users, TrendingUp]
          const Icon = iconMap[index]

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <StatsCard
                {...stat}
                icon={<Icon className="w-6 h-6" />}
              />
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminPanel
          title="Revenue Overview"
          description="Visual analysis of store sales income by day, month, or year."
          action={
            <div className="flex rounded-full border border-white/10 bg-black/40 p-1">
              {(['daily', 'monthly', 'yearly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setRevenueFilter(type)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                    revenueFilter === type
                      ? 'bg-gold text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          }
        >
          <div className="relative h-[300px] w-full mt-4 min-w-0 overflow-hidden">
            {isLoaded ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis
                    dataKey="label"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `৳${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                Loading analytics data...
              </div>
            )}
          </div>
        </AdminPanel>

        <AdminPanel
          title="Top Products"
          description="Best performing products by order volume."
          action={
            <button
              onClick={() => setShowTopProductsModal(true)}
              className="text-sm text-gold hover:underline bg-transparent border-none cursor-pointer"
            >
              View all
            </button>
          }
        >
          <div className="space-y-4">
            {topProductsToShow.map((product, i) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 font-bold text-gold">
                    {i + 1}
                  </span>
                  <span className="text-white font-medium">{product.name}</span>
                </div>
                <span className="font-semibold text-gold">{product.soldCount || 0} sold</span>
              </div>
            ))}
            {topProductsToShow.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">No sales data available yet.</p>
            )}
          </div>
        </AdminPanel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <AdminPanel
          title="Recent Orders"
          description="Latest customer orders that need attention from the operations team."
          action={
            <Link href="/admin/orders" className="text-sm text-gold hover:underline">
              View all
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-400">
                  <th className="pb-4 font-medium">Order ID</th>
                  <th className="pb-4 font-medium">Customer</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5">
                    <td className="py-4 font-medium text-gold">{order.id}</td>
                    <td className="py-4 text-white">{order.customer}</td>
                    <td className="py-4 text-gray-400">{order.date}</td>
                    <td className="py-4 text-white">৳{order.amount.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-gold hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Low Stock Alert"
          description="Products that need restock planning soon."
          action={
            <button
              onClick={() => setShowLowStockModal(true)}
              className="text-sm text-gold hover:underline bg-transparent border-none cursor-pointer"
            >
              View all
            </button>
          }
        >
          <div className="space-y-4">
            {lowStockToShow.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <span className="text-white font-medium">{item.name}</span>
                <span className="font-bold text-red-400">{item.stock} left</span>
              </div>
            ))}
            {lowStockToShow.length === 0 && (
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 text-center">
                <p className="text-sm text-emerald-400 font-medium">All products are well stocked!</p>
              </div>
            )}
          </div>
        </AdminPanel>
      </div>

      {/* Top Products Modal */}
      <AnimatePresence>
        {showTopProductsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-white/10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white">All Products by Sales Volume</h3>
                <button
                  onClick={() => setShowTopProductsModal(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={topProductSearch}
                  onChange={(e) => setTopProductSearch(e.target.value)}
                  className="w-full rounded-full border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-white outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-thin">
                {sortedTopProducts
                  .filter((p) => p.name.toLowerCase().includes(topProductSearch.toLowerCase()))
                  .map((product, i) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-full bg-gold/10 font-bold text-gold text-sm">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category} • {product.brand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gold">{product.soldCount || 0} sold</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Low Stock Modal */}
      <AnimatePresence>
        {showLowStockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-white/10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h3 className="text-xl font-bold text-white">Low Stock Inventory Alert</h3>
                </div>
                <button
                  onClick={() => setShowLowStockModal(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search low stock products..."
                  value={lowStockSearch}
                  onChange={(e) => setLowStockSearch(e.target.value)}
                  className="w-full rounded-full border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 text-white outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-thin">
                {lowStockProducts
                  .filter((p) => p.name.toLowerCase().includes(lowStockSearch.toLowerCase()))
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-500/[0.02]"
                    >
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category} • {product.brand}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full text-sm">
                          {product.stock} left
                        </span>
                        <Link
                          href={`/admin/products`}
                          onClick={() => setShowLowStockModal(false)}
                          className="text-xs text-gold hover:underline bg-gold/10 px-3 py-1 rounded-full transition-all"
                        >
                          Restock
                        </Link>
                      </div>
                    </div>
                  ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">No low stock items found.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
