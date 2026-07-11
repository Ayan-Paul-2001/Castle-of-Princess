'use client'

import { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Download, Search, Trash2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import { getAdminCustomers, saveAdminCustomer, type AdminCustomer } from '@/lib/products-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch customers')
        return res.json()
      })
      .then((data: AdminCustomer[]) => {
        const dbUsers = data.filter((c: any) => c.isDbUser)
        const localCustomers = getAdminCustomers()
        const dbEmails = new Set(dbUsers.map((c) => c.email.toLowerCase()))
        const uniqueLocalCustomers = localCustomers.filter((c) => !dbEmails.has(c.email.toLowerCase()))

        setCustomers([...dbUsers, ...uniqueLocalCustomers])
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setCustomers(getAdminCustomers())
        setIsLoading(false)
      })
  }, [])

  const handleStatusChange = async (customer: AdminCustomer, status: 'active' | 'vip' | 'inactive') => {
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customer.id, status }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      const updated = { ...customer, status }
      saveAdminCustomer(updated)

      setCustomers((current) =>
        current.map((item) =>
          item.id === customer.id ? updated : item
        )
      )
      toast.success(`Customer marked as ${status}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const handleDeleteCustomer = async (customer: AdminCustomer) => {
    const confirmMessage = `Are you absolutely sure you want to delete "${customer.name}"? This will permanently wipe out all their data, including their account, orders, and newsletter subscriptions across the entire system. This action cannot be undone.`
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/customers?id=${customer.id}&email=${customer.email}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete customer')
      }

      if (typeof window !== 'undefined') {
        // Remove from customers list in localStorage
        const storedCustomers = localStorage.getItem('cop_customers')
        if (storedCustomers) {
          try {
            const parsed = JSON.parse(storedCustomers) as AdminCustomer[]
            const filtered = parsed.filter((c) => c.id !== customer.id)
            localStorage.setItem('cop_customers', JSON.stringify(filtered))
          } catch (e) {
            console.error(e)
          }
        }

        // Wipe out orders matching this customer's email from localStorage
        const storedOrders = localStorage.getItem('cop_orders')
        if (storedOrders) {
          try {
            const parsed = JSON.parse(storedOrders)
            const filtered = parsed.filter((o: any) => o.email?.toLowerCase() !== customer.email.toLowerCase())
            localStorage.setItem('cop_orders', JSON.stringify(filtered))
          } catch (e) {
            console.error(e)
          }
        }
      }

      setCustomers((current) => current.filter((c) => c.id !== customer.id))
      toast.success('Customer and all related data deleted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer')
    }
  }

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return customers

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.contactNumber,
        customer.city,
        customer.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [customers, search])

  const exportPromotionContacts = () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers available to export')
      return
    }

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    const rows = filteredCustomers
      .map(
        (customer) => `
          <tr>
            <td>${escapeHtml(customer.name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td style="mso-number-format:'\\@';">${escapeHtml(customer.contactNumber)}</td>
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
                  <x:Name>Promotion Contacts</x:Name>
                  <x:WorksheetOptions><x:DisplayGridlines /></x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
        </head>
        <body>
          <table>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact Number</th>
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
    link.download = `customer-promotion-contacts-${fileDate}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Customer promotion file exported')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Customer Insight"
        title="Customers"
        description="Track loyal shoppers, spending patterns, and account activity levels."
      />

      <AdminPanel
        title="Customer Directory"
        description="Review spending, capture direct contact details, and export promotion-ready lists for your marketing team."
        action={
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers"
                className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-white outline-none transition-colors focus:border-gold"
              />
            </div>
            <Button variant="gold" onClick={exportPromotionContacts}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                <th className="pb-4 font-medium">Customer</th>
                <th className="pb-4 font-medium">Contact Number</th>
                <th className="pb-4 font-medium">Orders</th>
                <th className="pb-4 font-medium">Spent</th>
                <th className="pb-4 font-medium">City</th>
                <th className="pb-4 font-medium">Last Order</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                    <p className="mt-4 text-sm text-gray-500">Loading customer directory...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5">
                    <td className="py-4">
                      <p className="font-medium text-white">{customer.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{customer.email}</p>
                    </td>
                    <td className="py-4 text-gray-300">{customer.contactNumber}</td>
                    <td className="py-4 text-gray-300">{customer.orders}</td>
                    <td className="py-4 text-white">৳{customer.spent.toLocaleString()}</td>
                    <td className="py-4 text-gray-300">{customer.city}</td>
                    <td className="py-4 text-gray-400">{customer.lastOrder}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Select
                          value={customer.status}
                          onValueChange={(value) => {
                            const status = value as 'active' | 'vip' | 'inactive'
                            handleStatusChange(customer, status)
                          }}
                        >
                          <SelectTrigger 
                            className={cn(
                              "w-[125px]",
                              customer.status === 'vip' && "border-gold/50 text-gold shadow-[0_0_12px_rgba(212,175,55,0.15)]",
                              customer.status === 'inactive' && "opacity-60"
                            )}
                          >
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <span className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            </SelectItem>
                            <SelectItem value="vip">
                              <span className="flex items-center gap-2 font-medium text-gold">
                                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                                VIP
                              </span>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <span className="flex items-center gap-2 text-gray-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                                Inactive
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {customer.status === 'inactive' && (
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </>
  )
}
