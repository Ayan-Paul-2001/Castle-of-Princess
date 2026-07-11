import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import User from '@/lib/db/models/user'
import { forgotPasswordSchema } from '@/lib/utils/validators/schemas'
import { sendVerificationCodeEmail } from '@/lib/services/email.service'

export async function POST(request: Request) {
  try {
    await connectDB()

    const json = await request.json()
    const parsed = forgotPasswordSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const email = parsed.data.email.trim().toLowerCase()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      )
    }

    // Generate a 6-digit numeric verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store in user record
    user.resetPasswordToken = code
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 mins expiry
    await user.save()

    // Send email using nodemailer via Gmail SMTP
    const emailResult = await sendVerificationCodeEmail(email, code)
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Verification code sent successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
