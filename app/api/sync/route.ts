import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import StoreData from '@/lib/db/models/store-data'

export const dynamic = 'force-dynamic'


export async function GET() {
  try {
    await connectDB()
    const allData = await StoreData.find({}).lean()
    
    // Convert array to a key-value dictionary
    const dictionary = allData.reduce((accumulator, item) => {
      accumulator[item.key] = item.data
      return accumulator
    }, {} as Record<string, any>)

    return NextResponse.json(dictionary)
  } catch (error: any) {
    console.error('Failed to fetch store data from MongoDB:', error)
    return NextResponse.json({ error: 'Failed to fetch store data' }, { status: 500 })
  }
}

