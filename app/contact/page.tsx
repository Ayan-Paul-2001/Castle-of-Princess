'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import emailjs from '@emailjs/browser'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Castle of Princess',
    supportEmail: 'hello@castleofprincess.com',
    supportPhone: '+880 1XXX-XXXXXX',
    currency: 'BDT',
    sslcommerzSandbox: true,
    freeShippingThreshold: '2000',
    location: 'Dhaka, Bangladesh',
    hours: 'Sat - Thu, 10AM - 8PM',
  })

  const [brandSettings, setBrandSettings] = useState({
    homepageHeadline: 'Premium Korean skincare for Bangladesh',
    metaDescription: 'Luxury K-beauty, curated skincare rituals, and premium beauty discovery.',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
  })

  useEffect(() => {
    const savedStore = localStorage.getItem('cop_store_settings')
    const savedBrand = localStorage.getItem('cop_brand_settings')
    if (savedStore) {
      try {
        setStoreSettings(prev => ({ ...prev, ...JSON.parse(savedStore) }))
      } catch (e) {
        console.error('Error parsing store settings in contact:', e)
      }
    }
    if (savedBrand) {
      try {
        setBrandSettings(prev => ({ ...prev, ...JSON.parse(savedBrand) }))
      } catch (e) {
        console.error('Error parsing brand settings in contact:', e)
      }
    }
  }, [])

  const contactDetails = [
    {
      title: 'Email',
      value: storeSettings.supportEmail,
      description: 'For order help, product questions, and brand collaborations.',
      icon: Mail,
    },
    {
      title: 'Phone',
      value: storeSettings.supportPhone,
      description: 'Available during our regular service hours for direct support.',
      icon: Phone,
    },
    {
      title: 'Location',
      value: storeSettings.location,
      description: 'Serving skincare customers across Bangladesh with premium delivery care.',
      icon: MapPin,
    },
    {
      title: 'Hours',
      value: storeSettings.hours,
      description: 'Customer care replies as quickly as possible during working hours.',
      icon: Clock,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (!serviceID || !templateID || !publicKey) {
      toast.error('EmailJS is not fully configured in your environment variables.')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await emailjs.send(
        serviceID,
        templateID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        publicKey
      )

      if (result.status === 200) {
        toast.success('Message sent successfully! We will get back to you soon.')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('EmailJS Error:', error)
      toast.error('An error occurred while sending. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen silk-overlay">
      <section key="contact-hero" className="px-4 py-10 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-[1px]"
          >
            <div className="grid gap-0 rounded-[calc(2rem-1px)] bg-black/75 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="p-6 sm:p-10 md:p-12 lg:p-14">
                <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[10px] sm:px-5 sm:py-2 sm:text-xs uppercase tracking-[0.32em] text-gold">
                  Contact {storeSettings.storeName}
                </span>
                <h1 className="mt-4 sm:mt-6 font-playfair text-3xl sm:text-5xl font-bold leading-tight text-white md:text-7xl">
                  Let&apos;s help you find the right skincare direction.
                </h1>
                <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-relaxed sm:leading-8 text-gray-300">
                  Reach out for product guidance, order help, partnership enquiries, or anything
                  else related to your {storeSettings.storeName} experience.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-5 py-3 text-sm sm:px-7 sm:py-4 sm:text-base font-semibold text-black transition-opacity hover:opacity-90"
                  >
                    Shop Collection
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                  <Link
                    href="/terms"
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm sm:px-7 sm:py-4 sm:text-base text-white transition-colors hover:border-gold/30 hover:text-gold"
                  >
                    View Terms
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[280px] sm:min-h-[360px]">
                <Image
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1400&h=1400&fit=crop&auto=format"
                  alt="Luxury contact editorial visual"
                  fill
                  className="object-cover opacity-80"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/45 p-4 sm:p-6 backdrop-blur-xl">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gold/70">Customer Care</p>
                    <p className="mt-2 sm:mt-3 font-playfair text-xl sm:text-3xl text-white">
                      Premium support for orders, routines, and beauty questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section key="contact-details" className="px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="space-y-4 sm:space-y-6"
          >
            {contactDetails.map((item, index) => {
              const Icon = item.icon

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="glass rounded-[1.75rem] p-5 sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-playfair text-xl sm:text-2xl text-white">{item.title}</h2>
                      <p className="mt-1 sm:mt-2 text-white/90 text-sm sm:text-base">{item.value}</p>
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed sm:leading-7 text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            <div className="glass rounded-[1.75rem] p-5 sm:p-7">
              <h3 className="font-playfair text-xl sm:text-2xl text-white">Follow the brand</h3>
              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2.5 sm:gap-3">
                <a
                  href={brandSettings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                >
                  Instagram
                </a>
                <a
                  href={brandSettings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm text-gray-300 transition-colors hover:border-gold/30 hover:text-gold"
                >
                  TikTok
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="glass rounded-[2rem] p-6 sm:p-8 md:p-10"
          >
            <h2 className="font-playfair text-2xl sm:text-4xl font-bold text-white">
              Send us a message
            </h2>
            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-gray-400">
              Tell us what you need and we will get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-full border border-white/10 bg-black/50 px-5 py-3 text-sm sm:px-6 sm:py-4 focus:outline-none focus:border-gold transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-full border border-white/10 bg-black/50 px-5 py-3 text-sm sm:px-6 sm:py-4 focus:outline-none focus:border-gold transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-full border border-white/10 bg-black/50 px-5 py-3 text-sm sm:px-6 sm:py-4 focus:outline-none focus:border-gold transition-colors"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full rounded-[1.5rem] border border-white/10 bg-black/50 px-5 py-3 text-sm sm:px-6 sm:py-4 focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Tell us more..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-3 text-sm sm:px-8 sm:py-4 sm:text-base font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
