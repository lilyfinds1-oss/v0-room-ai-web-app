import Replicate from 'replicate'
import { put } from '@vercel/blob'

export interface ProductImage {
  product_id: string
  original_url: string
  transparent_url: string
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function removeBackground(imageUrl: string, productId: string): Promise<ProductImage> {
  try {
    console.log('[v0] Stage 7: Background removal for product', productId)

    // Try background removal
    let transparentUrl = imageUrl
    let success = false

    try {
      const output = (await replicate.run(
        'lucataco/remove-bg:fb8af171cfa1616bbfb33057a4ab4c75b1f1dfe10cc3062992fb2d94f75cee7c',
        {
          image: imageUrl,
        }
      )) as {
        image: string
      }

      // Upload transparent PNG to Vercel Blob
      const base64 = output.image.split(',')[1] || output.image
      const buffer = Buffer.from(base64, 'base64')

      const blob = await put(`products/${productId}-transparent.png`, buffer, {
        contentType: 'image/png',
        access: 'public',
      })

      transparentUrl = blob.url
      success = true
      console.log('[v0] Background removal successful')
    } catch (removeError) {
      console.warn('[v0] Background removal failed, using original image:', removeError)
      // Fallback: use original image if removal fails
      success = false
    }

    console.log('[v0] Stage 7 complete:', success ? 'transparent PNG' : 'original image (fallback)')

    return {
      product_id: productId,
      original_url: imageUrl,
      transparent_url: transparentUrl,
    }
  } catch (error) {
    console.error('[v0] Stage 7 error:', error)
    // Return original URL as fallback
    return {
      product_id: productId,
      original_url: imageUrl,
      transparent_url: imageUrl,
    }
  }
}
