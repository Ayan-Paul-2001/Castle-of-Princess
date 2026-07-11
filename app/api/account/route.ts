import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/db/models/user'
import { auth } from '@/lib/auth/config'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    if (session.user.id === 'dev-admin') {
      return NextResponse.json({
        name: session.user.name,
        email: session.user.email,
        addresses: [],
      })
    }

    const dbUser = await User.findById(session.user.id)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: dbUser.name,
      email: dbUser.email,
      addresses: dbUser.addresses || [],
    })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, addresses } = await request.json()

    await connectDB()

    if (session.user.id === 'dev-admin') {
      return NextResponse.json({ success: true, name, addresses })
    }

    const dbUser = await User.findById(session.user.id)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (name !== undefined) {
      dbUser.name = name
    }

    if (addresses !== undefined) {
      dbUser.addresses = addresses
    }

    await dbUser.save()

    return NextResponse.json({
      success: true,
      name: dbUser.name,
      email: dbUser.email,
      addresses: dbUser.addresses,
    })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
  }
}
