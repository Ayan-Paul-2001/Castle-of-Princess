'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Droplets, Shield, Sparkles, SunMedium } from 'lucide-react'

const concerns = [
  {
    name: 'Acne Care',
    query: 'acne',
    description:
      'Target congestion, active breakouts, and post-acne texture with calming, clarifying skincare.',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&h=1400&fit=crop&auto=format',
    ingredients: ['BHA', 'Niacinamide', 'Tea Tree'],
  },
  {
    name: 'Dry Skin',
    query: 'dry-skin',
    description:
      'Layer moisture-rich formulas that soften roughness, support the barrier, and bring skin back to comfort.',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&h=1400&fit=crop&auto=format',
    ingredients: ['Ceramides', 'Hyaluronic Acid', 'Squalane'],
  },
  {
    name: 'Oily Skin',
    query: 'oily-skin',
    description:
      'Balance excess shine without stripping the skin using lightweight, refining Korean formulas.',
    image:
      'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=1200&h=1400&fit=crop&auto=format',
    ingredients: ['Heartleaf', 'Centella', 'Green Tea'],
  },
  {
    name: 'Sensitive Skin',
    query: 'sensitive',
    description:
      'Choose gentle routines designed to calm visible redness, reduce irritation, and keep skin resilient.',
    image:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=1200&h=1400&fit=crop&auto=format',
    ingredients: ['Panthenol', 'Mugwort', 'Madecassoside'],
  },
  {
    name: 'Glass Skin',
    query: 'glass-skin',
    description:
      'Build luminous, deeply hydrated skin with dewy layers that enhance glow and smoothness.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=1400&fit=crop&auto=format',
    ingredients: ['Rice Extract', 'Snail Mucin', 'Propolis'],
  },
  {
    name: 'Dark Spots',
    query: 'dark-spots',
    description:
      'Brighten uneven tone and support a clearer-looking complexion with tone-correcting treatments.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=1400&fit=crop&auto=format',
    ingredients: ['Vitamin C', 'Tranexamic Acid', 'Arbutin'],
  },
]

const ritualSteps = [
  {
    title: 'Cleanse Softly',
    copy: 'Start with a low-pH cleanser that respects the skin barrier and removes buildup without tightness.',
    icon: Droplets,
  },
  {
    title: 'Treat Intentionally',
    copy: 'Layer one active or calming toner/serum based on your primary concern instead of overloading the skin.',
    icon: Sparkles,
  },
  {
    title: 'Seal and Protect',
    copy: 'Finish with moisture and daytime SPF to support recovery, glow, and long-term clarity.',
    icon: Shield,
  },
]

export default function ConcernsPage() {
  return (
    <div className="min-h-screen silk-overlay">
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
          >
            <div className="grid gap-0 rounded-[calc(2rem-1px)] bg-black/75 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-8 md:p-12">
                <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-5 py-2 text-xs uppercase tracking-[0.32em] text-gold">
                  Skin Concern Edit
                </span>
                <h1 className="mt-6 font-playfair text-5xl font-bold leading-tight text-white md:text-7xl">
                  Shop your routine by what your skin needs most.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                  From acne and sensitivity to deep hydration and glow, explore curated product
                  paths built around real concerns and premium Korean formulas.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-7 py-4 font-semibold text-black transition-opacity hover:opacity-90"
                  >
                    Shop All Concerns
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/brands"
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-white transition-colors hover:border-gold/30 hover:text-gold"
                  >
                    Browse Brands
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[360px]">
                <Image
                  src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1400&h=1200&fit=crop&auto=format"
                  alt="Skincare routine editorial"
                  fill
                  className="object-cover opacity-75"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    if (target && !target.src.includes('cleanser.jpg')) {
                      target.src = '/categories/cleanser.jpg'
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-6 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.34em] text-gold/70">Personalized Discovery</p>
                    <p className="mt-3 font-playfair text-3xl text-white">
                      Matching premium K-beauty formulas to your concern-first routine.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="text-gold font-cormorant text-lg uppercase tracking-[0.32em]">
              Concern Paths
            </span>
            <h2 className="mt-4 font-playfair text-4xl font-bold text-gradient-gold md:text-5xl">
              Build a concern-led routine
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {concerns.map((concern, index) => (
              <motion.div
                key={concern.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-[4/4.3]">
                  <Image
                    src={concern.image}
                    alt={concern.name}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      if (target && !target.src.includes('cleanser.jpg')) {
                        target.src = '/categories/cleanser.jpg'
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                </div>
                <div className="p-7">
                  <h3 className="font-playfair text-3xl text-white">{concern.name}</h3>
                  <p className="mt-4 text-gray-300">{concern.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {concern.ingredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-gray-300"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/products?concern=${encodeURIComponent(concern.query)}`}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-light"
                  >
                    Shop {concern.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold">
                <SunMedium className="h-4 w-4" />
                Routine Principles
              </span>
              <h2 className="mt-5 font-playfair text-4xl font-bold text-white md:text-5xl">
                A luxury approach to everyday skin health
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-light"
            >
              Read the blog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ritualSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="glass rounded-[1.75rem] p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-playfair text-2xl text-white">{step.title}</h3>
                  <p className="mt-4 text-gray-400">{step.copy}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
