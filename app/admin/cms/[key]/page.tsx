'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'

type CmsSectionDraft = {
  id: string
  type: string
  enabled: boolean
  data: any
}

type CmsPageDraft = {
  key: 'home' | 'brands' | 'about'
  title: string
  sections: CmsSectionDraft[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const parseJsonSafe = (value: string) => {
  try {
    return JSON.parse(value || '{}')
  } catch {
    return null
  }
}

const ensureArray = <T,>(value: unknown, fallback: T[] = []): T[] => {
  if (!Array.isArray(value)) return fallback
  return value as T[]
}

const splitCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export default function AdminCmsEditorPage({
  params,
}: {
  params: Promise<{ key: 'home' | 'brands' | 'about' }>
}) {
  const [pageKey, setPageKey] = useState<'home' | 'brands' | 'about'>('home')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState<CmsPageDraft | null>(null)
  const [dataText, setDataText] = useState<Record<string, string>>({})
  const [newSectionType, setNewSectionType] = useState('')
  const [lastUploadUrl, setLastUploadUrl] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingImageApplyRef = useRef<((url: string) => void) | null>(null)

  const title = useMemo(() => {
    if (pageKey === 'home') return 'Home Page CMS'
    if (pageKey === 'brands') return 'Brands Page CMS'
    return 'About Page CMS'
  }, [pageKey])

  useEffect(() => {
    let ignore = false
    params.then((resolved) => {
      if (ignore) return
      setPageKey(resolved.key)
    })
    return () => {
      ignore = true
    }
  }, [params])

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/cms/${pageKey}`, {
          cache: 'no-store',
        })
        if (!response.ok) {
          throw new Error('Failed to load CMS page')
        }
        const json = (await response.json()) as CmsPageDraft
        if (ignore) return
        setPage(json)
        setDataText(
          (json.sections ?? []).reduce((accumulator, section) => {
            accumulator[section.id] = JSON.stringify(section.data ?? {}, null, 2)
            return accumulator
          }, {} as Record<string, string>)
        )
      } catch (error) {
        toast.error('Failed to load CMS content')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [pageKey])

  const moveSection = (id: string, direction: 'up' | 'down') => {
    setPage((current) => {
      if (!current) return current
      const index = current.sections.findIndex((section) => section.id === id)
      if (index < 0) return current
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= current.sections.length) return current
      const nextSections = [...current.sections]
      const [removed] = nextSections.splice(index, 1)
      nextSections.splice(nextIndex, 0, removed)
      return { ...current, sections: nextSections }
    })
  }

  const removeSection = (id: string) => {
    setPage((current) => {
      if (!current) return current
      return { ...current, sections: current.sections.filter((section) => section.id !== id) }
    })
    setDataText((current) => {
      const { [id]: _, ...rest } = current
      return rest
    })
  }

  const toggleSection = (id: string) => {
    setPage((current) => {
      if (!current) return current
      return {
        ...current,
        sections: current.sections.map((section) =>
          section.id === id ? { ...section, enabled: !section.enabled } : section
        ),
      }
    })
  }

  const addSection = () => {
    if (!page) return
    const type = newSectionType.trim()
    if (!type) {
      toast.error('Enter a section type')
      return
    }

    const id = `${pageKey}_${slugify(type)}_${Date.now().toString(36)}`
    const nextSection: CmsSectionDraft = { id, type, enabled: true, data: {} }

    setPage({ ...page, sections: [...page.sections, nextSection] })
    setDataText((current) => ({ ...current, [id]: JSON.stringify({}, null, 2) }))
    setNewSectionType('')
  }

  const handleSave = async () => {
    if (!page) return
    setSaving(true)
    try {
      const nextSections = page.sections.map((section) => {
        const text = dataText[section.id] ?? '{}'
        const parsed = parseJsonSafe(text)
        if (!parsed) {
          throw new Error(`Invalid JSON in section: ${section.type}`)
        }
        return { ...section, data: parsed }
      })

      const response = await fetch(`/api/admin/cms/${page.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: page.title, sections: nextSections }),
      })

      if (!response.ok) {
        throw new Error('Save failed')
      }

      const json = (await response.json()) as CmsPageDraft
      setPage(json)
      setDataText(
        (json.sections ?? []).reduce((accumulator, section) => {
          accumulator[section.id] = JSON.stringify(section.data ?? {}, null, 2)
          return accumulator
        }, {} as Record<string, string>)
      )
      toast.success('CMS saved')
    } catch (error: any) {
      toast.error(error?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', `castle-of-princess/cms/${pageKey}`)

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const json = await response.json()
    const url = json?.url as string | undefined
    if (!url) {
      throw new Error('Upload failed')
    }
    return url
  }

  const startUpload = (onUrl?: (url: string) => void) => {
    pendingImageApplyRef.current = onUrl ?? null
    fileInputRef.current?.click()
  }

  const getSectionData = (sectionId: string) => {
    const parsed = parseJsonSafe(dataText[sectionId] ?? '{}')
    return parsed ?? {}
  }

  const setSectionData = (sectionId: string, nextData: any) => {
    setDataText((current) => ({
      ...current,
      [sectionId]: JSON.stringify(nextData ?? {}, null, 2),
    }))
  }

  const updateSectionData = (sectionId: string, updater: (current: any) => any) => {
    const currentData = getSectionData(sectionId)
    const next = updater(currentData)
    setSectionData(sectionId, next)
  }

  const renderTextField = (
    sectionId: string,
    label: string,
    value: string,
    onChange: (next: string) => void,
    placeholder?: string
  ) => (
    <div>
      <label className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</label>
      <input
        name={`${sectionId}_${slugify(label)}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
      />
    </div>
  )

  const renderNumberField = (
    sectionId: string,
    label: string,
    value: number,
    onChange: (next: number) => void,
    options?: { min?: number; step?: number; placeholder?: string }
  ) => (
    <div>
      <label className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</label>
      <input
        name={`${sectionId}_${slugify(label)}`}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={options?.min}
        step={options?.step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder={options?.placeholder}
        className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
      />
    </div>
  )

  const renderToggleField = (
    label: string,
    value: boolean,
    onChange: (next: boolean) => void
  ) => (
    <div>
      <label className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-full border px-4 py-3 text-xs uppercase tracking-[0.22em] transition-colors ${
            value
              ? 'border-gold/30 bg-gold/10 text-gold'
              : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
          }`}
        >
          On
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-full border px-4 py-3 text-xs uppercase tracking-[0.22em] transition-colors ${
            !value
              ? 'border-white/20 bg-white/[0.06] text-white'
              : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
          }`}
        >
          Off
        </button>
      </div>
    </div>
  )

  const renderTextareaField = (
    label: string,
    value: string,
    onChange: (next: string) => void,
    rows: number = 4
  ) => (
    <div>
      <label className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
      />
    </div>
  )

  const renderImageField = (
    label: string,
    value: string,
    onChange: (next: string) => void
  ) => (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => startUpload((url) => onChange(url))}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
      />
      {value ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div
            className="h-40 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${value})` }}
          />
        </div>
      ) : null}
    </div>
  )

  const iconOptions = ['ShieldCheck', 'Sparkles', 'Star', 'Gem'] as const

  const renderSectionEditor = (section: CmsSectionDraft) => {
    const data = getSectionData(section.id)

    if (section.type === 'home.hero') {
      const slides = ensureArray<any>(data.slides, [])
      return (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(
              section.id,
              'Auto Slide (ms)',
              String(data.autoSlideMs ?? 5000),
              (next) =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  autoSlideMs: Number(next) || 5000,
                })),
              '5000'
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-white">Slides</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSectionData(section.id, (current) => ({
                    ...current,
                    slides: [
                      ...ensureArray<any>(current.slides, []),
                      {
                        eyebrow: 'New Slide',
                        title: 'New Title',
                        description: '',
                        accent: '',
                        image: '',
                        primaryHref: '/products',
                        primaryLabel: 'Shop Now',
                        secondaryHref: '/products',
                        secondaryLabel: 'Explore',
                      },
                    ],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Slide
              </Button>
            </div>

            {slides.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-gray-400">
                No slides yet.
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide: any, index: number) => (
                  <div
                    key={`${section.id}_slide_${index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <p className="text-sm font-medium text-white">Slide {index + 1}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === 0}
                          onClick={() =>
                            updateSectionData(section.id, (current) => {
                              const nextSlides = [...ensureArray<any>(current.slides, [])]
                              const item = nextSlides[index]
                              nextSlides.splice(index, 1)
                              nextSlides.splice(index - 1, 0, item)
                              return { ...current, slides: nextSlides }
                            })
                          }
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={index === slides.length - 1}
                          onClick={() =>
                            updateSectionData(section.id, (current) => {
                              const nextSlides = [...ensureArray<any>(current.slides, [])]
                              const item = nextSlides[index]
                              nextSlides.splice(index, 1)
                              nextSlides.splice(index + 1, 0, item)
                              return { ...current, slides: nextSlides }
                            })
                          }
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateSectionData(section.id, (current) => ({
                              ...current,
                              slides: ensureArray<any>(current.slides, []).filter(
                                (_: any, i: number) => i !== index
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      {renderTextField(section.id, 'Eyebrow', slide.eyebrow ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextSlides = [...ensureArray<any>(current.slides, [])]
                          nextSlides[index] = { ...nextSlides[index], eyebrow: next }
                          return { ...current, slides: nextSlides }
                        })
                      )}
                      {renderTextField(section.id, 'Title', slide.title ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextSlides = [...ensureArray<any>(current.slides, [])]
                          nextSlides[index] = { ...nextSlides[index], title: next }
                          return { ...current, slides: nextSlides }
                        })
                      )}
                      <div className="lg:col-span-2">
                        {renderTextareaField('Description', slide.description ?? '', (next) =>
                          updateSectionData(section.id, (current) => {
                            const nextSlides = [...ensureArray<any>(current.slides, [])]
                            nextSlides[index] = { ...nextSlides[index], description: next }
                            return { ...current, slides: nextSlides }
                          })
                        )}
                      </div>
                      <div className="lg:col-span-2">
                        {renderTextareaField('Accent', slide.accent ?? '', (next) =>
                          updateSectionData(section.id, (current) => {
                            const nextSlides = [...ensureArray<any>(current.slides, [])]
                            nextSlides[index] = { ...nextSlides[index], accent: next }
                            return { ...current, slides: nextSlides }
                          })
                        )}
                      </div>
                      <div className="lg:col-span-2">
                        {renderImageField('Image URL', slide.image ?? '', (next) =>
                          updateSectionData(section.id, (current) => {
                            const nextSlides = [...ensureArray<any>(current.slides, [])]
                            nextSlides[index] = { ...nextSlides[index], image: next }
                            return { ...current, slides: nextSlides }
                          })
                        )}
                      </div>
                      {renderTextField(section.id, 'Primary Label', slide.primaryLabel ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextSlides = [...ensureArray<any>(current.slides, [])]
                          nextSlides[index] = { ...nextSlides[index], primaryLabel: next }
                          return { ...current, slides: nextSlides }
                        })
                      )}
                      {renderTextField(section.id, 'Primary Link', slide.primaryHref ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextSlides = [...ensureArray<any>(current.slides, [])]
                          nextSlides[index] = { ...nextSlides[index], primaryHref: next }
                          return { ...current, slides: nextSlides }
                        })
                      )}
                      {renderTextField(section.id, 'Secondary Label', slide.secondaryLabel ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextSlides = [...ensureArray<any>(current.slides, [])]
                          nextSlides[index] = { ...nextSlides[index], secondaryLabel: next }
                          return { ...current, slides: nextSlides }
                        })
                      )}
                      {renderTextField(section.id, 'Secondary Link', slide.secondaryHref ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextSlides = [...ensureArray<any>(current.slides, [])]
                          nextSlides[index] = { ...nextSlides[index], secondaryHref: next }
                          return { ...current, slides: nextSlides }
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    if (section.type === 'home.categories') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Categories</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [
                    ...ensureArray<any>(current.items, []),
                    { name: 'New Category', slug: 'new-category', image: '', description: '' },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div
                key={`${section.id}_cat_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">Item {index + 1}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Name', item.name ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], name: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  {renderTextField(
                    section.id,
                    'Slug',
                    item.slug ?? '',
                    (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], slug: slugify(next) }
                        return { ...current, items: nextItems }
                      }),
                    'cleanser'
                  )}
                  <div className="lg:col-span-2">
                    {renderImageField('Image', item.image ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], image: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    {renderTextareaField('Description', item.description ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], description: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'home.bestSelling') {
      const shots = ensureArray<any>(data.beautyShots, [])
      const products = ensureArray<any>(data.products, [])

      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
            {renderTextField(section.id, 'CTA Label', data.ctaLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, ctaLabel: next }))
            )}
            {renderTextField(section.id, 'CTA Link', data.ctaHref ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, ctaHref: next }))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-white">Beauty Shots (3 images)</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSectionData(section.id, (current) => ({
                    ...current,
                    beautyShots: [
                      ...ensureArray<any>(current.beautyShots, []),
                      { title: 'New Shot', image: '' },
                    ],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </div>

            <div className="space-y-4">
              {shots.map((shot: any, index: number) => (
                <div
                  key={`${section.id}_shot_${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <p className="text-sm font-medium text-white">Shot {index + 1}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSectionData(section.id, (current) => ({
                          ...current,
                          beautyShots: ensureArray<any>(current.beautyShots, []).filter(
                            (_: any, i: number) => i !== index
                          ),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {renderTextField(section.id, 'Title', shot.title ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextShots = [...ensureArray<any>(current.beautyShots, [])]
                        nextShots[index] = { ...nextShots[index], title: next }
                        return { ...current, beautyShots: nextShots }
                      })
                    )}
                    <div className="lg:col-span-2">
                      {renderImageField('Image', shot.image ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextShots = [...ensureArray<any>(current.beautyShots, [])]
                          nextShots[index] = { ...nextShots[index], image: next }
                          return { ...current, beautyShots: nextShots }
                        })
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-white">Products</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateSectionData(section.id, (current) => ({
                    ...current,
                    products: [
                      ...ensureArray<any>(current.products, []),
                      {
                        id: `best_${Date.now().toString(36)}`,
                        productId: `best_prod_${Date.now().toString(36)}`,
                        name: 'New Product',
                        slug: 'new-product',
                        image: '',
                        price: 0,
                        salePrice: 0,
                        rating: 5,
                        reviewCount: 0,
                        featured: false,
                        trending: false,
                        onSale: false,
                        stock: 0,
                      },
                    ],
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="space-y-4">
              {products.map((product: any, index: number) => (
                <div
                  key={`${section.id}_best_${product.id ?? index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <p className="text-sm font-medium text-white">
                      {product.name || `Product ${index + 1}`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                        onClick={() =>
                          updateSectionData(section.id, (current) => {
                            const nextProducts = [...ensureArray<any>(current.products, [])]
                            const item = nextProducts[index]
                            nextProducts.splice(index, 1)
                            nextProducts.splice(index - 1, 0, item)
                            return { ...current, products: nextProducts }
                          })
                        }
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={index === products.length - 1}
                        onClick={() =>
                          updateSectionData(section.id, (current) => {
                            const nextProducts = [...ensureArray<any>(current.products, [])]
                            const item = nextProducts[index]
                            nextProducts.splice(index, 1)
                            nextProducts.splice(index + 1, 0, item)
                            return { ...current, products: nextProducts }
                          })
                        }
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSectionData(section.id, (current) => ({
                            ...current,
                            products: ensureArray<any>(current.products, []).filter(
                              (_: any, i: number) => i !== index
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {renderTextField(section.id, 'Name', product.name ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], name: next }
                        return { ...current, products: nextProducts }
                      })
                    )}
                    {renderTextField(section.id, 'Slug', product.slug ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], slug: slugify(next) }
                        return { ...current, products: nextProducts }
                      })
                    )}
                    <div className="lg:col-span-2">
                      {renderImageField('Image', product.image ?? '', (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextProducts = [...ensureArray<any>(current.products, [])]
                          nextProducts[index] = { ...nextProducts[index], image: next }
                          return { ...current, products: nextProducts }
                        })
                      )}
                    </div>
                    {renderNumberField(section.id, 'Price', Number(product.price ?? 0), (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], price: next }
                        return { ...current, products: nextProducts }
                      })
                    )}
                    {renderNumberField(
                      section.id,
                      'Sale Price',
                      Number(product.salePrice ?? 0),
                      (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextProducts = [...ensureArray<any>(current.products, [])]
                          nextProducts[index] = { ...nextProducts[index], salePrice: next }
                          return { ...current, products: nextProducts }
                        })
                    )}
                    {renderNumberField(section.id, 'Rating', Number(product.rating ?? 5), (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], rating: next }
                        return { ...current, products: nextProducts }
                      }),
                      { min: 0, step: 0.1 }
                    )}
                    {renderNumberField(
                      section.id,
                      'Review Count',
                      Number(product.reviewCount ?? 0),
                      (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextProducts = [...ensureArray<any>(current.products, [])]
                          nextProducts[index] = { ...nextProducts[index], reviewCount: next }
                          return { ...current, products: nextProducts }
                        }),
                      { min: 0, step: 1 }
                    )}
                    {renderNumberField(section.id, 'Stock', Number(product.stock ?? 0), (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], stock: next }
                        return { ...current, products: nextProducts }
                      }),
                      { min: 0, step: 1 }
                    )}
                    {renderToggleField('Featured', Boolean(product.featured), (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], featured: next }
                        return { ...current, products: nextProducts }
                      })
                    )}
                    {renderToggleField('Trending', Boolean(product.trending), (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], trending: next }
                        return { ...current, products: nextProducts }
                      })
                    )}
                    {renderToggleField('On Sale', Boolean(product.onSale), (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], onSale: next }
                        return { ...current, products: nextProducts }
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (section.type === 'home.featuredProducts') {
      const products = ensureArray<any>(data.products, [])

      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
            {renderTextField(section.id, 'CTA Label', data.ctaLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, ctaLabel: next }))
            )}
            {renderTextField(section.id, 'CTA Link', data.ctaHref ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, ctaHref: next }))
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Products</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  products: [
                    ...ensureArray<any>(current.products, []),
                    {
                      id: `feat_${Date.now().toString(36)}`,
                      productId: `feat_prod_${Date.now().toString(36)}`,
                      name: 'New Product',
                      slug: 'new-product',
                      image: '',
                      price: 0,
                      salePrice: 0,
                      rating: 5,
                      reviewCount: 0,
                      featured: true,
                      trending: false,
                      onSale: false,
                      stock: 0,
                    },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          <div className="space-y-4">
            {products.map((product: any, index: number) => (
              <div
                key={`${section.id}_feat_${product.id ?? index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">
                    {product.name || `Product ${index + 1}`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        products: ensureArray<any>(current.products, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Name', product.name ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextProducts = [...ensureArray<any>(current.products, [])]
                      nextProducts[index] = { ...nextProducts[index], name: next }
                      return { ...current, products: nextProducts }
                    })
                  )}
                  {renderTextField(section.id, 'Slug', product.slug ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextProducts = [...ensureArray<any>(current.products, [])]
                      nextProducts[index] = { ...nextProducts[index], slug: slugify(next) }
                      return { ...current, products: nextProducts }
                    })
                  )}
                  <div className="lg:col-span-2">
                    {renderImageField('Image', product.image ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextProducts = [...ensureArray<any>(current.products, [])]
                        nextProducts[index] = { ...nextProducts[index], image: next }
                        return { ...current, products: nextProducts }
                      })
                    )}
                  </div>
                  {renderNumberField(section.id, 'Price', Number(product.price ?? 0), (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextProducts = [...ensureArray<any>(current.products, [])]
                      nextProducts[index] = { ...nextProducts[index], price: next }
                      return { ...current, products: nextProducts }
                    })
                  )}
                  {renderNumberField(section.id, 'Sale Price', Number(product.salePrice ?? 0), (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextProducts = [...ensureArray<any>(current.products, [])]
                      nextProducts[index] = { ...nextProducts[index], salePrice: next }
                      return { ...current, products: nextProducts }
                    })
                  )}
                  {renderNumberField(section.id, 'Stock', Number(product.stock ?? 0), (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextProducts = [...ensureArray<any>(current.products, [])]
                      nextProducts[index] = { ...nextProducts[index], stock: next }
                      return { ...current, products: nextProducts }
                    }),
                    { min: 0, step: 1 }
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'home.allProductsMini') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
            {renderTextField(section.id, 'CTA Label', data.ctaLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, ctaLabel: next }))
            )}
            {renderTextField(section.id, 'CTA Link', data.ctaHref ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, ctaHref: next }))
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Mini Cards</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [
                    ...ensureArray<any>(current.items, []),
                    { name: 'New Item', slug: 'new-item', image: '', price: '৳0' },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div
                key={`${section.id}_mini_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">Item {index + 1}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Name', item.name ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], name: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  {renderTextField(section.id, 'Slug', item.slug ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], slug: slugify(next) }
                      return { ...current, items: nextItems }
                    })
                  )}
                  <div className="lg:col-span-2">
                    {renderImageField('Image', item.image ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], image: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                  {renderTextField(section.id, 'Price (text)', item.price ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], price: next }
                      return { ...current, items: nextItems }
                    }),
                    '৳2,800'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'home.gallery') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Gallery Items</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [
                    ...ensureArray<any>(current.items, []),
                    { title: 'New Image', subtitle: '', image: '', span: '' },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div
                key={`${section.id}_gallery_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">Item {index + 1}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Title', item.title ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], title: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  {renderTextField(section.id, 'Subtitle', item.subtitle ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], subtitle: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  <div className="lg:col-span-2">
                    {renderImageField('Image', item.image ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], image: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                  {renderTextField(section.id, 'Span (layout)', item.span ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], span: next }
                      return { ...current, items: nextItems }
                    }),
                    "Example: md:row-span-2 or md:col-span-2"
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'home.brands') {
      const brands = ensureArray<string>(data.brands, [])
      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
            {renderTextField(section.id, 'Hero Badge', data.heroBadge ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, heroBadge: next }))
            )}
            {renderTextField(section.id, 'Hero Title', data.heroTitle ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, heroTitle: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Hero Description', data.heroDescription ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, heroDescription: next }))
              )}
            </div>
            <div className="lg:col-span-2">
              {renderImageField('Hero Image', data.heroImage ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, heroImage: next }))
              )}
            </div>
            <div className="lg:col-span-2">
              {renderTextField(section.id, 'Hero Image Alt', data.heroImageAlt ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, heroImageAlt: next }))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Brand Names</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  brands: [...ensureArray<string>(current.brands, []), 'New Brand'],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </div>

          <div className="space-y-3">
            {brands.map((brand: string, index: number) => (
              <div
                key={`${section.id}_brandname_${index}`}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center"
              >
                <input
                  value={brand}
                  onChange={(e) => {
                    const nextValue = e.target.value
                    updateSectionData(section.id, (current) => {
                      const nextBrands = [...ensureArray<string>(current.brands, [])]
                      nextBrands[index] = nextValue
                      return { ...current, brands: nextBrands }
                    })
                  }}
                  className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSectionData(section.id, (current) => ({
                      ...current,
                      brands: ensureArray<string>(current.brands, []).filter(
                        (_: string, i: number) => i !== index
                      ),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'home.concerns') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Concerns</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [...ensureArray<any>(current.items, []), { name: 'New Concern', icon: '✨' }],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Concern
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div
                key={`${section.id}_concern_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">Item {index + 1}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Name', item.name ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], name: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  {renderTextField(section.id, 'Icon (emoji)', item.icon ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], icon: next }
                      return { ...current, items: nextItems }
                    }),
                    '✨'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'home.reviews') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Reviews</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [
                    ...ensureArray<any>(current.items, []),
                    {
                      name: 'New Customer',
                      location: '',
                      rating: 5,
                      image: '',
                      title: '',
                      review: '',
                    },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((review: any, index: number) => (
              <div
                key={`${section.id}_review_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">
                    {review.name || `Review ${index + 1}`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Name', review.name ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], name: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  {renderTextField(section.id, 'Location', review.location ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], location: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  {renderNumberField(section.id, 'Rating (1-5)', Number(review.rating ?? 5), (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], rating: Math.max(1, Math.min(5, next)) }
                      return { ...current, items: nextItems }
                    }),
                    { min: 1, step: 1 }
                  )}
                  <div className="lg:col-span-2">
                    {renderImageField('Customer Image', review.image ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], image: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    {renderTextField(section.id, 'Review Title', review.title ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], title: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    {renderTextareaField('Review Text', review.review ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], review: next }
                        return { ...current, items: nextItems }
                      }),
                      5
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'home.newsletter') {
      const images = ensureArray<any>(data.images, [])
      return (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
            {renderTextField(section.id, 'Button Label', data.buttonLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, buttonLabel: next }))
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Newsletter Images</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  images: [...ensureArray<any>(current.images, []), { title: 'New Image', image: '' }],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>

          <div className="space-y-4">
            {images.map((image: any, index: number) => (
              <div
                key={`${section.id}_nl_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">Image {index + 1}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        images: ensureArray<any>(current.images, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Title', image.title ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextImages = [...ensureArray<any>(current.images, [])]
                      nextImages[index] = { ...nextImages[index], title: next }
                      return { ...current, images: nextImages }
                    })
                  )}
                  <div className="lg:col-span-2">
                    {renderImageField('Image', image.image ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextImages = [...ensureArray<any>(current.images, [])]
                        nextImages[index] = { ...nextImages[index], image: next }
                        return { ...current, images: nextImages }
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'brands.hero' || section.type === 'about.hero') {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Badge', data.badge ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, badge: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>

            {renderTextField(section.id, 'Primary Button Label', data.primaryLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, primaryLabel: next }))
            )}
            {renderTextField(section.id, 'Primary Button Link', data.primaryHref ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, primaryHref: next }))
            )}
            {renderTextField(section.id, 'Secondary Button Label', data.secondaryLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, secondaryLabel: next }))
            )}
            {renderTextField(section.id, 'Secondary Button Link', data.secondaryHref ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, secondaryHref: next }))
            )}
            <div className="lg:col-span-2">
              {renderImageField('Hero Image', data.heroImage ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, heroImage: next }))
              )}
            </div>
          </div>

          {section.type === 'brands.hero' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {renderTextField(section.id, 'Side Card Eyebrow', data.sideCardEyebrow ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, sideCardEyebrow: next }))
              )}
              {renderTextField(section.id, 'Side Card Title', data.sideCardTitle ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, sideCardTitle: next }))
              )}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {renderTextField(section.id, 'Hero Image Alt', data.heroImageAlt ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, heroImageAlt: next }))
              )}
              {renderTextField(section.id, 'Side Card Eyebrow', data.sideCardEyebrow ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, sideCardEyebrow: next }))
              )}
              <div className="lg:col-span-2">
                {renderTextField(section.id, 'Side Card Title', data.sideCardTitle ?? '', (next) =>
                  updateSectionData(section.id, (current) => ({ ...current, sideCardTitle: next }))
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (section.type === 'brands.promises' || section.type === 'about.highlights') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">
              {section.type === 'brands.promises' ? 'Promise Cards' : 'Highlight Cards'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [
                    ...ensureArray<any>(current.items, []),
                    { title: 'New Item', description: '', icon: 'Star' },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div
                key={`${section.id}_card_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">Card {index + 1}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Title', item.title ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], title: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  <div>
                    <label className="text-xs uppercase tracking-[0.22em] text-gray-500">Icon</label>
                    <select
                      value={item.icon ?? 'Star'}
                      onChange={(e) =>
                        updateSectionData(section.id, (current) => {
                          const nextItems = [...ensureArray<any>(current.items, [])]
                          nextItems[index] = { ...nextItems[index], icon: e.target.value }
                          return { ...current, items: nextItems }
                        })
                      }
                      className="mt-2 w-full rounded-full border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
                    >
                      {iconOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    {renderTextareaField('Description', item.description ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], description: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'brands.grid') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Brands</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [
                    ...ensureArray<any>(current.items, []),
                    {
                      name: 'New Brand',
                      tagline: '',
                      description: '',
                      image: '',
                      specialties: [],
                    },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((brand: any, index: number) => (
              <div
                key={`${section.id}_brand_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">{brand.name || `Brand ${index + 1}`}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Name', brand.name ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], name: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  {renderTextField(section.id, 'Tagline', brand.tagline ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], tagline: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  <div className="lg:col-span-2">
                    {renderTextareaField('Description', brand.description ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], description: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    {renderImageField('Image', brand.image ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], image: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    {renderTextField(
                      section.id,
                      'Specialties (comma separated)',
                      ensureArray<string>(brand.specialties, []).join(', '),
                      (next) =>
                        updateSectionData(section.id, (current) => {
                          const nextItems = [...ensureArray<any>(current.items, [])]
                          nextItems[index] = { ...nextItems[index], specialties: splitCsv(next) }
                          return { ...current, items: nextItems }
                        }),
                      'Barrier Repair, Glow'
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'about.mission') {
      const paragraphs = ensureArray<string>(data.paragraphs, [])
      return (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Paragraphs</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSectionData(section.id, (current) => ({
                      ...current,
                      paragraphs: [...ensureArray<string>(current.paragraphs, []), ''],
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Paragraph
                </Button>
              </div>
              <div className="space-y-3">
                {paragraphs.map((paragraph: string, index: number) => (
                  <div
                    key={`${section.id}_p_${index}`}
                    className="rounded-2xl border border-white/10 bg-black/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                        Paragraph {index + 1}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSectionData(section.id, (current) => ({
                            ...current,
                            paragraphs: ensureArray<string>(current.paragraphs, []).filter(
                              (_: string, i: number) => i !== index
                            ),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <textarea
                      value={paragraph}
                      onChange={(e) => {
                        const nextValue = e.target.value
                        updateSectionData(section.id, (current) => {
                          const next = [...ensureArray<string>(current.paragraphs, [])]
                          next[index] = nextValue
                          return { ...current, paragraphs: next }
                        })
                      }}
                      rows={4}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              {renderImageField('Image', data.image ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, image: next }))
              )}
            </div>
            <div className="lg:col-span-2">
              {renderTextField(section.id, 'Image Alt', data.imageAlt ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, imageAlt: next }))
              )}
            </div>
          </div>
        </div>
      )
    }

    if (section.type === 'about.pillars') {
      const items = ensureArray<any>(data.items, [])
      return (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Eyebrow', data.eyebrow ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, eyebrow: next }))
            )}
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white">Pillars</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateSectionData(section.id, (current) => ({
                  ...current,
                  items: [...ensureArray<any>(current.items, []), { title: 'New Pillar', description: '' }],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Pillar
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div
                key={`${section.id}_pillar_${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <p className="text-sm font-medium text-white">Pillar {index + 1}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionData(section.id, (current) => ({
                        ...current,
                        items: ensureArray<any>(current.items, []).filter(
                          (_: any, i: number) => i !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderTextField(section.id, 'Title', item.title ?? '', (next) =>
                    updateSectionData(section.id, (current) => {
                      const nextItems = [...ensureArray<any>(current.items, [])]
                      nextItems[index] = { ...nextItems[index], title: next }
                      return { ...current, items: nextItems }
                    })
                  )}
                  <div className="lg:col-span-2">
                    {renderTextareaField('Description', item.description ?? '', (next) =>
                      updateSectionData(section.id, (current) => {
                        const nextItems = [...ensureArray<any>(current.items, [])]
                        nextItems[index] = { ...nextItems[index], description: next }
                        return { ...current, items: nextItems }
                      })
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (section.type === 'about.cta') {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {renderTextField(section.id, 'Title', data.title ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, title: next }))
            )}
            {renderTextField(section.id, 'Primary Button Label', data.primaryLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, primaryLabel: next }))
            )}
            <div className="lg:col-span-2">
              {renderTextareaField('Description', data.description ?? '', (next) =>
                updateSectionData(section.id, (current) => ({ ...current, description: next }))
              )}
            </div>
            {renderTextField(section.id, 'Primary Button Link', data.primaryHref ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, primaryHref: next }))
            )}
            {renderTextField(section.id, 'Secondary Button Label', data.secondaryLabel ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, secondaryLabel: next }))
            )}
            {renderTextField(section.id, 'Secondary Button Link', data.secondaryHref ?? '', (next) =>
              updateSectionData(section.id, (current) => ({ ...current, secondaryHref: next }))
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-gray-400">
        This section does not have a visual editor yet. Use Advanced (JSON) to edit it.
      </div>
    )
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="CMS"
        title={title}
        description="Edit section order, disable sections, and update content with a client-friendly editor. Save to publish changes on the storefront."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/cms"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:border-gold/30 hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Button onClick={handleSave} disabled={saving || loading}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AdminPanel
            title="Sections"
            description="Drag-free ordering: use the arrows to move sections up or down."
            action={
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  placeholder="Section type (example: home.hero)"
                  className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold sm:w-72"
                />
                <Button variant="outline" onClick={addSection} disabled={loading || !page}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            }
          >
            {loading || !page ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-gray-400">
                Loading CMS content...
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <label className="text-xs uppercase tracking-[0.22em] text-gray-500">
                    Page Title
                  </label>
                  <input
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    className="mt-3 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                {page.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.28em] text-gold/70">
                          Section {index + 1}
                        </p>
                        <p className="mt-2 break-words font-medium text-white">{section.type}</p>
                        <p className="mt-1 text-xs text-gray-500">id: {section.id}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSection(section.id)}
                        >
                          {section.enabled ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Enable
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setShowAdvanced((current) => ({
                              ...current,
                              [section.id]: !current[section.id],
                            }))
                          }
                        >
                          {showAdvanced[section.id] ? 'Visual' : 'Advanced'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === page.sections.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      {showAdvanced[section.id] ? (
                        <>
                          <label className="text-xs uppercase tracking-[0.22em] text-gray-500">
                            Advanced (JSON)
                          </label>
                          <textarea
                            value={dataText[section.id] ?? '{}'}
                            onChange={(e) =>
                              setDataText((current) => ({
                                ...current,
                                [section.id]: e.target.value,
                              }))
                            }
                            className="mt-3 h-72 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 font-mono text-xs text-white outline-none transition-colors focus:border-gold"
                          />
                        </>
                      ) : (
                        <div className="space-y-4">{renderSectionEditor(section)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminPanel>
        </div>

        <div className="space-y-6">
          <AdminPanel
            title="Media Upload"
            description="Upload images to Cloudinary. You can also upload directly inside any section image field."
            action={
              <Button variant="outline" onClick={() => startUpload()} disabled={loading}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                try {
                  const url = await uploadFile(file)
                  setLastUploadUrl(url)

                  const apply = pendingImageApplyRef.current
                  pendingImageApplyRef.current = null

                  if (apply) {
                    apply(url)
                    toast.success('Image uploaded')
                    return
                  }

                  try {
                    await navigator.clipboard.writeText(url)
                    toast.success('Image uploaded (URL copied)')
                  } catch (error) {
                    toast.success('Image uploaded')
                  }
                } catch (error) {
                  toast.error('Upload failed')
                }
              }}
            />

            {lastUploadUrl ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  Last Upload URL
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={lastUploadUrl}
                    readOnly
                    className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-xs text-white outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(lastUploadUrl)
                        toast.success('Copied')
                      } catch (error) {
                        toast.error('Copy failed')
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-gray-400">
                Upload an image to get a Cloudinary URL.
              </div>
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  )
}
