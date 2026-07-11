'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Crown, Gem, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { useCmsPage } from '@/lib/cms/use-cms-page'

export default function AboutPage() {
  const { page } = useCmsPage('about')

  const hero = (page.sections.find((section) => section.type === 'about.hero')?.data ??
    {}) as any
  const highlightsSection = (page.sections.find((section) => section.type === 'about.highlights')
    ?.data ?? {}) as any
  const mission = (page.sections.find((section) => section.type === 'about.mission')?.data ??
    {}) as any
  const pillarsSection = (page.sections.find((section) => section.type === 'about.pillars')?.data ??
    {}) as any
  const cta = (page.sections.find((section) => section.type === 'about.cta')?.data ?? {}) as any

  const iconMap = {
    ShieldCheck,
    Gem,
    Sparkles,
    Star,
  } as const

  const highlights = (highlightsSection.items ?? []).map((item: any) => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap] ?? Sparkles,
  }))

  const pillars = pillarsSection.items ?? []

  return (
    <div className="min-h-screen silk-overlay">
      {page.sections.map((section) => {
        if (!section.enabled) return null

        switch (section.type) {
          case 'about.hero':
            return (
              <section key={section.id} className="px-4 py-10 sm:py-20">
                <div className="mx-auto max-w-7xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
                  >
                    <div className="grid gap-0 rounded-[calc(2rem-1px)] bg-black/75 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="p-6 sm:p-10 md:p-12 lg:p-14">
                        <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[10px] sm:px-5 sm:py-2 sm:text-xs uppercase tracking-[0.32em] text-gold">
                          <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                          {hero.badge}
                        </span>
                        <h1 className="mt-4 sm:mt-6 font-playfair text-3xl sm:text-5xl font-bold leading-tight text-white md:text-7xl">
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

                      <div className="relative min-h-[280px] sm:min-h-[360px]">
                        <Image
                          src={hero.heroImage}
                          alt={hero.heroImageAlt || hero.title}
                          fill
                          className="object-cover opacity-80"
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
                          <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-4 sm:p-6 backdrop-blur-xl">
                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold/70">
                              {hero.sideCardEyebrow || 'Luxury Beauty House'}
                            </p>
                            <p className="mt-2 sm:mt-3 font-playfair text-xl sm:text-3xl text-white">
                              {hero.sideCardTitle ||
                                'Curated K-beauty with a polished retail atmosphere.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>
            )
          case 'about.highlights':
            return (
              <section key={section.id} className="py-10 sm:py-20 px-4">
                <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-3">
                  {highlights.map((item: any, index: number) => {
                    const Icon = item.icon

                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                        className="glass rounded-[1.75rem] p-6 sm:p-8"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h2 className="mt-5 sm:mt-6 font-playfair text-2xl sm:text-3xl text-white">{item.title}</h2>
                        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400">{item.description}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </section>
            )
          case 'about.mission':
            return (
              <section key={section.id} className="px-4 py-8 sm:py-10">
                <div className="mx-auto max-w-7xl grid gap-6 sm:gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-[2rem] border border-white/10"
                  >
                    <div className="relative aspect-[4/4.8]">
                      <Image
                        src={mission.image}
                        alt={mission.imageAlt || mission.title || 'Brand mission'}
                        fill
                        className="object-cover opacity-80"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 md:p-10"
                  >
                    <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-[0.32em]">
                      {mission.eyebrow || 'Brand Mission'}
                    </span>
                    <h2 className="mt-3 sm:mt-4 font-playfair text-3xl sm:text-4xl font-bold text-white md:text-5xl">
                      {mission.title}
                    </h2>
                    {(mission.paragraphs ?? []).map((paragraph: string, index: number) => (
                      <p
                        key={index}
                        className={index === 0 ? 'mt-4 sm:mt-6 text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300' : 'mt-3 sm:mt-5 text-xs sm:text-base text-gray-400 leading-relaxed sm:leading-8'}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </motion.div>
                </div>
              </section>
            )
          case 'about.pillars':
            return (
              <section key={section.id} className="py-10 sm:py-20 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-8 sm:mb-14 text-center">
                    <span className="text-gold font-cormorant text-base sm:text-lg uppercase tracking-[0.32em]">
                      {pillarsSection.eyebrow || 'Core Pillars'}
                    </span>
                    <h2 className="mt-3 sm:mt-4 font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-gold">
                      {pillarsSection.title || 'What defines the brand'}
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                    {pillars.map((value: any, i: number) => (
                      <motion.div
                        key={value.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="glass rounded-[1.75rem] p-6 sm:p-8 hover:glow-gold transition-all"
                      >
                        <h3 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                          {value.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400">{value.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )
          case 'about.cta':
            return (
              <section key={section.id} className="py-10 sm:py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="glass rounded-[2rem] p-6 sm:p-12 glow-gold"
                  >
                    <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-gradient-gold mb-4 sm:mb-6">
                      {cta.title}
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-lg mb-6 sm:mb-8">
                      {cta.description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                      <Link
                        href={cta.primaryHref}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-3 text-sm sm:px-8 sm:py-4 sm:text-base font-bold text-black transition-opacity hover:opacity-90"
                      >
                        {cta.primaryLabel}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                      <Link
                        href={cta.secondaryHref}
                        className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm sm:px-8 sm:py-4 sm:text-base text-white transition-colors hover:border-gold/30 hover:text-gold"
                      >
                        {cta.secondaryLabel}
                      </Link>
                    </div>
                  </motion.div>
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
