import { NextResponse } from 'next/server'
import { getCmsPage, type CmsPageKey } from '@/lib/cms/page-service'

export const dynamic = 'force-dynamic'


function isCmsKey(value: string): value is CmsPageKey {
  return value === 'home' || value === 'brands' || value === 'about'
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params
  if (!isCmsKey(key)) {
    return NextResponse.json({ error: 'Invalid page key' }, { status: 400 })
  }

  const page = await getCmsPage(key)
  return NextResponse.json(page)
}
