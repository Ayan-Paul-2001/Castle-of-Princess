'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const helpSections = [
  {
    title: 'Ordering Help',
    paragraphs: [
      'If you need help placing an order, applying a coupon, or understanding payment steps, our support team can guide you through the process.',
      'We recommend reviewing your shipping details, selected products, and order summary carefully before confirming checkout.',
    ],
  },
  {
    title: 'Product Guidance',
    paragraphs: [
      'If you are unsure which skincare products fit your concern, you can contact us for general product direction based on hydration, acne care, sensitivity, brightening, and routine structure.',
      'Product guidance is informational and does not replace medical advice for diagnosed skin conditions.',
    ],
  },
  {
    title: 'Order Tracking',
    paragraphs: [
      'Once your order is confirmed and dispatched, you can follow order updates through your account or by contacting support with your order number.',
      'If a shipment appears delayed, our team can help review the current status with the courier.',
    ],
  },
  {
    title: 'Returns and Issues',
    paragraphs: [
      'If an order arrives damaged, incorrect, or defective, please contact support within the stated return request window and include supporting photos for faster review.',
      'For full details, please review the Return Policy page.',
    ],
  },
]

export default function HelpPage() {
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
              Support
            </span>
            <h1 className="mt-4 sm:mt-6 font-playfair text-3xl sm:text-5xl font-bold text-white md:text-6xl">
              Help Center
            </h1>
            <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
              Find quick guidance for ordering, product discovery, shipping questions, and support
              requests related to Castle of Princess.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
          {helpSections.map((section, index) => (
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="glass mt-8 sm:mt-10 rounded-[1.75rem] p-6 sm:p-8"
        >
          <h2 className="font-playfair text-2xl sm:text-3xl text-white">Need direct support?</h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300">
            If you still need help, contact our team and we will do our best to assist you with
            your order or product questions.
          </p>
          <Link
            href="/contact"
            className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-5 py-3 text-sm sm:px-6 sm:py-3 sm:text-base font-semibold text-black transition-opacity hover:opacity-90"
          >
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
