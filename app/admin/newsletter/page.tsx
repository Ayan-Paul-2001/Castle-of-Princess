'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'
import { adminSubscribers } from '@/lib/admin-data'

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState(adminSubscribers)
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all')

  const filteredSubscribers = useMemo(() => {
    if (statusFilter === 'all') return subscribers
    return subscribers.filter((subscriber) => subscriber.status === statusFilter)
  }, [statusFilter, subscribers])

  const handleExport = async () => {
    const content = filteredSubscribers.map((item) => item.email).join(', ')
    await navigator.clipboard.writeText(content)
    toast.success('Subscriber list copied')
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Lifecycle Marketing"
        title="Newsletter"
        description="Review subscriber growth, manage subscription state, and export contacts for campaigns."
        action={
          <Button variant="gold" onClick={handleExport}>
            Export Emails
          </Button>
        }
      />

      <AdminPanel
        title="Subscriber Directory"
        description="Filter subscribers and manage whether a contact remains active."
        action={
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'subscribed' | 'unsubscribed')
            }
            className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-gold"
          >
            <option value="all">All statuses</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        }
      >
        <div className="space-y-4">
          {filteredSubscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-white">{subscriber.email}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {subscriber.source} • Joined {subscriber.subscribedAt}
                </p>
              </div>

              <button
                onClick={() => {
                  setSubscribers((current) =>
                    current.map((item) =>
                      item.id === subscriber.id
                        ? {
                            ...item,
                            status:
                              item.status === 'subscribed'
                                ? 'unsubscribed'
                                : 'subscribed',
                          }
                        : item
                    )
                  )
                  toast.success('Subscriber status updated')
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  subscriber.status === 'subscribed'
                    ? 'bg-gold/15 text-gold'
                    : 'border border-white/10 bg-white/[0.04] text-gray-300'
                }`}
              >
                {subscriber.status}
              </button>
            </div>
          ))}
        </div>
      </AdminPanel>
    </>
  )
}
