import { syncToDb } from '@/lib/utils/sync'

export interface VisibilityFlag {
  id: string
  name: string
  description?: string
  color?: string
  isSystem?: boolean
}

export const defaultVisibilityFlags: VisibilityFlag[] = [
  { id: 'featured', name: 'Featured product', description: 'Highlight this product in premium featured sections.', isSystem: true },
  { id: 'trending', name: 'Trending badge', description: 'Show trending status in discovery and cards.', isSystem: true },
  { id: 'onSale', name: 'Sale badge', description: 'Display automatic sale treatment on product cards.', isSystem: true },
  { id: 'radiance-ritual', name: 'Radiance Ritual', description: 'Silky textures and soft glow' },
  { id: 'k-beauty-mood', name: 'K-Beauty Mood', description: 'Modern feminine beauty' },
  { id: 'premium-care', name: 'Premium Care', description: 'Hydration, calm, and glow' },
  { id: 'glossy-shelf', name: 'Glossy Shelf', description: 'Luxury skincare display' },
  { id: 'beauty-ritual', name: 'Beauty Ritual', description: 'Editorial-inspired luxury frame' },
  { id: 'silk-glow', name: 'Silk Glow', description: 'Soft gold ambience' },
  { id: 'night-ritual', name: 'Night Ritual', description: 'Cinematic skincare mood' },
  { id: 'gloss-finish', name: 'Gloss Finish', description: 'Luminous textures' },
]

const STORAGE_KEY = 'cop_visibility_flags'

export function getVisibilityFlags(): VisibilityFlag[] {
  if (typeof window === 'undefined') return defaultVisibilityFlags
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisibilityFlags))
    return defaultVisibilityFlags
  }
  try {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch (e) {
    console.error('Error parsing visibility flags:', e)
  }
  return defaultVisibilityFlags
}

export function saveVisibilityFlags(flags: VisibilityFlag[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
    window.dispatchEvent(new Event('cop:visibilityFlagsUpdated'))
    syncToDb('visibility_flags', flags)
  }
}

export function addVisibilityFlag(name: string, description?: string): VisibilityFlag[] {
  const current = getVisibilityFlags()
  const cleanName = name.trim()
  if (!cleanName) return current
  const exists = current.some((f) => f.name.toLowerCase() === cleanName.toLowerCase())
  if (exists) return current

  const newFlag: VisibilityFlag = {
    id: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: cleanName,
    description: description?.trim() || '',
  }
  const updated = [...current, newFlag]
  saveVisibilityFlags(updated)
  return updated
}

export function updateVisibilityFlag(id: string, name: string, description?: string): VisibilityFlag[] {
  const current = getVisibilityFlags()
  const cleanName = name.trim()
  if (!cleanName) return current
  const updated = current.map((flag) => {
    if (flag.id === id) {
      return { ...flag, name: cleanName, description: description?.trim() || '' }
    }
    return flag
  })
  saveVisibilityFlags(updated)
  return updated
}

export function deleteVisibilityFlag(id: string): VisibilityFlag[] {
  const current = getVisibilityFlags()
  const updated = current.filter((flag) => flag.id !== id)
  saveVisibilityFlags(updated)
  return updated
}
