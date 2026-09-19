import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import sanitizeHtml from 'sanitize-html'
import { marked } from 'marked'
import { blogPosts, getBlogPostBySlug } from '@/lib/blog-data'

type BlogDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

async function getDbPost(slug: string) {
  if (!process.env.MONGODB_URI) return null
  try {
    const [{ connectDB }, { default: BlogPost }] = await Promise.all([
      import('@/lib/db/connect'),
      import('@/lib/db/models/blog-post'),
    ])
    await connectDB()
    const filter = { slug, status: 'published' }
    return await BlogPost.findOne(filter).lean()
  } catch (error) {
    return null
  }
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const dbPost: any = await getDbPost(slug)
  const staticPost = dbPost ? null : getBlogPostBySlug(slug)

  if (!dbPost && !staticPost) {
    return {
      title: 'Article Not Found',
    }
  }

  const post = dbPost
    ? {
        title: dbPost.title || 'Untitled Post',
        excerpt: dbPost.excerpt || '',
        image: dbPost.coverImage?.url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&h=1100&fit=crop&auto=format',
        seoTitle: dbPost.seo?.title || dbPost.title || 'Untitled Post',
        seoDescription: dbPost.seo?.description || dbPost.excerpt || '',
      }
    : {
        title: staticPost!.title,
        excerpt: staticPost!.excerpt,
        image: staticPost!.image,
        seoTitle: staticPost!.title,
        seoDescription: staticPost!.excerpt,
      }

  const title = post.seoTitle
  const description = post.seoDescription
  const image = post.image

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const dbPost: any = await getDbPost(slug)
  const staticPost = dbPost ? null : getBlogPostBySlug(slug)

  if (!dbPost && !staticPost) {
    notFound()
  }

  const post = dbPost
    ? {
        slug: dbPost.slug,
        title: dbPost.title || 'Untitled Post',
        excerpt: dbPost.excerpt || '',
        category: dbPost.category || 'Editorial',
        publishedAt: new Date(dbPost.publishedAt || dbPost.updatedAt || dbPost.createdAt || new Date()).toLocaleDateString(),
        author: 'Castle of Princess Editorial Team',
        image: dbPost.coverImage?.url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&h=1100&fit=crop&auto=format',
        readTime: '5 min read',
        ctaHref: '/products?sort=featured',
        ctaLabel: 'Shop featured products',
        keyPoints: dbPost.tags ?? [],
        sections: [] as any[],
      }
    : {
        slug: staticPost!.slug,
        title: staticPost!.title,
        excerpt: staticPost!.excerpt,
        category: staticPost!.category,
        publishedAt: staticPost!.publishedAt,
        author: staticPost!.author,
        image: staticPost!.image,
        readTime: staticPost!.readTime,
        ctaHref: staticPost!.ctaHref,
        ctaLabel: staticPost!.ctaLabel,
        keyPoints: staticPost!.keyPoints,
        sections: staticPost!.sections,
      }

  const activeSlug = post.slug
  const relatedPosts = blogPosts.filter((item) => item.slug !== activeSlug).slice(0, 3)

  let htmlPreview: string | null = null
  if (dbPost) {
    const raw = (await marked.parse(dbPost.contentMarkdown || '')) as string
    htmlPreview = sanitizeHtml(raw, {
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
  }

  return (
    <div className="min-h-screen silk-overlay">
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-5 py-2 text-xs uppercase tracking-[0.32em] text-gold">
              {post.category}
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl font-playfair text-5xl font-bold leading-tight text-white md:text-7xl">
              {post.title}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
              {post.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <span>{post.author}</span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gold" />
                {post.publishedAt}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-gold" />
                {post.readTime}
              </span>
            </div>
          </div>

          <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10">
            <div className="relative aspect-[16/8]">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1200px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.75fr_0.25fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <div className="space-y-12">
              {dbPost ? (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlPreview || '' }}
                />
              ) : (
                post.sections.map((section) => (
                  <div key={section.heading}>
                    <h2 className="font-playfair text-3xl text-white md:text-4xl">
                      {section.heading}
                    </h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-gray-300 md:text-lg">
                      {section.paragraphs.map((paragraph: string) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-12 rounded-[1.75rem] border border-gold/20 bg-gold/10 p-7">
              <h3 className="font-playfair text-2xl text-white">Ready to explore the products?</h3>
              <p className="mt-3 max-w-2xl text-gray-300">
                Move from editorial inspiration into curated product discovery with a collection
                tied directly to this topic.
              </p>
              <Link
                href={post.ctaHref}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
              >
                {post.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="glass rounded-[1.75rem] p-6">
              <h3 className="font-playfair text-2xl text-white">Key Takeaways</h3>
              <div className="mt-5 space-y-4">
                {post.keyPoints.map((point: string) => (
                  <div key={point} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gold" />
                    <p className="text-sm leading-7 text-gray-300">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[1.75rem] p-6">
              <h3 className="font-playfair text-2xl text-white">Continue Reading</h3>
              <div className="mt-5 space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={relatedPost.href}
                    className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-gold/30"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-gold/70">
                      {relatedPost.category}
                    </p>
                    <p className="mt-2 font-playfair text-xl text-white">
                      {relatedPost.title}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">{relatedPost.readTime}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
