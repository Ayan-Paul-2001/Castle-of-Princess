import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProductImage {
  url: string
  alt: string
  isPrimary: boolean
}

export interface IProductVariant {
  name: string
  value: string
  stock: number
  priceModifier: number
}

export interface IProductSEO {
  title: string
  description: string
  keywords: string[]
}

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  salePrice?: number
  images: IProductImage[]
  category: mongoose.Types.ObjectId
  brand: string
  skinTypes: string[]
  skinConcerns: string[]
  variants: IProductVariant[]
  stock: number
  ingredients?: string
  howToUse?: string
  tags: string[]
  rating: number
  reviewCount: number
  featured: boolean
  trending: boolean
  onSale: boolean
  seo?: IProductSEO
  createdAt: Date
  updatedAt: Date
}

const productImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  alt: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
})

const productVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  priceModifier: { type: Number, default: 0 },
})

const productSEOSchema = new Schema<IProductSEO>({
  title: { type: String },
  description: { type: String },
  keywords: [String],
})

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    images: [productImageSchema],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    skinTypes: [
      {
        type: String,
        enum: ['dry', 'oily', 'combination', 'sensitive', 'normal'],
      },
    ],
    skinConcerns: [
      {
        type: String,
        enum: ['acne', 'aging', 'brightening', 'hydration', 'pore', 'dark spots'],
      },
    ],
    variants: [productVariantSchema],
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    ingredients: {
      type: String,
    },
    howToUse: {
      type: String,
    },
    tags: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    seo: productSEOSchema,
  },
  {
    timestamps: true,
  }
)

productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ price: 1 })
productSchema.index({ featured: 1, trending: 1 })

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)

export default Product
