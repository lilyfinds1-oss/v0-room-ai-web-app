import Replicate from 'replicate'
import { put } from '@vercel/blob'

export interface UpscaleResult {
  upscaled_url: string
  width: number
  height: number
  scale_factor: number
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function upscaleComposite(
  compositeUrl: string,
  scaleFactor: number = 2,
  sessionId: string,
  enableUpscaling: boolean = true
): Promise<UpscaleResult> {
  try {
    if (!enableUpscaling) {
      console.log('[v0] Stage 9: Upscaling disabled, returning original image')
      return {
        upscaled_url: compositeUrl,
        width: 1024,
        height: 1024,
        scale_factor: 1,
      }
    }

    console.log('[v0] Stage 9: Upscaling with Real-ESRGAN (scale:', scaleFactor + 'x)')

    const output = (await replicate.run(
      'nightmareai/real-esrgan:42fed498e93b4d35bbc1a1f7d1e8b8f0f3e4f5e6d7c8b9a0f1e2d3c4b5a6f7e8',
      {
        image: compositeUrl,
        scale: scaleFactor,
      }
    )) as string

    // Upload upscaled image
    const response = await fetch(output)
    if (!response.ok) throw new Error('Failed to fetch upscaled image')
    const upscaledBuffer = Buffer.from(await response.arrayBuffer())

    const key = `upscaled/${sessionId}-upscaled.jpg`
    const blob = await put(key, upscaledBuffer, {
      contentType: 'image/jpeg',
      access: 'public',
    })

    const newWidth = 1024 * scaleFactor
    const newHeight = 1024 * scaleFactor

    console.log('[v0] Stage 9 complete: Upscaled to', newWidth, 'x', newHeight)

    return {
      upscaled_url: blob.url,
      width: newWidth,
      height: newHeight,
      scale_factor: scaleFactor,
    }
  } catch (error) {
    console.error('[v0] Stage 9 error:', error)

    // Fallback: return original composite if upscaling fails
    console.log('[v0] Upscaling failed, returning original composite')
    return {
      upscaled_url: compositeUrl,
      width: 1024,
      height: 1024,
      scale_factor: 1,
    }
  }
}
