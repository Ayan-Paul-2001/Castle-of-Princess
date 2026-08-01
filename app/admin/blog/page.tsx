'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Search } from 'lucide-react'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminPanel from '@/components/admin/admin-panel'
import { Button } from '@/components/ui/button'

type BlogListItem = {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  category: string
  updatedAt: string
  publishedAt?: string | null
}

const LOCAL_BLOG_KEY = 'cop_blog_posts_v1'

type LocalBlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  coverImage: { url: string; publicId?: string; alt?: string } | null
  contentMarkdown: string
  status: 'draft' | 'published'
  publishedAt?: string | null
  seo: { title?: string; description?: string; keywords?: string[] }
  updatedAt: string
}

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

function createLocalPost(): LocalBlogPost {
  const id = `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const now = new Date().toISOString()
  return {
    id,
    title: 'New Post',
    slug: 'new-post',
    excerpt: '',
    category: 'Editorial',
    tags: [],
    coverImage: null,
    contentMarkdown: '',
    status: 'draft',
    publishedAt: null,
    seo: { title: '', description: '', keywords: [] },
    updatedAt: now,
  }
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<BlogListItem[]>([])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return posts
    return posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(term) ||
        post.slug.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term)
      )
    })
  }, [posts, search])

  const load = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blog', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load')
      }
      const json = (await response.json()) as BlogListItem[]
      const local = safeReadLocalPosts()
      const localListItems: BlogListItem[] = local.map((post) => ({
        id: post.id,
        title: `${post.title} (Local Draft)`,
        slug: post.slug,
        status: post.status,
        category: post.category,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt ?? null,
      }))
      setPosts([...localListItems, ...json])
    } catch (error) {
      const local = safeReadLocalPosts()
      setPosts(
        local.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          category: post.category,
          updatedAt: post.updatedAt,
          publishedAt: post.publishedAt ?? null,
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const createNew = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Post', category: 'Editorial' }),
      })
      if (response.ok) {
        const json = await response.json()
        router.push(`/admin/blog/${json.id}`)
        return
      }

      const localPost = createLocalPost()
      const existing = safeReadLocalPosts()
      writeLocalPosts([localPost, ...existing])
      toast.success('Created locally (connect MongoDB to publish)')
      router.push(`/admin/blog/${localPost.id}`)
    } catch (error) {
      toast.error('Failed to create post')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Blog"
        title="Blog Posts"
        description="Write and publish editorial posts. Use markdown, upload a cover image, and set SEO fields."
        action={
          <Button onClick={createNew} disabled={creating}>
            <Plus className="mr-2 h-4 w-4" />
            {creating ? 'Creating...' : 'New Post'}
          </Button>
        }
      />

      <AdminPanel
        title="Library"
        description="Search by title, slug, or category."
        action={
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors focus:border-gold"
            />
          </div>
        }
      >
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-gray-400">
            Loading posts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-sm text-gray-400">
            No posts found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-gray-500">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="hidden px-5 py-4 md:table-cell">Category</th>
                  <th className="hidden px-5 py-4 lg:table-cell">Updated</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr key={post.id} className="border-t border-white/10">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-medium text-white hover:text-gold"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">{post.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                          post.status === 'published'
                            ? 'border-gold/25 bg-gold/10 text-gold'
                            : 'border-white/10 bg-white/[0.04] text-gray-300'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-gray-300 md:table-cell">
                      {post.category}
                    </td>
                    <td className="hidden px-5 py-4 text-gray-400 lg:table-cell">
                      {new Date(post.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-sm text-gold hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  )
}
