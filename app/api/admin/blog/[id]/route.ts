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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is required' }, { status: 400 })
  }

  const BlogPost = await getBlogModel()
  const { id } = await context.params
  const post = await BlogPost.findById(id).lean()
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: post._id.toString(),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags ?? [],
    coverImage: post.coverImage ?? null,
    contentMarkdown: post.contentMarkdown,
    status: post.status,
    publishedAt: post.publishedAt ?? null,
    seo: post.seo ?? { title: '', description: '', keywords: [] },
  })
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is required' }, { status: 400 })
  }

  const body = await request.json()

  const BlogPost = await getBlogModel()
  const { id } = await context.params
  const updated = await BlogPost.findByIdAndUpdate(
    id,
    {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      category: body.category,
      tags: Array.isArray(body.tags) ? body.tags : [],
      coverImage: body.coverImage ?? undefined,
      contentMarkdown: body.contentMarkdown,
      status: body.status,
      publishedAt: body.status === 'published' ? body.publishedAt || new Date() : null,
      seo: body.seo ?? undefined,
    },
    { new: true }
  ).lean()

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is required' }, { status: 400 })
  }

  const BlogPost = await getBlogModel()
  const { id } = await context.params
  const deleted = await BlogPost.findByIdAndDelete(id).lean()
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
