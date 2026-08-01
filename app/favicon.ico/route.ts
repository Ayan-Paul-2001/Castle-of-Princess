import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import StoreData from '@/lib/db/models/store-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB()
      const faviconDoc = await StoreData.findOne({ key: 'favicon' }).lean()
      let faviconUrl = faviconDoc?.data && typeof faviconDoc.data === 'string' ? faviconDoc.data.trim() : null

      if (!faviconUrl) {
        const brandDoc = await StoreData.findOne({ key: 'brand_settings' }).lean()
        if (brandDoc?.data?.favicon && typeof brandDoc.data.favicon === 'string') {
          faviconUrl = brandDoc.data.favicon.trim()
        }
      }

      if (faviconUrl && faviconUrl.startsWith('http')) {
        try {
          const imageRes = await fetch(faviconUrl, { cache: 'no-store' })
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer()
            const contentType = imageRes.headers.get('content-type') || 'image/png'
            return new NextResponse(arrayBuffer, {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
              },
            })
          }
        } catch (fetchErr) {
          console.error('Failed to proxy uploaded favicon image:', fetchErr)
        }
        return NextResponse.redirect(faviconUrl)
      }
    }
  } catch (error) {
    console.error('Error serving dynamic favicon.ico:', error)
  }

  // Fallback to static default icon if no custom uploaded favicon exists in DB
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://castleofprincess.com'
  return NextResponse.redirect(new URL('/icon.svg', baseUrl))
}
