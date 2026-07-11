import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  startsAt: Date
  expiresAt: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

couponSchema.index({ expiresAt: 1 })

couponSchema.methods.isValid = function (amount: number): boolean {
  const now = new Date()
  return (
    this.isActive &&
    now >= this.startsAt &&
    now <= this.expiresAt &&
    this.usedCount < this.usageLimit &&
    amount >= this.minAmount
  )
}

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema)

export default Coupon
