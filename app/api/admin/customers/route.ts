import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/db/models/user'
import Order from '@/lib/db/models/order'
import Newsletter from '@/lib/db/models/newsletter'
import { auth } from '@/lib/auth/config'
import { adminCustomers } from '@/lib/admin-data'

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || role !== 'admin') {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    // Get all users from DB with role 'user'
    const dbUsers = await User.find({ role: 'user' })

    const mappedDbCustomers = await Promise.all(
      dbUsers.map(async (user) => {
        // Find orders for this user, sorted by most recent
        const userOrders = await Order.find({ user: user._id.toString() }).sort({ createdAt: -1 })

        const spent = userOrders.reduce((sum, o) => sum + o.total, 0)
        const city = user.addresses.find((a) => a.isDefault)?.city || userOrders[0]?.shippingAddress?.city || 'N/A'
        const contactNumber = user.phone || user.addresses.find((a) => a.isDefault)?.phone || userOrders[0]?.shippingAddress?.phone || 'N/A'
        const lastOrder = userOrders[0] ? new Date(userOrders[0].createdAt).toISOString().split('T')[0] : 'N/A'

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          contactNumber,
          orders: userOrders.length,
          spent,
          city,
          status: user.status || 'active',
          lastOrder,
          isDbUser: true,
        }
      })
    )

    // Merge with mock customers from admin-data, avoiding email duplicates
    const dbEmails = new Set(mappedDbCustomers.map((c) => c.email.toLowerCase()))
    const uniqueMockCustomers = adminCustomers.filter((c) => !dbEmails.has(c.email.toLowerCase()))

    return NextResponse.json([...mappedDbCustomers, ...uniqueMockCustomers])
  } catch (error: any) {
    console.error('Failed to fetch admin customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }

    await connectDB()

    const isValidObjectId = id.match(/^[0-9a-fA-F]{24}$/)

    if (isValidObjectId) {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      )
      if (user) {
        return NextResponse.json({ success: true, user })
      }
    }

    // It's a mock customer or not found, return success so frontend updates local state
    return NextResponse.json({ success: true, message: 'Mock customer status updated' })
  } catch (error: any) {
    console.error('Failed to update customer status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const email = url.searchParams.get('email')

    if (!id && !email) {
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 })
    }

    await connectDB()

    // 1. Find the user by ID or Email
    let user = null
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id)
    }
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() })
    }

    if (user) {
      const userIdStr = user._id.toString()
      const userEmailStr = user.email.toLowerCase()

      // 2. Cascade delete from system
      // Delete user
      await User.findByIdAndDelete(user._id)
      
      // Delete orders
      await Order.deleteMany({ user: userIdStr })
      
      // Delete newsletter
      await Newsletter.deleteMany({ email: userEmailStr })

      console.log(`Cascade deleted user ${userEmailStr} and all related orders and newsletter subscriptions.`)
    }

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' })
  } catch (error: any) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
