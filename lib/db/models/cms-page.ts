import mongoose, { Schema, Document, Model } from 'mongoose'

export type CmsSection = {
  id: string
  type: string
  enabled: boolean
  data: unknown
}

export interface ICmsPage extends Document {
  key: string
  title: string
  sections: CmsSection[]
  createdAt: Date
  updatedAt: Date
}

const cmsSectionSchema = new Schema<CmsSection>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
)

const cmsPageSchema = new Schema<ICmsPage>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    sections: { type: [cmsSectionSchema], default: [] },
  },
  { timestamps: true }
)

const CmsPage: Model<ICmsPage> =
  mongoose.models.CmsPage || mongoose.model<ICmsPage>('CmsPage', cmsPageSchema)

export default CmsPage

