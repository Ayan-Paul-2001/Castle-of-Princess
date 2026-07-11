import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import StoreData from '@/lib/db/models/store-data'
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
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, data } = await request.json()

    if (!key || data === undefined) {
      return NextResponse.json({ error: 'Missing key or data' }, { status: 400 })
    }

    await connectDB()
    
    const updated = await StoreData.findOneAndUpdate(
      { key },
      { key, data },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true, key: updated.key })
  } catch (error: any) {
    console.error('Failed to save store data to MongoDB:', error)
    return NextResponse.json({ error: 'Failed to save store data' }, { status: 500 })
  }
}
