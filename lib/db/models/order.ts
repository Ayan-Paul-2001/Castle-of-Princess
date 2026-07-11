import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrderProduct {
  product: string
  name: string
  image: string
  variant?: string
  quantity: number
  price: number
}

export interface IShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
}

export interface IOrder extends Document {
  orderNumber: string
  user: string
  products: IOrderProduct[]
  subtotal: number
  shippingCost: number
  discount: number
  coupon?: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: string
  shippingAddress: IShippingAddress
  trackingNumber?: string
  notes?: string
  transactionId?: string
  walletPhone?: string
  createdAt: Date
  updatedAt: Date
}

const orderProductSchema = new Schema<IOrderProduct>({
  product: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  variant: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
})

const shippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
})

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: String,
      required: true,
    },
    products: [orderProductSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    coupon: {
      type: String,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    shippingAddress: shippingAddressSchema,
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    walletPhone: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

orderSchema.index({ user: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `CP${year}${month}${String(count + 1).padStart(4, '0')}`
  }
  next()
})

if (mongoose.models.Order) {
  delete (mongoose.models as any).Order
}
const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema)

export default Order
