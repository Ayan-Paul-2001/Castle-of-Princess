'use client'

import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/' })}
      variant="gold"
      size="lg"
      className="w-full"
    >
      Logout
    </Button>
  )
}
