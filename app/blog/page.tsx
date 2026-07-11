'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Clock3, Sparkles } from 'lucide-react'
import { blogPosts } from '@/lib/blog-data'

const categories = [
  { name: 'Glass Skin', href: '/products?concern=glass-skin' },
  { name: 'Acne Guide', href: '/products?concern=acne' },
  { name: 'Sensitive Skin', href: '/products?concern=sensitive' },
  { name: 'Brand Reviews', href: '/brands' },
]

const editorialPoints = [
  'Routine education tailored to Bangladeshi weather and lifestyle.',
  'Concern-based reading paths for acne, dehydration, glow, and sensitivity.',
  'Product discovery links that flow directly into curated shop collections.',
]

function safeReadLocalPosts(): any[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem('cop_blog_posts_v1')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>(blogPosts)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const response = await fetch('/api/blog', { cache: 'no-store' })
        let dbJson: any[] = []
        if (response.ok) {
          dbJson = await response.json()
        }

        const dbPosts = (Array.isArray(dbJson) ? dbJson : []).map((post: any) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          image: post.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&h=1100&fit=crop&auto=format',
          category: post.category,
          readTime: '5 min read',
          publishedAt: post.publishedAt || new Date().toISOString(),
          author: 'Castle of Princess Editorial Team',
          href: `/blog/${post.slug}`,
          ctaLabel: 'Shop routine essentials',
          ctaHref: '/products?sort=featured',
          keyPoints: [],
          sections: [],
        }))

        // Load local posts marked as 'published'
        const local = safeReadLocalPosts()
        const localPosts = local
          .filter((post: any) => post.status === 'published')
          .map((post: any) => ({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            image: post.coverImage?.url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&h=1100&fit=crop&auto=format',
            category: post.category,
            readTime: '5 min read',
            publishedAt: post.updatedAt || new Date().toISOString(),
            author: 'Castle of Princess Editorial Team',
            href: `/blog/${post.slug}`,
            ctaLabel: 'Shop routine essentials',
            ctaHref: '/products?sort=featured',
            keyPoints: [],
            sections: [],
          }))

        // Merge all posts (Local drafts first, then database posts, then static posts)
        // Deduplicate by slug
        const merged: any[] = []
        const addedSlugs = new Set<string>()

        // 1. Add local drafts
        for (const post of localPosts) {
          if (!addedSlugs.has(post.slug)) {
            merged.push(post)
            addedSlugs.add(post.slug)
          }
        }

        // 2. Add database posts
        for (const post of dbPosts) {
          if (!addedSlugs.has(post.slug)) {
            merged.push(post)
            addedSlugs.add(post.slug)
          }
        }

        // 3. Add static posts
        for (const post of blogPosts) {
          if (!addedSlugs.has(post.slug)) {
            merged.push(post)
            addedSlugs.add(post.slug)
          }
        }

        // Sort by date descending (newest first)
        merged.sort((a, b) => {
          const timeA = new Date(a.publishedAt).getTime()
          const timeB = new Date(b.publishedAt).getTime()
          return timeB - timeA
        })

        if (ignore) return
        setPosts(merged)
      } catch (error) {
        console.error('Error loading posts:', error)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  // Find the latest post whose category is 'Featured' or 'feature' (case-insensitive)
  const featuredPost = posts.find(
    (post) =>
      post.category?.toLowerCase() === 'featured' ||
      post.category?.toLowerCase() === 'feature'
  )

  // Rest of categories will show in Latest Read Section
  const secondaryPosts = featuredPost
    ? posts.filter((post) => post.slug !== featuredPost.slug)
    : posts

  return (
    <div className="min-h-screen silk-overlay">
      <section key="blog-hero" className="px-4 py-10 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
          >
            <div className="grid gap-0 overflow-hidden rounded-[calc(2rem-1px)] bg-black/75 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-10 md:p-12">
                <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[10px] sm:px-5 sm:py-2 sm:text-xs uppercase tracking-[0.32em] text-gold">
                  Beauty Journal
                </span>
                <h1 className="mt-4 sm:mt-6 font-playfair text-3xl sm:text-5xl font-bold leading-tight text-white md:text-7xl">
                  Editorial skincare guidance with a luxury brand voice.
                </h1>
                <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
                  Explore routines, ingredient insights, brand reviews, and glow-focused articles
                  designed to educate and convert with premium polish.
                </p>

                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-4">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm text-gray-200 transition-colors hover:border-gold/30 hover:text-gold"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 sm:mt-10 space-y-3 sm:space-y-4">
                  {editorialPoints.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-xs sm:text-base text-gray-300">
                      <Sparkles className="mt-1 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-gold" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[280px] sm:min-h-[360px]">
                <Image
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1400&h=1200&fit=crop&auto=format"
                  alt="Luxury skincare editorial"
                  fill
                  className="object-cover opacity-75"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-4 sm:p-6 backdrop-blur-xl">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.34em] text-gold/70">Content That Converts</p>
                    <p className="mt-2 sm:mt-3 font-playfair text-xl sm:text-3xl text-white">
                      Skincare storytelling designed to support SEO, trust, and product discovery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {featuredPost && (
        <section key="featured-post" className="px-4 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 sm:mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-[0.32em]">
                  Featured Article
                </span>
                <h2 className="mt-3 sm:mt-4 font-playfair text-3xl sm:text-4xl font-bold text-gradient-gold md:text-5xl">
                  The premium edit
                </h2>
              </div>
              <Link
                href={featuredPost.href}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-light"
              >
                Read article
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
            >
              <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[240px] sm:min-h-[360px]">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>

                <div className="flex flex-col p-6 sm:p-8 md:p-10">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                    <span className="rounded-full border border-gold/20 bg-gold/10 px-3.5 py-1.5 uppercase tracking-[0.24em] text-gold">
                      {featuredPost.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h3 className="mt-4 sm:mt-6 font-playfair text-2xl sm:text-4xl text-white">{featuredPost.title}</h3>
                  <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">{featuredPost.excerpt}</p>
                  <div className="mt-6 sm:mt-auto pt-6 sm:pt-10">
                    <Link
                      href={featuredPost.href}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs sm:px-6 sm:py-3 sm:text-base text-white transition-colors hover:border-gold/30 hover:text-gold"
                    >
                      Explore topic
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </section>
      )}

      <section key="latest-posts" className="px-4 py-10 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 sm:mb-12 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gold" />
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-white">Latest Reads</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {secondaryPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
                </div>
                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm text-gray-400">
                    <span className="text-gold">{post.category}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-3 sm:mt-4 font-playfair text-xl sm:text-2xl text-white">{post.title}</h3>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-base text-gray-300 leading-relaxed">{post.excerpt}</p>
                  <Link
                    href={post.href}
                    className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-light"
                  >
                    Explore topic
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
