import { Resend } from 'resend'
import nodemailer from 'nodemailer'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const resend = getResendClient()
    if (!resend) {
      return { success: false, error: new Error('RESEND_API_KEY is not configured') }
    }

    const { data, error } = await resend.emails.send({
      from: 'Castle of Princess <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  order: {
    orderNumber: string
    total: number
    products: { name: string; quantity: number; price: number }[]
  }
) {
  const productsHtml = order.products
    .map(
      (p) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #333;">${p.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center;">${p.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">৳${p.price.toLocaleString()}</td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Castle of Princess</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #000; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border-radius: 20px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.2);">
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f5e6a3 100%); padding: 40px; text-align: center;">
            <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold;">✨ Order Confirmed ✨</h1>
            <p style="margin: 10px 0 0 0; color: #000; font-size: 16px;">Thank you for your purchase!</p>
          </div>
          
          <div style="padding: 40px;">
            <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <p style="margin: 0 0 5px 0; color: #a0a0a0; font-size: 14px;">Order Number</p>
              <p style="margin: 0; color: #d4af37; font-size: 24px; font-weight: bold;">${order.orderNumber}</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse; color: #ffffff;">
              <thead>
                <tr style="color: #d4af37;">
                  <th style="padding: 12px; text-align: left;">Product</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 12px; text-align: right; color: #d4af37; font-weight: bold; font-size: 18px;">৳${order.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="color: #a0a0a0; font-size: 14px; text-align: center;">
                We'll notify you when your order ships. Track your order on our website.
              </p>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/account/orders/${order.orderNumber}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f5e6a3 100%); color: #000; padding: 14px 30px; border-radius: 30px; text-decoration: none; font-weight: bold;">
                  Track Order
                </a>
              </div>
            </div>
          </div>
          
          <div style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center;">
            <p style="margin: 0; color: #a0a0a0; font-size: 14px;">
              © 2026 Castle of Princess. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html,
  })
}

const nodemailerTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function sendVerificationCodeEmail(email: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Castle of Princess</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #000; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border-radius: 20px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.2);">
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f5e6a3 100%); padding: 40px; text-align: center;">
            <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold;">✨ Password Reset Code ✨</h1>
            <p style="margin: 10px 0 0 0; color: #000; font-size: 16px;">Castle of Princess</p>
          </div>
          
          <div style="padding: 40px; text-align: center; color: #ffffff;">
            <p style="font-size: 16px; line-height: 1.6; color: #ccc;">
              You requested to reset your password. Use the verification code below to proceed. This code is valid for <strong>10 minutes</strong>.
            </p>
            
            <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px; margin: 30px auto; max-width: 280px; letter-spacing: 6px; font-size: 32px; font-weight: bold; color: #d4af37;">
              ${code}
            </div>
            
            <p style="font-size: 14px; color: #888;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          
          <div style="background: rgba(0, 0, 0, 0.3); padding: 30px; text-align: center;">
            <p style="margin: 0; color: #a0a0a0; font-size: 14px;">
              © 2026 Castle of Princess. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    await nodemailerTransporter.sendMail({
      from: `"Castle of Princess" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Verification Code - Castle of Princess',
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Nodemailer send verification email error:', error)
    return { success: false, error }
  }
}
