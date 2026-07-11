import Link from 'next/link'
import { Heart, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { auth } from '@/lib/auth/config'
import { buttonVariants } from '@/components/ui/button'
import { ProfileClient } from '@/components/account/profile-client'

export default async function AccountPage() {
  const session = await auth()

  const user = session?.user
  const displayName = user?.name || 'Princess Member'
  const email = user?.email || ''

  return (
    <div className="min-h-screen px-4 py-16 silk-overlay">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="text-gold font-cormorant text-lg uppercase tracking-[0.32em]">
            My Account
          </span>
          <h1 className="mt-4 font-playfair text-5xl font-bold text-gradient-gold md:text-6xl">
            Your Beauty Profile
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Manage your wishlist, track future orders, and keep your details ready for a faster checkout.
          </p>
        </div>

        {!session ? (
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold">
                  <ShieldCheck className="h-4 w-4" />
                  Secure access
                </div>
                <h2 className="mt-6 font-playfair text-3xl font-semibold text-white md:text-4xl">
                  Sign in to view your account
                </h2>
                <p className="mt-3 text-base leading-7 text-gray-300">
                  Create an account or sign in to save your wishlist and keep your checkout details ready.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[260px]">
                <Link
                  href="/auth/login?callbackUrl=%2Faccount"
                  className={buttonVariants({ variant: 'gold', size: 'lg' })}
                >
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/auth/signup?callbackUrl=%2Faccount"
                  className={buttonVariants({ variant: 'outline', size: 'lg' })}
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <ProfileClient
              initialUser={{
                id: user?.id || '',
                name: displayName,
                email: email,
              }}
            />

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Quick actions</p>
                  <h3 className="mt-4 font-playfair text-3xl font-semibold text-white">
                    Make it effortless
                  </h3>
                  <p className="mt-4 text-base leading-7 text-gray-300">
                    Keep your favorites curated and discover products matched to your glow goals.
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/products?featured=true"
                  className="group rounded-2xl border border-white/10 bg-black/40 p-6 transition-colors hover:border-gold/30"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-gold/70">Featured</p>
                  <p className="mt-4 font-playfair text-2xl text-white">Premium edit</p>
                  <p className="mt-3 text-sm text-gray-400">Curated heroes to start your routine.</p>
                  <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors group-hover:text-gold-light">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>

                <Link
                  href="/concerns"
                  className="group rounded-2xl border border-white/10 bg-black/40 p-6 transition-colors hover:border-gold/30"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-gold/70">Concerns</p>
                  <p className="mt-4 font-playfair text-2xl text-white">Find your match</p>
                  <p className="mt-3 text-sm text-gray-400">Shop by glow goals in one click.</p>
                  <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-gold transition-colors group-hover:text-gold-light">
                    Browse
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>
              </div>

              <div className="mt-10 rounded-2xl border border-gold/20 bg-gold/10 p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/80">Support</p>
                <p className="mt-4 font-playfair text-2xl text-white">Need help with your routine?</p>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  Check shipping and returns policies or reach out for product guidance.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/help" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                    Help center
                  </Link>
                  <Link href="/contact" className={buttonVariants({ variant: 'gold', size: 'lg' })}>
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
