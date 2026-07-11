import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getCmsPage, saveCmsPage, type CmsPageKey } from '@/lib/cms/page-service'

function isCmsKey(value: string): value is CmsPageKey {
  return value === 'home' || value === 'brands' || value === 'about'
}

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || role !== 'admin') {
    return null
  }
  return session
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { key } = await context.params
  if (!isCmsKey(key)) {
    return NextResponse.json({ error: 'Invalid page key' }, { status: 400 })
  }

  const page = await getCmsPage(key)
  return NextResponse.json(page)
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { key } = await context.params
  if (!isCmsKey(key)) {
    return NextResponse.json({ error: 'Invalid page key' }, { status: 400 })
  }

  const body = await request.json()

  if (!body || typeof body.title !== 'string' || !Array.isArray(body.sections)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const saved = await saveCmsPage(key, { title: body.title, sections: body.sections })
  return NextResponse.json(saved)
}
