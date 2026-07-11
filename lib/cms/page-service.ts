import { defaultCmsPages, type CmsPageSeed } from '@/lib/cms/default-pages'

export type CmsPageKey = CmsPageSeed['key']

async function getCmsModel() {
  const [{ connectDB }, { default: CmsPage }] = await Promise.all([
    import('@/lib/db/connect'),
    import('@/lib/db/models/cms-page'),
  ])

  await connectDB()
  return CmsPage
}

export async function getCmsPage(key: CmsPageKey) {
  if (!process.env.MONGODB_URI) {
    return defaultCmsPages[key]
  }

  try {
    const CmsPage = await getCmsModel()
    const existing = await CmsPage.findOne({ key }).lean()

    if (existing) {
      return {
        key: existing.key as CmsPageKey,
        title: existing.title,
        sections: existing.sections ?? [],
      }
    }

    const seed = defaultCmsPages[key]
    const created = await CmsPage.findOneAndUpdate(
      { key },
      { $setOnInsert: seed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()

    return {
      key: created!.key as CmsPageKey,
      title: created!.title,
      sections: created!.sections ?? [],
    }
  } catch (err: any) {
    console.error(`MongoDB connection failed for getCmsPage(${key}), falling back to defaults:`, err)
    return defaultCmsPages[key]
  }
}

export async function saveCmsPage(key: CmsPageKey, payload: { title: string; sections: any[] }) {
  if (!process.env.MONGODB_URI) {
    return {
      key,
      title: payload.title,
      sections: payload.sections,
    }
  }

  try {
    const CmsPage = await getCmsModel()
    const updated = await CmsPage.findOneAndUpdate(
      { key },
      { key, title: payload.title, sections: payload.sections },
      { upsert: true, new: true }
    ).lean()

    return {
      key: updated!.key as CmsPageKey,
      title: updated!.title,
      sections: updated!.sections ?? [],
    }
  } catch (err: any) {
    console.error(`MongoDB connection failed for saveCmsPage(${key}), falling back to payload:`, err)
    return {
      key,
      title: payload.title,
      sections: payload.sections,
    }
  }
}

