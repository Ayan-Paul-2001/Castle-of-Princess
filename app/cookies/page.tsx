'use client'

import { motion } from 'framer-motion'

const cookieSections = [
  {
    title: 'What Are Cookies',
    paragraphs: [
      'Cookies are small data files stored on your device when you visit a website. They help remember preferences, improve performance, and support features such as login state, analytics, and marketing measurement.',
      'Castle of Princess uses cookies and similar technologies to improve browsing, understand customer behavior, and support a smoother shopping experience.',
    ],
  },
  {
    title: 'How We Use Cookies',
    paragraphs: [
      'We may use cookies to keep the website functioning properly, remember site preferences, analyze performance, and understand how users interact with product pages, content, and campaigns.',
      'Some cookies may also support marketing tools such as analytics and ad performance measurement where enabled.',
    ],
  },
  {
    title: 'Third-Party Cookies',
    paragraphs: [
      'Certain third-party services used by Castle of Princess, such as analytics, payment, advertising, or embedded services, may place their own cookies subject to their respective policies.',
      'These services may collect information needed to support reporting, security, or site functionality.',
    ],
  },
  {
    title: 'Managing Cookies',
    paragraphs: [
      'Most browsers allow you to review, block, or delete cookies through browser settings. Limiting cookies may affect the performance of some features on the site.',
      'By continuing to use Castle of Princess, you acknowledge our use of cookies as described in this policy.',
    ],
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen silk-overlay px-4 py-10 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
        >
          <div className="rounded-[calc(2rem-1px)] bg-black/75 p-6 sm:p-8 md:p-12">
            <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[10px] sm:px-5 sm:py-2 sm:text-xs uppercase tracking-[0.32em] text-gold">
              Legal
            </span>
            <h1 className="mt-4 sm:mt-6 font-playfair text-3xl sm:text-5xl font-bold text-white md:text-6xl">
              Cookie Policy
            </h1>
            <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
              This page explains how Castle of Princess uses cookies and similar technologies to
              support functionality, analytics, and customer experience.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
          {cookieSections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass rounded-[1.75rem] p-6 sm:p-8"
            >
              <h2 className="font-playfair text-2xl sm:text-3xl text-white">{section.title}</h2>
              <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed sm:leading-8 text-gray-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  )
}
