import type { Metadata } from 'next'
import { Playfair_Display, Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/layout/providers'

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
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.startsWith('http')) {
    try {
      return new URL(envUrl);
    } catch (_) {
      // ignore
    }
  }
  return new URL('http://localhost:3000');
}

const safeSiteUrl = getSafeSiteUrl();

export const metadata: Metadata = {
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
    google: 'your-google-verification-code',
  },
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
