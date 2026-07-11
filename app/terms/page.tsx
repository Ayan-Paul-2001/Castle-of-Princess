'use client'

import { motion } from 'framer-motion'

const sections = [
  {
    title: 'Use of Website',
    paragraphs: [
      'By using Castle of Princess, you agree to access the website only for lawful shopping, browsing, and customer-service related activities.',
      'You may not misuse the site, interfere with security, attempt unauthorized access, or use our content for misleading commercial purposes.',
    ],
  },
  {
    title: 'Product Information',
    paragraphs: [
      'We aim to keep product descriptions, prices, availability, and skincare guidance as accurate as possible. Because brand packaging and ingredients may change, customers should review product labels before use.',
      'All skincare recommendations shared on the site are informational and should not replace medical advice for diagnosed skin conditions.',
    ],
  },
  {
    title: 'Orders and Payments',
    paragraphs: [
      'Orders are subject to acceptance, stock verification, and payment confirmation. We reserve the right to cancel or limit orders if pricing errors, payment issues, or unusual activity are detected.',
      'Payments made through approved gateways are processed according to those providers’ terms and security policies.',
    ],
  },
  {
    title: 'Intellectual Property',
    paragraphs: [
      'All branding, visual design, text, graphics, and site content on Castle of Princess remain the property of the brand unless otherwise stated.',
      'You may not copy, reproduce, republish, or commercially distribute this content without written permission.',
    ],
  },
  {
    title: 'Limitation of Liability',
    paragraphs: [
      'Castle of Princess is not liable for indirect, incidental, or consequential losses arising from use of the website, delayed delivery, or third-party service interruptions.',
      'Customers are responsible for patch-testing skincare products and choosing products appropriate for their needs.',
    ],
  },
]

export default function TermsPage() {
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
              Terms &amp; Conditions
            </h1>
            <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
              These terms govern the use of Castle of Princess, including browsing, purchasing,
              communication, and general access to the website.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
          {sections.map((section, index) => (
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
