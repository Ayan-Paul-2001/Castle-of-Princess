'use client'

import { motion } from 'framer-motion'

const returnSections = [
  {
    title: 'Eligibility',
    paragraphs: [
      'Returns are accepted only for items that arrive damaged, defective, incorrect, or materially different from the order placed.',
      'For hygiene and product safety reasons, opened skincare and cosmetic items generally cannot be returned unless the product was received in a faulty condition.',
    ],
  },
  {
    title: 'Return Request Window',
    paragraphs: [
      'Customers should contact Castle of Princess within 3 days of receiving the order to begin a return or replacement request.',
      'Photos of the package, shipping label, and product condition may be required to review the request quickly.',
    ],
  },
  {
    title: 'Replacement and Refund Review',
    paragraphs: [
      'Once a case is reviewed and approved, we may offer a replacement, store credit, or refund depending on stock availability and issue type.',
      'Approved refunds are processed back through the original payment method where possible, subject to payment provider timelines.',
    ],
  },
  {
    title: 'Non-Returnable Cases',
    paragraphs: [
      'We cannot accept returns for products damaged due to misuse, patch-test reactions, preference-based dissatisfaction, or requests made outside the stated return window.',
      'Minor packaging updates from brands do not automatically qualify as return reasons if the product remains authentic and unused.',
    ],
  },
  {
    title: 'Need Help?',
    paragraphs: [
      'If there is an issue with your order, contact us through the contact page or by email with your order number and supporting photos for faster resolution.',
    ],
  },
]

export default function ReturnsPage() {
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
              Customer Policy
            </span>
            <h1 className="mt-4 sm:mt-6 font-playfair text-3xl sm:text-5xl font-bold text-white md:text-6xl">
              Return Policy
            </h1>
            <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
              This page outlines how Castle of Princess handles damaged, incorrect, or defective
              orders while protecting skincare hygiene and product authenticity.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
          {returnSections.map((section, index) => (
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
