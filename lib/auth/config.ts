import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authConfig } from './edge-config'

/**
 * Returns the default admin credentials from env.
 * This admin is auto-created in MongoDB on first login if they don't exist.
 */
function getDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL
  const password = process.env.DEFAULT_ADMIN_PASSWORD
  const name = process.env.DEFAULT_ADMIN_NAME || 'Admin'

  if (!email || !password) return null

  return { email: email.toLowerCase().trim(), password, name }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const normalizedEmail = (credentials.email as string).toLowerCase().trim()
        const inputPassword = credentials.password as string

        const [{ connectDB }, { default: User }] = await Promise.all([
          import('@/lib/db/connect'),
          import('@/lib/db/models/user'),
        ])

        await connectDB()

        // Check if a user record exists
        let user = await User.findOne({ email: normalizedEmail })

        // ── Default admin auto-provision ─────────────────────────────────────
        // If the user doesn't exist in the DB yet, check if they are the default
        // admin. If so, create them automatically on first login.
        if (!user) {
          const defaultAdmin = getDefaultAdmin()

          if (
            defaultAdmin &&
            normalizedEmail === defaultAdmin.email &&
            inputPassword === defaultAdmin.password
          ) {
            // Create the admin record in MongoDB (password is hashed by pre-save hook)
            user = await User.create({
              email: defaultAdmin.email,
              password: defaultAdmin.password,
              name: defaultAdmin.name,
              role: 'admin',
              isVerified: true,
            })
          } else {
            throw new Error('No account found with this email')
          }
        }

        // ── Normal password check ────────────────────────────────────────────
        // Always validate against the DB record so future password resets work.
        const isPasswordValid = await user.comparePassword(inputPassword)

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
})
