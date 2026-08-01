'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Instagram, Facebook, Twitter } from 'lucide-react'

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/products' },
    { name: 'Featured Products', href: '/products?featured=true' },
    { name: 'Best Sellers', href: '/products?sort=best-selling' },
    { name: 'Skin Concerns', href: '/concerns' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Brands', href: '/brands' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Return Policy', href: '/returns' },
    { name: 'Track Order', href: '/account/orders' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

export default function Footer() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Castle of Princess',
  })

  const [brandSettings, setBrandSettings] = useState({
    metaDescription: 'Your destination for premium Korean skincare and cosmetics. Discover authentic K-beauty products that transform your skincare routine.',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
  })

  useEffect(() => {
    const loadLocalData = () => {
      const savedStore = localStorage.getItem('cop_store_settings')
      const savedBrand = localStorage.getItem('cop_brand_settings')
      if (savedStore) {
        try {
          setStoreSettings(current => ({ ...current, ...JSON.parse(savedStore) }))
        } catch (e) {
          console.error('Error parsing store settings in footer:', e)
        }
      }
      if (savedBrand) {
        try {
          setBrandSettings(current => ({ ...current, ...JSON.parse(savedBrand) }))
        } catch (e) {
          console.error('Error parsing brand settings in footer:', e)
        }
      }
    }

    loadLocalData()

    window.addEventListener('cop:syncComplete', loadLocalData)
    window.addEventListener('cop:storeSettingsUpdated', loadLocalData)
    window.addEventListener('cop:brandSettingsUpdated', loadLocalData)
    return () => {
      window.removeEventListener('cop:syncComplete', loadLocalData)
      window.removeEventListener('cop:storeSettingsUpdated', loadLocalData)
      window.removeEventListener('cop:brandSettingsUpdated', loadLocalData)
    }
  }, [])
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-playfair text-3xl font-bold text-gradient-gold">
                {storeSettings.storeName}
              </span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              {brandSettings.metaDescription}
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href={brandSettings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 glass rounded-full text-gray-400 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={brandSettings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 glass rounded-full text-gray-400 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 glass rounded-full text-gray-400 hover:text-gold transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 text-sm hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
