'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'

const cmsPages = [
  {
    key: 'home',
    title: 'Home Page',
    description: 'Edit hero, categories, sections order, and all homepage content.',
  },
  {
    key: 'brands',
    title: 'Brands Page',
    description: 'Edit brand hero, promises, and the featured brand library grid.',
  },
  {
    key: 'about',
    title: 'About Page',
    description: 'Edit the story hero, mission blocks, pillars, and final CTA.',
  },
]

export default function AdminCmsIndexPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="CMS"
        title="Site Content Manager"
        description="WordPress-style editing for page text, images, and section order. Changes reflect on the storefront."
      />

      <AdminPanel title="Pages" description="Choose a page to edit and publish changes.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {cmsPages.map((page, index) => (
            <motion.div
              key={page.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                  <FileText className="h-5 w-5" />
                </div>
                <Link
                  href={`/admin/cms/${page.key}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:border-gold/30 hover:text-gold"
                >
                  Edit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <h2 className="mt-6 font-playfair text-2xl text-white">{page.title}</h2>
              <p className="mt-3 text-sm text-gray-400">{page.description}</p>
            </motion.div>
          ))}
        </div>
      </AdminPanel>
    </div>
  )
}

