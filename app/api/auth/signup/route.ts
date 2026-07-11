import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/db/models/user'
import { signupSchema } from '@/lib/utils/validators/schemas'

export async function POST(request: Request) {
  try {
    await connectDB()
    
    const json = await request.json()
    const parsed = signupSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const name = parsed.data.name.trim()
    const email = parsed.data.email.trim().toLowerCase()
    const password = parsed.data.password

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const user = await User.create({
      name,
      email,
      password,
    })

    return NextResponse.json(
      { message: 'Account created successfully', user: { id: user._id, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
