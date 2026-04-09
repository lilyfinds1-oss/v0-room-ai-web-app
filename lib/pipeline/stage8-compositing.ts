import { createCanvas } from 'canvas'
import fetch from 'node-fetch'
import { put } from '@vercel/blob'
import { Placement, NormalizedMetadata } from './pipeline-schemas'

interface CompositeInput {
  roomImageUrl: string
  placements: Placement[]
  metadata: NormalizedMetadata
  sessionId: string
  productImages: Map<string, Buffer>
}

async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
  return Buffer.from(await response.arrayBuffer())
}

async function loadImage(canvas: any, buffer: Buffer): Promise<any> {
  const { Image } = await import('canvas')
  const image = new Image()
  image.src = buffer
  return image
}

export async function compositeDesign(input: CompositeInput): Promise<string> {
  try {
    console.log('[v0] Stage 8: Starting image compositing')

    const { roomImageUrl, placements, metadata, sessionId, productImages } = input
    const { processed_width, processed_height } = metadata

    // Create canvas
    const canvas = createCanvas(processed_width, processed_height)
    const ctx = canvas.getContext('2d')

    // Load and draw original room image
    console.log('[v0] Loading room image...')
    const roomBuffer = await fetchImageAsBuffer(roomImageUrl)
    const roomImage = await loadImage(canvas, roomBuffer)
    ctx.drawImage(roomImage, 0, 0, processed_width, processed_height)

    // Two-pass blending for each furniture item
    for (const placement of placements) {
      try {
        console.log('[v0] Compositing product', placement.product_id)

        const productBuffer = productImages.get(placement.product_id)
        if (!productBuffer) {
          console.warn('[v0] No image buffer for product', placement.product_id)
          continue
        }

        const productImage = await loadImage(canvas, productBuffer)

        // Calculate pixel positions from normalized coordinates
        const px = placement.x * processed_width
        const py = placement.y * processed_height
        const pw = placement.width * processed_width
        const ph = placement.height * processed_height

        // PASS 1: Draw shadow (Normal blend mode = source-over)
        ctx.globalAlpha = placement.shadow_intensity * 0.5
        ctx.globalCompositeOperation = 'source-over'
        
        const shadowOffsetY = 8
        const shadowBlur = 12
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = shadowBlur
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = shadowOffsetY

        ctx.drawImage(
          productImage,
          px,
          py + shadowOffsetY,
          pw,
          ph
        )

        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // PASS 2: Draw furniture with Soft Light blending
        ctx.globalAlpha = 0.95
        ctx.globalCompositeOperation = 'soft-light'

        // Apply rotation
        if (placement.rotation !== 0) {
          ctx.save()
          const centerX = px + pw / 2
          const centerY = py + ph / 2
          ctx.translate(centerX, centerY)
          ctx.rotate((placement.rotation * Math.PI) / 180)
          ctx.drawImage(productImage, -pw / 2, -ph / 2, pw, ph)
          ctx.restore()
        } else {
          ctx.drawImage(productImage, px, py, pw, ph)
        }

        // Reset composition
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1.0
      } catch (error) {
        console.error('[v0] Error compositing product', placement.product_id, ':', error)
      }
    }

    // Convert canvas to JPEG buffer
    console.log('[v0] Converting canvas to JPEG...')
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 })

    // Upload to Vercel Blob
    console.log('[v0] Uploading composited image...')
    const key = `results/${sessionId}-composed.jpg`
    const blob = await put(key, buffer, {
      contentType: 'image/jpeg',
      access: 'public',
    })

    console.log('[v0] Stage 8 complete: Composited image uploaded')
    return blob.url
  } catch (error) {
    console.error('[v0] Stage 8 error:', error)
    throw new Error(`Image compositing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function compositeMultipleVariations(
  input: CompositeInput,
  variationCount: number
): Promise<string[]> {
  const results: string[] = []

  for (let i = 0; i < variationCount; i++) {
    console.log(`[v0] Generating variation ${i + 1} of ${variationCount}`)
    
    // Slightly vary placements for each variation
    const variedPlacements = input.placements.map((p) => ({
      ...p,
      x: p.x + (Math.random() - 0.5) * 0.05,
      y: p.y + (Math.random() - 0.5) * 0.03,
      rotation: p.rotation + (Math.random() - 0.5) * 5,
    }))

    const url = await compositeDesign({
      ...input,
      placements: variedPlacements,
      sessionId: `${input.sessionId}-v${i + 1}`,
    })

    results.push(url)
  }

  return results
}
