import sharp from 'sharp'
import { put } from '@vercel/blob'

export interface NormalizedMetadata {
  original_width: number
  original_height: number
  processed_width: number
  processed_height: number
  scale_x: number
  scale_y: number
  rotated_degrees: number
}

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
    const bufferNode = Buffer.from(buffer)

    // Get original dimensions
    const originalMetadata = await sharp(bufferNode).metadata()
    const originalWidth = originalMetadata.width || 1024
    const originalHeight = originalMetadata.height || 1024

    // Normalize: max 1024x1024, maintain aspect ratio, auto-rotate via EXIF
    const normalized = sharp(bufferNode)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true,
      })

    // Output as JPEG
    const jpegBuffer = await normalized.jpeg({ quality: 90, progressive: true }).toBuffer()
    const processedMetadata = await normalized.metadata()

    const processedWidth = processedMetadata.width || 1024
    const processedHeight = processedMetadata.height || 1024

    // Upload to Vercel Blob
    const key = `room-images/${sessionId}-normalized.jpg`
    const blob = await put(key, jpegBuffer, {
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
        rotated_degrees: 0, // Sharp handles rotation internally
      },
    }
  } catch (error) {
    console.error('[v0] Stage 0 error:', error)
    throw new Error(`Image normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

