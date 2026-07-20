'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import sanitizeHtml from 'sanitize-html'
import { marked } from 'marked'
import {
  ArrowLeft,
  Copy,
  Eye,
  Image as ImageIcon,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'

type BlogPostDraft = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  coverImage: { url: string; publicId?: string; alt?: string } | null
  contentMarkdown: string
  status: 'draft' | 'published'
  publishedAt?: string | null
  seo: { title?: string; description?: string; keywords?: string[] }
}

const LOCAL_BLOG_KEY = 'cop_blog_posts_v1'

type LocalBlogPost = BlogPostDraft & { updatedAt: string }

const splitCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function safeReadLocalPosts(): LocalBlogPost[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_BLOG_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalPosts(posts: LocalBlogPost[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_BLOG_KEY, JSON.stringify(posts))
}

function findLocalPost(id: string) {
  return safeReadLocalPosts().find((post) => post.id === id) ?? null
}

export default function AdminBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [postId, setPostId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState(false)
  const [draft, setDraft] = useState<BlogPostDraft | null>(null)
  const [htmlPreview, setHtmlPreview] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let ignore = false
    params.then((resolved) => {
      if (ignore) return
      setPostId(resolved.id)
    })
    return () => {
      ignore = true
    }
  }, [params])

  const load = async (id: string) => {
    try {
      setLoading(true)
      if (id.startsWith('local_')) {
        const local = findLocalPost(id)
        if (local) {
          setDraft(local)
          return
        }
      }
      const response = await fetch(`/api/admin/blog/${id}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load')
      }
      const json = (await response.json()) as BlogPostDraft
      setDraft(json)
    } catch (error) {
      const local = findLocalPost(id)
      if (local) {
        setDraft(local)
      } else {
        toast.error('Failed to load post')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!postId) return
    load(postId)
  }, [postId])

  const contentMarkdown = draft?.contentMarkdown
  useEffect(() => {
    let ignore = false
    async function build() {
      if (!contentMarkdown) {
        setHtmlPreview('')
        return
      }
      const raw = (await marked.parse(contentMarkdown || '')) as string
      const sanitized = sanitizeHtml(raw, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        a: ['href', 'name', 'target', 'rel'],
        img: ['src', 'alt'],
        '*': ['class'],
      },
      transformTags: {
        a: (tagName: string, attribs: any) => ({
          tagName,
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        }),
      },
    })
      if (ignore) return
      setHtmlPreview(sanitized)
    }
    build()
    return () => {
      ignore = true
    }
  }, [contentMarkdown])

  const uploadCover = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'castle-of-princess/blog')

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const json = await response.json()
    if (!json?.url) {
      throw new Error('Upload failed')
    }

    setDraft((current) =>
      current
        ? {
            ...current,
            coverImage: { url: json.url, publicId: json.publicId, alt: current.title },
          }
        : current
    )
    toast.success('Cover uploaded')
  }

  const save = async () => {
    if (!draft) return
    try {
      setSaving(true)
      const payload = {
        ...draft,
        slug: slugify(draft.slug || draft.title),
        seo: {
          ...draft.seo,
          keywords: draft.seo?.keywords ?? [],
        },
      }

      if (draft.id.startsWith('local_')) {
        try {
          const syncResponse = await fetch('/api/admin/blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: payload.title,
              slug: payload.slug,
              category: payload.category,
            }),
          })
          if (syncResponse.ok) {
            const json = await syncResponse.json()
            const newId = json.id
            
            const updateResponse = await fetch(`/api/admin/blog/${newId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...payload, id: newId }),
            })
            
            if (updateResponse.ok) {
              const localPosts = safeReadLocalPosts()
              writeLocalPosts(localPosts.filter((post) => post.id !== draft.id))
              toast.success('Saved and synced to database!')
              router.replace(`/admin/blog/${newId}`)
              return
            }
          }
        } catch (e) {
          console.error('Failed to sync local draft to database:', e)
        }

        const existing = safeReadLocalPosts()
        const next: LocalBlogPost = { ...payload, updatedAt: new Date().toISOString() }
        const updated = [next, ...existing.filter((post) => post.id !== draft.id)]
        writeLocalPosts(updated)
        setDraft(next)
        toast.success('Saved locally')
        return
      }

      const response = await fetch(`/api/admin/blog/${draft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const existing = safeReadLocalPosts()
        const next: LocalBlogPost = {
          ...payload,
          id: `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          updatedAt: new Date().toISOString(),
        }
        writeLocalPosts([next, ...existing])
        setDraft(next)
        toast.success('Saved locally (connect MongoDB to publish)')
        router.replace(`/admin/blog/${next.id}`)
        return
      }

      toast.success('Saved')
    } catch (error) {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!draft) return
    const confirmed = window.confirm('Delete this post?')
    if (!confirmed) return

    try {
      setDeleting(true)
      if (draft.id.startsWith('local_')) {
        const updated = safeReadLocalPosts().filter((post) => post.id !== draft.id)
        writeLocalPosts(updated)
        toast.success('Deleted')
        router.push('/admin/blog')
        return
      }
      const response = await fetch(`/api/admin/blog/${draft.id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Delete failed')
      }
      toast.success('Deleted')
      router.push('/admin/blog')
    } catch (error) {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Blog"
        title={draft?.title || 'Loading...'}
        description="Write in markdown, preview, upload cover image, and publish."
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:border-gold/30 hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Button variant="outline" onClick={() => setPreview((v) => !v)} disabled={loading}>
              <Eye className="mr-2 h-4 w-4" />
              {preview ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={save} disabled={saving || loading || !draft}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      />

      {loading || !draft ? (
        <AdminPanel>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-gray-400">
            Loading post...
          </div>
        </AdminPanel>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <AdminPanel
              title="Editor"
              description="Write markdown content and preview it before publishing."
              action={
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(draft.contentMarkdown)
                        toast.success('Copied')
                      } catch (error) {
                        toast.error('Copy failed')
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              }
            >
              {preview ? (
                <div
                  className="prose prose-invert max-w-none rounded-2xl border border-white/10 bg-black/40 p-6"
                  dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />
              ) : (
                <textarea
                  value={draft.contentMarkdown}
                  onChange={(e) => setDraft({ ...draft, contentMarkdown: e.target.value })}
                  placeholder="# Title\n\nWrite your blog post here..."
                  className="h-[560px] w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 font-mono text-sm text-white outline-none transition-colors focus:border-gold"
                />
              )}
            </AdminPanel>
          </div>

          <div className="space-y-6">
            <AdminPanel
              title="Post Settings"
              description="Metadata, publishing controls, and cover image."
              action={
                <Button variant="outline" onClick={remove} disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.22em] text-gray-500">Title</label>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.22em] text-gray-500">Slug</label>
                  <input
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                    className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.22em] text-gray-500">
                    Category
                  </label>
                  <input
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.22em] text-gray-500">Tags</label>
                  <input
                    value={draft.tags.join(', ')}
                    onChange={(e) => setDraft({ ...draft, tags: splitCsv(e.target.value) })}
                    placeholder="glow, routine, sunscreen"
                    className="mt-2 w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.22em] text-gray-500">Excerpt</label>
                  <textarea
                    value={draft.excerpt}
                    onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                    className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-sm text-white outline-none transition-colors focus:border-gold"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Status</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, status: 'draft' })}
                      className={`flex-1 rounded-full border px-4 py-3 text-xs uppercase tracking-[0.22em] transition-colors ${
                        draft.status === 'draft'
                          ? 'border-white/20 bg-white/[0.08] text-white'
                          : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, status: 'published', publishedAt: draft.publishedAt })
                      }
                      className={`flex-1 rounded-full border px-4 py-3 text-xs uppercase tracking-[0.22em] transition-colors ${
                        draft.status === 'published'
                          ? 'border-gold/30 bg-gold/10 text-gold'
                          : 'border-white/10 bg-black/40 text-gray-400 hover:border-gold/20 hover:text-gold'
                      }`}
                    >
                      Published
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Cover Image</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (!file) return
                      try {
                        await uploadCover(file)
                      } catch (error) {
                        toast.error('Upload failed')
                      }
                    }}
                  />

                  {draft.coverImage?.url ? (
                    <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-400">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{draft.coverImage.url}</p>
                          <p className="mt-1 text-xs text-gray-500">Paste this URL into content too.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-gray-400">
                      No cover image yet.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">SEO</p>
                  <div className="mt-3 space-y-3">
                    <input
                      value={draft.seo?.title || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          seo: { ...draft.seo, title: e.target.value },
                        })
                      }
                      placeholder="SEO title"
                      className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
                    />
                    <textarea
                      value={draft.seo?.description || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          seo: { ...draft.seo, description: e.target.value },
                        })
                      }
                      placeholder="SEO description"
                      className="h-24 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-sm text-white outline-none transition-colors focus:border-gold"
                    />
                    <input
                      value={(draft.seo?.keywords ?? []).join(', ')}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          seo: { ...draft.seo, keywords: splitCsv(e.target.value) },
                        })
                      }
                      placeholder="keywords, separated, by commas"
                      className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-gold"
                    />
                  </div>
                </div>
              </div>
            </AdminPanel>
          </div>
        </div>
      )}
    </div>
  )
}
