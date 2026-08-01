import type { Metadata } from 'next'
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/layout/providers'
import { connectDB } from '@/lib/db/connect'
import StoreData from '@/lib/db/models/store-data'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

function getSafeSiteUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl && envUrl.startsWith('http')) {
    try {
      return new URL(envUrl)
    } catch (_) {
      // ignore
    }
  }
  return new URL('https://castleofprincess.com')
}

async function getFaviconUrl(): Promise<string> {
  if (!process.env.MONGODB_URI) {
    return '/icon.svg'
  }
  try {
    const dbPromise = connectDB()
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
    const conn = await Promise.race([dbPromise, timeoutPromise])
    if (!conn) return '/icon.svg'

    const faviconDoc = await StoreData.findOne({ key: 'favicon' }).lean()
    if (faviconDoc?.data && typeof faviconDoc.data === 'string' && faviconDoc.data.trim()) {
      return faviconDoc.data.trim()
    }
    const brandDoc = await StoreData.findOne({ key: 'brand_settings' }).lean()
    if (brandDoc?.data?.favicon && typeof brandDoc.data.favicon === 'string' && brandDoc.data.favicon.trim()) {
      return brandDoc.data.favicon.trim()
    }
  } catch (e) {
    // Ignore DB error during static page generation / build
  }
  return '/icon.svg'
}

export async function generateMetadata(): Promise<Metadata> {
  const safeSiteUrl = getSafeSiteUrl()
  const customFavicon = await getFaviconUrl()

  return {
    title: {
      default: 'Castle of Princess | Premium Korean Skincare in Bangladesh',
      template: '%s | Castle of Princess',
    },
    description:
      'Discover premium Korean skincare and cosmetics at Castle of Princess. Shop authentic K-beauty products including COSRX, Beauty of Joseon, Anua, Some By Mi, and more. Free delivery across Bangladesh.',
    keywords: [
      'Korean skincare Bangladesh',
      'skincare products BD',
      'cosmetics Bangladesh',
      'Korean beauty products',
      'K-beauty online store',
      'COSRX Bangladesh',
      'Beauty of Joseon Bangladesh',
    ],
    authors: [{ name: 'Castle of Princess' }],
    creator: 'Castle of Princess',
    metadataBase: safeSiteUrl,
    icons: {
      icon: [
        { url: customFavicon },
        { url: customFavicon, sizes: '32x32' },
        { url: customFavicon, sizes: '48x48' },
        { url: customFavicon, sizes: '96x96' },
        { url: customFavicon, sizes: '144x144' },
        { url: customFavicon, sizes: '192x192' },
        { url: customFavicon, sizes: '512x512' },
      ],
      shortcut: [{ url: customFavicon }],
      apple: [
        { url: customFavicon, sizes: '180x180' },
      ],
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: safeSiteUrl.toString(),
      siteName: 'Castle of Princess',
      title: 'Castle of Princess | Premium Korean Skincare in Bangladesh',
      description:
        'Discover premium Korean skincare and cosmetics. Shop authentic K-beauty products with free delivery across Bangladesh.',
      images: [
        {
          url: '/categories/Cleanser.jpg',
          width: 1200,
          height: 630,
          alt: 'Castle of Princess',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Castle of Princess | Premium Korean Skincare',
      description: 'Premium Korean skincare and cosmetics in Bangladesh',
      images: ['/categories/Cleanser.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'googleb8ae0f6f145bbb98',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="font-inter" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0a0a0a',
                color: '#ffffff',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#d4af37',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
