'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/lib/utils/validators/schemas'
import { Button } from '@/components/ui/button'

type Step = 'email' | 'code' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Step 1 Form (Email)
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // Step 3 Form (New Password)
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Handle Step 1: Send Verification Code
  const onSendCode = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to send verification code')
        return
      }

      setEmail(data.email)
      
      toast.success('Verification code has been sent to your email')

      setStep('code')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Step 2: Verify Code
  const onVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Invalid verification code')
        return
      }

      toast.success('Code verified successfully!')
      setStep('reset')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Step 3: Save New Password
  const onResetPassword = async (data: ResetPasswordInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Failed to reset password')
        return
      }

      toast.success('Password updated successfully!')
      setStep('success')
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Step 4: Success redirection
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        router.push('/auth/login')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 silk-overlay">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {step !== 'success' && (
          <button
            onClick={() => {
              if (step === 'code') setStep('email')
              else if (step === 'reset') setStep('code')
              else router.push('/auth/login')
            }}
            className="inline-flex items-center text-gray-400 hover:text-gold transition-colors mb-8 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 'email' ? 'Back to Login' : 'Back to previous step'}
          </button>
        )}

        <div className="glass rounded-3xl p-8 glow-gold overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: ENTER EMAIL */}
            {step === 'email' && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="font-playfair text-4xl font-bold text-gradient-gold mb-2">
                    Forgot Password
                  </h1>
                  <p className="text-gray-400">
                    Enter your email address to receive a verification code
                  </p>
                </div>

                <form onSubmit={handleSubmitEmail(onSendCode)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        {...registerEmail('email')}
                        className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                    {emailErrors.email && (
                      <p className="mt-2 text-sm text-red-500">{emailErrors.email.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="xl"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: VERIFY CODE */}
            {step === 'code' && (
              <motion.div
                key="code-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="font-playfair text-4xl font-bold text-gradient-gold mb-2">
                    Verify Code
                  </h1>
                  <p className="text-gray-400">
                    Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
                  </p>
                </div>

                <form onSubmit={onVerifyCode} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors text-white tracking-[0.5em] text-center font-bold text-lg"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="xl"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => onSendCode({ email })}
                      className="text-sm text-gold hover:underline bg-transparent border-none cursor-pointer"
                      disabled={isLoading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 'reset' && (
              <motion.div
                key="reset-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="font-playfair text-4xl font-bold text-gradient-gold mb-2">
                    Reset Password
                  </h1>
                  <p className="text-gray-400">
                    Create a secure new password for your account
                  </p>
                </div>

                <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...registerReset('password')}
                        className="w-full pl-12 pr-12 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {resetErrors.password && (
                      <p className="mt-2 text-sm text-red-500">{resetErrors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerReset('confirmPassword')}
                        className="w-full pl-12 pr-12 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-gold transition-colors text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors bg-transparent border-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {resetErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-500">{resetErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="xl"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS SCREEN */}
            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-6"
              >
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
                </div>
                <h1 className="font-playfair text-4xl font-bold text-gradient-gold mb-4">
                  All Set!
                </h1>
                <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                  Your password has been reset successfully. Redirecting you to login page...
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
