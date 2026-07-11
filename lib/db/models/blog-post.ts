import mongoose, { Schema, Document, Model } from 'mongoose'

export type BlogCoverImage = {
  url: string
  publicId?: string
  alt?: string
}

export interface IBlogPost extends Document {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  coverImage?: BlogCoverImage
  contentMarkdown: string
  status: 'draft' | 'published'
  publishedAt?: Date
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const blogCoverImageSchema = new Schema<BlogCoverImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String },
  },
  { _id: false }
)

const blogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    coverImage: { type: blogCoverImageSchema },
    contentMarkdown: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: [String], default: [] },
    },
  },
  { timestamps: true }
)

blogPostSchema.index({ status: 1 })
blogPostSchema.index({ publishedAt: -1 })
blogPostSchema.index({ title: 'text', excerpt: 'text', contentMarkdown: 'text' })

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', blogPostSchema)

export default BlogPost

