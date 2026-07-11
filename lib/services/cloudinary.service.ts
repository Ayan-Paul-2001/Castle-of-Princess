import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

const isConfigured = Boolean(cloudName && apiKey && apiSecret)

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
}

function assertConfigured() {
  if (!isConfigured) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
    )
  }
}

export async function uploadImage(
  file: Buffer,
  folder: string = 'castle-of-princess'
): Promise<{ url: string; publicId: string } | null> {
  assertConfigured()
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(error)
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      }
    )

    uploadStream.end(file)
  })
}

export async function deleteImage(publicId: string): Promise<boolean> {
  assertConfigured()
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
  if (!url.includes('cloudinary.com')) return url

  let transformation = 'q_auto:good,f_auto'
  if (width) transformation += `,w_${width}`
  if (height) transformation += `,h_${height}`

  return url.replace('/upload/', `/upload/${transformation}/`)
}
