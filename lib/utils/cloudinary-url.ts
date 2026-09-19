export function getOptimizedImageUrl(
  urlInput?: string | { url?: string; secure_url?: string; src?: string; image?: string; href?: string } | null,
  width?: number,
  height?: number
): string {
  let urlStr: string | undefined

  if (typeof urlInput === 'string') {
    urlStr = urlInput
  } else if (urlInput && typeof urlInput === 'object') {
    const obj = urlInput as any
    urlStr = obj.url || obj.secure_url || obj.src || obj.image || obj.href
  }

  if (
    !urlStr ||
    typeof urlStr !== 'string' ||
    !urlStr.trim() ||
    urlStr.trim() === 'undefined' ||
    urlStr.trim() === 'null' ||
    urlStr.trim() === '[object Object]'
  ) {
    return '/categories/cleanser.jpg'
  }

  let cleanUrl = urlStr.trim()

  // Convert protocol-relative URLs to https
  if (cleanUrl.startsWith('//')) {
    cleanUrl = `https:${cleanUrl}`
  } else if (cleanUrl.startsWith('http://') && !cleanUrl.includes('localhost')) {
    cleanUrl = cleanUrl.replace(/^http:\/\//i, 'https://')
  }

  // Handle local categories paths with or without leading slash
  if (cleanUrl.startsWith('categories/')) {
    cleanUrl = `/${cleanUrl}`
  }

  if (cleanUrl.startsWith('/categories/')) {
    const filename = cleanUrl.replace('/categories/', '')
    if (filename.includes(' ') || filename.includes('&')) {
      return `/categories/${encodeURIComponent(decodeURIComponent(filename))}`
    }
    return cleanUrl
  }

  if (cleanUrl.startsWith('/') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl
  }

  if (!cleanUrl.includes('cloudinary.com')) {
    return cleanUrl
  }

  // If already has transformation parameters applied, return cleaned URL as-is to prevent corrupting Cloudinary syntax
  if (
    cleanUrl.includes('/upload/f_auto') ||
    cleanUrl.includes('/upload/q_auto') ||
    cleanUrl.includes('/upload/c_') ||
    cleanUrl.includes('/upload/w_') ||
    /\/upload\/[a-z0-9_,-]+\//i.test(cleanUrl)
  ) {
    return cleanUrl
  }

  let transformation = 'f_auto,q_auto:good'
  if (width) transformation += `,w_${width}`
  if (height) transformation += `,h_${height}`

  if (cleanUrl.includes('/upload/')) {
    return cleanUrl.replace('/upload/', `/upload/${transformation}/`)
  }

  return cleanUrl
}
