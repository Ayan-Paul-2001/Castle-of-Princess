import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = (await searchParams) || {}
  const rawError = params.error
  const error = Array.isArray(rawError) ? rawError[0] : rawError

  const message =
    error === 'CredentialsSignin'
      ? 'Invalid email or password. Please try again.'
      : 'Something went wrong while signing you in. Please try again.'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 silk-overlay">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-8 font-playfair text-4xl font-bold text-gradient-gold">
          Sign-in error
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-300">
          {message}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: 'gold', size: 'lg' })}
          >
            Try again
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

