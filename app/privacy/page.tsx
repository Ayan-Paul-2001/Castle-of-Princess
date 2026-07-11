'use client'

import { motion } from 'framer-motion'

const privacySections = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'Castle of Princess may collect personal information such as your name, email address, phone number, shipping address, order details, and account preferences when you browse, register, or place an order.',
      'We may also collect technical information such as device type, browser data, IP address, and site interaction patterns to improve performance, security, and user experience.',
    ],
  },
  {
    title: 'How We Use Your Information',
    paragraphs: [
      'We use your information to process orders, deliver customer support, send order updates, improve the website experience, and share relevant service or promotional communications where appropriate.',
      'Your data may also help us personalize product discovery, optimize marketing performance, and maintain the safety of our platform.',
    ],
  },
  {
    title: 'Sharing of Information',
    paragraphs: [
      'Your data may be shared only with trusted service providers involved in payment processing, shipping, analytics, email communications, and technical infrastructure required to operate Castle of Princess.',
      'We do not sell personal information to third parties for unrelated commercial use.',
    ],
  },
  {
    title: 'Data Protection',
    paragraphs: [
      'We take reasonable steps to protect your personal information through secure systems, controlled access, and trusted third-party services.',
      'Although no digital platform can guarantee absolute security, we work to minimize risk and maintain responsible handling of customer data.',
    ],
  },
  {
    title: 'Your Choices',
    paragraphs: [
      'You may contact us to request updates to your personal information, ask questions about your data, or opt out of certain promotional communications.',
      'Continued use of the website means you understand and accept this privacy policy.',
    ],
  },
]

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
              This policy explains how Castle of Princess collects, uses, and protects customer
              information across browsing, shopping, and communication touchpoints.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
          {privacySections.map((section, index) => (
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
