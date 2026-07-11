import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Order from '@/lib/db/models/order'
import User from '@/lib/db/models/user'
import { auth } from '@/lib/auth/config'
import { adminOrders } from '@/lib/admin-data'

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || role !== 'admin') {
    return null
  }
  return session
}

function parseTrxIdFromNotes(notes: string): string {
  if (!notes) return ''
  const parts = notes.split('|')
  const trxPart = parts.find((p) => p.trim().startsWith('TrxID:'))
  if (trxPart) {
    return trxPart.replace('TrxID:', '').trim()
  }
  return ''
}

function parseWalletPhoneFromNotes(notes: string): string {
  if (!notes) return ''
  const parts = notes.split('|')
  const phonePart = parts.find(
    (p) => p.trim().includes('bKash:') || p.trim().includes('Nagad:')
  )
  if (phonePart) {
    const colonIndex = phonePart.indexOf(':')
    if (colonIndex !== -1) {
      return phonePart.substring(colonIndex + 1).trim()
    }
  }
  return ''
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    // Find all orders, populate user to get email
    const dbOrders = await Order.find().sort({ createdAt: -1 }).populate('user', 'email')

    const mappedDbOrders = dbOrders.map((order) => {
      const transactionId = order.transactionId || (order.notes ? parseTrxIdFromNotes(order.notes) : '')
      const walletPhone = order.walletPhone || (order.notes ? parseWalletPhoneFromNotes(order.notes) : '')
      return {
        id: order.orderNumber,
        customer: order.shippingAddress?.name || 'Guest Customer',
        email: (order.user as any)?.email || order.shippingAddress?.phone || 'guest@example.com',
        amount: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        date: new Date(order.createdAt).toISOString().split('T')[0],
        items: order.products?.reduce((sum: number, p: any) => sum + p.quantity, 0) || 0,
        city: order.shippingAddress?.city || 'Unknown',
        isDbOrder: true,
        transactionId,
        walletPhone,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
      }
    })

    // Merge with mock orders from admin-data, keeping DB orders first and removing duplicate IDs
    const dbOrderIds = new Set(mappedDbOrders.map((o) => o.id))
    const uniqueMockOrders = adminOrders.filter((o) => !dbOrderIds.has(o.id))

    return NextResponse.json([...mappedDbOrders, ...uniqueMockOrders])
  } catch (error: any) {
    console.error('Failed to fetch admin orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, status, paymentStatus } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    if (status === undefined && paymentStatus === undefined) {
      return NextResponse.json({ error: 'Missing status or paymentStatus' }, { status: 400 })
    }

    await connectDB()

    const updateFields: any = {}
    if (status !== undefined) updateFields.status = status
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus

    const order = await Order.findOneAndUpdate(
      { orderNumber: id },
      { $set: updateFields },
      { new: true }
    )

    if (!order) {
      // It might be a mock order (stored in localStorage/memory only), so we return a success response
      // to let the frontend update its local state.
      return NextResponse.json({ success: true, message: 'Mock order state update bypassed' })
    }

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error('Failed to update admin order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
