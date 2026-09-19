'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ShieldCheck, Star } from 'lucide-react'
import { useCmsPage } from '@/lib/cms/use-cms-page'

export default function BrandsPage() {
  const { page } = useCmsPage('brands')

  const hero = (page.sections.find((section) => section.type === 'brands.hero')?.data ??
    {}) as any
  const promisesSection = (page.sections.find((section) => section.type === 'brands.promises')
    ?.data ?? {}) as any
  const brandGrid = (page.sections.find((section) => section.type === 'brands.grid')?.data ??
    {}) as any

  const iconMap = {
    ShieldCheck,
    Sparkles,
    Star,
  } as const

  const promises = (promisesSection.items ?? []).map((item: any) => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap] ?? Star,
  }))

  const brands = brandGrid.items ?? []

  return (
    <div className="min-h-screen silk-overlay">
      {page.sections.map((section) => {
        if (!section.enabled) return null

        switch (section.type) {
          case 'brands.hero':
            return (
              <section key={section.id} className="px-4 py-10 sm:py-20">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
                  >
                    <div className="rounded-[calc(2rem-1px)] bg-black/75 p-6 sm:p-8 backdrop-blur-2xl md:p-12">
                      <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[10px] sm:px-5 sm:py-2 sm:text-xs uppercase tracking-[0.32em] text-gold">
                        {hero.badge}
                      </span>
                      <h1 className="mt-4 sm:mt-6 max-w-3xl font-playfair text-3xl sm:text-5xl font-bold leading-tight text-white md:text-7xl">
                        {hero.title}
                      </h1>
                      <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
                        {hero.description}
                      </p>
                      <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                        <Link
                          href={hero.primaryHref}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-5 py-3 text-sm sm:px-7 sm:py-4 sm:text-base font-semibold text-black transition-opacity hover:opacity-90"
                        >
                          {hero.primaryLabel}
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                        <Link
                          href={hero.secondaryHref}
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm sm:px-7 sm:py-4 sm:text-base text-white transition-colors hover:border-gold/30 hover:text-gold"
                        >
                          {hero.secondaryLabel}
                        </Link>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.08 }}
                    className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/60"
                  >
                    <div className="relative aspect-[4/3] sm:aspect-[4/5]">
                      <Image
                        src={hero.heroImage}
                        alt={hero.heroImageAlt || hero.title}
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
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
                      <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-4 sm:p-6 backdrop-blur-xl">
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.34em] text-gold/70">
                          {hero.sideCardEyebrow}
                        </p>
                        <p className="mt-2 sm:mt-3 font-playfair text-xl sm:text-3xl text-white">
                          {hero.sideCardTitle}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>
            )
          case 'brands.promises':
            return (
              <section key={section.id} className="px-4 py-8 sm:py-10">
                <div className="mx-auto grid max-w-7xl gap-4 sm:gap-5 md:grid-cols-3">
                  {promises.map((item: any, index: number) => {
                    const Icon = item.icon

                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        className="glass rounded-[1.75rem] p-6 sm:p-7"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h2 className="mt-4 sm:mt-5 font-playfair text-xl sm:text-2xl text-white">{item.title}</h2>
                        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-400">{item.description}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </section>
            )
          case 'brands.grid':
            return (
              <section key={section.id} className="px-4 py-10 sm:py-20">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-10 sm:mb-14 text-center">
                    <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-[0.32em]">
                      {brandGrid.eyebrow}
                    </span>
                    <h2 className="mt-3 sm:mt-4 font-playfair text-3xl sm:text-4xl font-bold text-gradient-gold md:text-5xl">
                      {brandGrid.title}
                    </h2>
                    <p className="mx-auto mt-3 sm:mt-4 max-w-3xl text-sm sm:text-base text-gray-400">
                      {brandGrid.description}
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {brands.map((brand: any, index: number) => (
                      <motion.div
                        key={brand.name}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.45, delay: index * 0.06 }}
                        className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-[1px]"
                      >
                        <div className="grid h-full gap-0 rounded-[calc(2rem-1px)] bg-black/70 md:grid-cols-[0.95fr_1.05fr]">
                          <div className="relative min-h-[220px] sm:min-h-[320px]">
                            <Image
                              src={brand.image}
                              alt={brand.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 30vw"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement
                                if (target && !target.src.includes('cleanser.jpg')) {
                                  target.src = '/categories/cleanser.jpg'
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          </div>

                          <div className="flex h-full flex-col p-6 sm:p-7 md:p-8">
                            <p className="text-xs uppercase tracking-[0.32em] text-gold/70">{brand.name}</p>
                            <h3 className="mt-3 sm:mt-4 font-playfair text-2xl sm:text-3xl text-white">{brand.tagline}</h3>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300">{brand.description}</p>

                            <div className="mt-5 sm:mt-6 flex flex-wrap gap-2">
                              {brand.specialties.map((specialty: string) => (
                                <span
                                  key={specialty}
                                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] sm:px-4 sm:py-2 sm:text-xs uppercase tracking-[0.22em] text-gray-300"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>

                            <div className="mt-auto pt-6 sm:pt-8">
                              <Link
                                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-light"
                              >
                                Shop {brand.name}
                                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
