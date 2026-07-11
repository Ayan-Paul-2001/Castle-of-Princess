'use client'

import { useEffect, useState } from 'react'
import type { CmsPageSeed } from '@/lib/cms/default-pages'
import { defaultCmsPages } from '@/lib/cms/default-pages'

export function useCmsPage(key: CmsPageSeed['key']) {
  const [page, setPage] = useState<CmsPageSeed>(defaultCmsPages[key])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        setLoading(true)
        const response = await fetch(`/api/cms/${key}`, { cache: 'no-store' })
        if (!response.ok) return
        const json = (await response.json()) as CmsPageSeed
        if (ignore) return
        if (json?.sections?.length) {
          setPage(json)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [key])

  return { page, loading }
}

