import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReview extends Document {
  user: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  rating: number
  title?: string
  comment: string
  images: string[]
  isVerified: boolean
  helpful: number
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

reviewSchema.index({ product: 1 })
reviewSchema.index({ user: 1 })
reviewSchema.index({ rating: -1 })

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema)

export default Review
