import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || role !== 'admin') {
    return null
  }
  return session
}

async function getBlogModel() {
  const [{ connectDB }, { default: BlogPost }] = await Promise.all([
    import('@/lib/db/connect'),
    import('@/lib/db/models/blog-post'),
  ])
  await connectDB()
  return BlogPost
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json([])
  }

  const BlogPost = await getBlogModel()
  const posts = await BlogPost.find({})
    .sort({ updatedAt: -1 })
    .select({ title: 1, slug: 1, status: 1, updatedAt: 1, publishedAt: 1, category: 1 })
    .lean()

  return NextResponse.json(
    posts.map((post: any) => ({
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      status: post.status,
      category: post.category,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    }))
  )
}

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is required' }, { status: 400 })
  }

  const body = await request.json()
  const title = typeof body?.title === 'string' ? body.title.trim() : 'Untitled Post'
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  const category = typeof body?.category === 'string' ? body.category.trim() : 'Editorial'

  const normalizedSlug =
    slug ||
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const BlogPost = await getBlogModel()
  const existing = await BlogPost.findOne({ slug: normalizedSlug }).lean()
  const finalSlug = existing ? `${normalizedSlug}-${Date.now().toString(36)}` : normalizedSlug

  const created = await BlogPost.create({
    title,
    slug: finalSlug,
    excerpt: '',
    category,
    tags: [],
    contentMarkdown: '',
    status: 'draft',
  })

  return NextResponse.json({ id: created._id.toString() }, { status: 201 })
}

