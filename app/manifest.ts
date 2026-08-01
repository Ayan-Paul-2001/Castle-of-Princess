import { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db/connect'
import StoreData from '@/lib/db/models/store-data'

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let faviconUrl = '/icon.svg'

  try {
    if (process.env.MONGODB_URI) {
      await connectDB()
      const faviconDoc = await StoreData.findOne({ key: 'favicon' }).lean()
      if (faviconDoc?.data && typeof faviconDoc.data === 'string' && faviconDoc.data.trim()) {
        faviconUrl = faviconDoc.data.trim()
      } else {
        const brandDoc = await StoreData.findOne({ key: 'brand_settings' }).lean()
        if (brandDoc?.data?.favicon && typeof brandDoc.data.favicon === 'string' && brandDoc.data.favicon.trim()) {
          faviconUrl = brandDoc.data.favicon.trim()
        }
      }
    }
  } catch (e) {
    // fallback
  }

  return {
    name: 'Castle of Princess',
    short_name: 'Castle of Princess',
    description: 'Discover premium Korean skincare and cosmetics at Castle of Princess.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#d4af37',
    icons: [
      {
        src: faviconUrl,
        sizes: '48x48 72x72 96x96 128x128 192x192 256x256 512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
