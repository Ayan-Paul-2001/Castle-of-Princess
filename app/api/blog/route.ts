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

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json([])
  }

  const BlogPost = await getBlogModel()
  const filter = { status: 'published' }
  
  const posts = await BlogPost.find(filter)
    .sort({ publishedAt: -1, updatedAt: -1 })
    .select({ 
      title: 1, 
      slug: 1, 
      excerpt: 1, 
      category: 1, 
      coverImage: 1, 
      publishedAt: 1,
      updatedAt: 1,
      createdAt: 1
    })
    .lean()

  return NextResponse.json(
    posts.map((post: any) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      image: post.coverImage?.url ?? null,
      publishedAt: post.publishedAt ?? post.updatedAt ?? post.createdAt,
    }))
  )
}


