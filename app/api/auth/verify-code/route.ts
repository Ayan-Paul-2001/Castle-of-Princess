import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/db/models/user'

export async function POST(request: Request) {
  try {
    await connectDB()

    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    const trimmedEmail = String(email).trim().toLowerCase()
    const trimmedCode = String(code).trim()

    const user = await User.findOne({ email: trimmedEmail })
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      )
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== trimmedCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return NextResponse.json(
        { error: 'Code expired. Generate new new code' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Verification code verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
