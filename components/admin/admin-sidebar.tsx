'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Sparkles,
  Image,
  Mail,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  FileText,
  PenLine,
  X,
  DollarSign,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/admin/campaigns', icon: Sparkles },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories & Brand', href: '/admin/categories', icon: Tag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Sales', href: '/admin/sales', icon: DollarSign },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Banners', href: '/admin/banners', icon: Image },
  { name: 'CMS', href: '/admin/cms', icon: FileText },
  { name: 'Blog', href: '/admin/blog', icon: PenLine },
  { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

type AdminSidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export default function AdminSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => onMobileOpenChange(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 lg:top-[136px] z-40 h-full lg:h-[calc(100vh-136px)] w-72 border-r border-white/10 glass-dark transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6">
            <Link
              href="/admin"
              className="flex items-center"
              onClick={() => onMobileOpenChange(false)}
            >
              <span className="font-playfair text-2xl font-bold text-gradient-gold lg:hidden">
                Castle Admin
              </span>
              <span className="hidden font-playfair text-2xl font-bold text-gradient-gold lg:inline">
                {collapsed ? 'CP' : 'Castle Admin'}
              </span>
            </Link>

            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => onMobileOpenChange(false)}
              className="rounded-full border border-white/10 bg-black/40 p-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-2 px-4 py-6">
          {adminNavigation.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === item.href
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onMobileOpenChange(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!collapsed || mobileOpen) && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-2 border-t border-white/10 p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black transition-colors hover:bg-white/10 lg:flex"
        >
          <ChevronLeft
            className={`w-4 h-4 text-gray-400 transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
      </aside>
    </>
  )
}
