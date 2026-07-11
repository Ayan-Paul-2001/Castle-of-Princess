import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INewsletter extends Document {
  email: string
  subscribed: boolean
  subscribedAt?: Date
  unsubscribedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

const Newsletter: Model<INewsletter> = mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', newsletterSchema)

export default Newsletter
