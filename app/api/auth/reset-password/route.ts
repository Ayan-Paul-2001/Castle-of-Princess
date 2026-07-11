import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/db/models/user'
import { resetPasswordSchema } from '@/lib/utils/validators/schemas'

export async function POST(request: Request) {
  try {
    await connectDB()

    const json = await request.json()
    const { email, code, password, confirmPassword } = json

    // Validate password constraints using the shared schema
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid password inputs' },
        { status: 400 }
      )
    }

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

    // Double check token safety on final action
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

    // Save new password - pre-save hook in user model handles hashing
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
