import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(11, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter your full address'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Please enter a valid postal code'),
  shippingZone: z.enum(['dhaka', 'outside'], {
    required_error: 'Please select a shipping zone',
  }),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad'], {
    required_error: 'Please select a payment method',
  }),
  walletPhone: z.string().optional(),
  walletTransactionId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'bkash' || data.paymentMethod === 'nagad') {
    if (!data.walletPhone || data.walletPhone.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter your wallet number',
        path: ['walletPhone'],
      })
    }
    if (!data.walletTransactionId || data.walletTransactionId.trim().length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter the transaction ID',
        path: ['walletTransactionId'],
      })
    }
  }
})

export const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().min(10, 'Short description is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  salePrice: z.number().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  skinTypes: z.array(z.string()),
  skinConcerns: z.array(z.string()),
  stock: z.number().min(0, 'Stock must be a positive number'),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  onSale: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ProductInput = z.infer<typeof productSchema>
