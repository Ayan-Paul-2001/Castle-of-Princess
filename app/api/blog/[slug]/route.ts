import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
  context: { params: Promise<{ slug: string }> }
) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const BlogPost = await getBlogModel()
  const { slug } = await context.params
  const filter = { slug, status: 'published' }
  const post = await BlogPost.findOne(filter).lean()
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags ?? [],
    coverImage: post.coverImage ?? null,
    contentMarkdown: post.contentMarkdown,
    publishedAt: post.publishedAt ?? post.updatedAt,
    seo: post.seo ?? { title: '', description: '', keywords: [] },
  })
}
