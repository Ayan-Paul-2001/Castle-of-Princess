'use client'

import AdminSidebar from '@/components/admin/admin-sidebar'
import { Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login?callbackUrl=/admin')
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.replace('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-gold tracking-[0.2em] uppercase text-sm">Verifying access...</span>
      </div>
    )
  }

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setMobileOpen(true)}
              className="glass flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:border-gold/40 hover:text-gold"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-cormorant text-sm uppercase tracking-[0.32em] text-gold/70">
              Admin
            </span>
            <div className="h-11 w-11" />
          </div>
        </div>

        <main className="min-h-screen px-4 py-5 sm:px-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
