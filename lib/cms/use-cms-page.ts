'use client'

import { useEffect, useState } from 'react'
import type { CmsPageSeed } from '@/lib/cms/default-pages'
import { defaultCmsPages } from '@/lib/cms/default-pages'

export function useCmsPage(key: CmsPageSeed['key']) {
  const [page, setPage] = useState<CmsPageSeed>(defaultCmsPages[key])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const response = await fetch(`/api/cms/${key}`)
        if (!response.ok) return
        const json = (await response.json()) as CmsPageSeed
        if (ignore) return
        if (json?.sections?.length) {
          // Only update state if content actually changed to prevent DOM re-render & LCP reset
          if (JSON.stringify(json.sections) !== JSON.stringify(page.sections)) {
            setPage(json)
          }
        }
      } catch (e) {
        // Ignore fetch errors
      }
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => load(), { timeout: 2000 })
      return () => {
        ignore = true
        if ('cancelIdleCallback' in window) {
          ;(window as any).cancelIdleCallback(handle)
        }
      }
    } else {
      const timer = setTimeout(load, 300)
      return () => {
        ignore = true
        clearTimeout(timer)
      }
    }
  }, [key, page.sections])

  return { page, loading }
}

