import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IStoreData extends Document {
  key: string
  data: any
  createdAt: Date
  updatedAt: Date
}

const storeDataSchema = new Schema<IStoreData>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const StoreData: Model<IStoreData> =
  mongoose.models.StoreData || mongoose.model<IStoreData>('StoreData', storeDataSchema)

export default StoreData
