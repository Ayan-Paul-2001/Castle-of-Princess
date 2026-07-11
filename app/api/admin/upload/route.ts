import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || role !== 'admin') {
    return null
  }
  return session
}

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const folder = String(formData.get('folder') || 'castle-of-princess/cms')

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const maxBytes = 8 * 1024 * 1024
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 413 })
  }

  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
  }

  const safeFolder = folder
    .trim()
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+/, '')
    .slice(0, 80)

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const { uploadImage } = await import('@/lib/services/cloudinary.service')
    const result = await uploadImage(buffer, safeFolder || 'castle-of-princess/cms')

    if (!result) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
