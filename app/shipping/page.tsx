'use client'

import { motion } from 'framer-motion'

const shippingSections = [
  {
    title: 'Delivery Coverage',
    paragraphs: [
      'Castle of Princess delivers skincare and cosmetics across Bangladesh. Delivery timelines may vary depending on location, courier service coverage, and seasonal demand.',
      'Some remote areas may require additional processing time based on logistics availability.',
    ],
  },
  {
    title: 'Processing Time',
    paragraphs: [
      'Orders are typically processed after payment confirmation and stock verification. Processing time may vary during campaigns, sales periods, or high-volume order windows.',
      'Customers will receive order-related updates as the shipment moves through preparation and dispatch.',
    ],
  },
  {
    title: 'Estimated Delivery Time',
    paragraphs: [
      'Inside Dhaka, delivery may usually take 1 to 3 business days after dispatch. Outside Dhaka, delivery may usually take 2 to 5 business days depending on courier performance.',
      'These timelines are estimates and may shift due to public holidays, weather conditions, or courier delays.',
    ],
  },
  {
    title: 'Shipping Charges',
    paragraphs: [
      'Shipping charges may vary based on destination, campaign rules, basket value, and courier method. Any applicable delivery cost will be shown during checkout before final order confirmation.',
      'Free shipping campaigns, if available, are subject to the specific promotional terms communicated at the time.',
    ],
  },
  {
    title: 'Order Support',
    paragraphs: [
      'If your delivery is delayed or you need help tracking an order, please contact our support team with your order number for faster assistance.',
    ],
  },
]

export default function ShippingPage() {
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
              Customer Support
            </span>
            <h1 className="mt-4 sm:mt-6 font-playfair text-3xl sm:text-5xl font-bold text-white md:text-6xl">
              Shipping Info
            </h1>
            <p className="mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
              This page outlines general shipping coverage, processing flow, delivery timing, and
              order support expectations for Castle of Princess customers.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
          {shippingSections.map((section, index) => (
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
