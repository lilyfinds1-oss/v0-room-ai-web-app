import sharp from 'sharp'
import { put } from '@vercel/blob'
import { NormalizedMetadata } from './pipeline-schemas'

export async function normalizeImage(
  imageUrl: string,
  sessionId: string
): Promise<{ normalizedUrl: string; metadata: NormalizedMetadata }> {
  try {
    console.log('[v0] Stage 0: Normalizing image from', imageUrl)

    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Failed to fetch image')
    const buffer = await response.arrayBuffer()

    // Get original dimensions
    const image = sharp(buffer)
    const metadata = await image.metadata()
    const originalWidth = metadata.width || 1024
    const originalHeight = metadata.height || 1024

    // Normalize: max 1024x1024, maintain aspect ratio, no enlargement
    const normalized = sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })

    const normalizedBuffer = await normalized.toBuffer()
    const normalizedMetadata = await normalized.metadata()

    const processedWidth = normalizedMetadata.width || 1024
    const processedHeight = normalizedMetadata.height || 1024

    // Upload to Vercel Blob
    const key = `room-images/${sessionId}-normalized.jpg`
    const blob = await put(key, normalizedBuffer, {
      contentType: 'image/jpeg',
      access: 'public',
    })

    console.log('[v0] Stage 0 complete: Normalized to', processedWidth, 'x', processedHeight)

    return {
      normalizedUrl: blob.url,
      metadata: {
        original_width: originalWidth,
        original_height: originalHeight,
        processed_width: processedWidth,
        processed_height: processedHeight,
        scale_x: processedWidth / originalWidth,
        scale_y: processedHeight / originalHeight,
      },
    }
  } catch (error) {
    console.error('[v0] Stage 0 error:', error)
    throw new Error(`Image normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
