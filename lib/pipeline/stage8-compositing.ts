import { createCanvas, Canvas } from 'canvas'
import { put } from '@vercel/blob'

export interface CompositeLayer {
  productId: string
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
  depth: 'far' | 'mid' | 'near'
}

export interface CompositeResult {
  composite_url: string
  width: number
  height: number
}

// Depth scaling for painter's algorithm
const DEPTH_SCALE = {
  far: { scale: 0.48, shadowBlur: 12, shadowOpacity: 0.45 },
  mid: { scale: 0.7, shadowBlur: 18, shadowOpacity: 0.6 },
  near: { scale: 1.0, shadowBlur: 24, shadowOpacity: 0.8 },
}

export async function compositeProducts(
  roomImageUrl: string,
  layers: CompositeLayer[],
  roomWidth: number,
  roomHeight: number,
  sessionId: string
): Promise<CompositeResult> {
  try {
    console.log('[v0] Stage 8: Compositing', layers.length, 'products onto room image')

    // Fetch room image
    const roomResponse = await fetch(roomImageUrl)
    if (!roomResponse.ok) throw new Error('Failed to fetch room image')
    const roomBuffer = Buffer.from(await roomResponse.arrayBuffer())

    // Create canvas
    const canvas = createCanvas(roomWidth, roomHeight)
    const ctx = canvas.getContext('2d')

    // Draw room background
    const { Image } = await import('canvas')
    const roomImage = new Image()
    roomImage.src = roomBuffer
    ctx.drawImage(roomImage, 0, 0, roomWidth, roomHeight)

    // Sort layers by depth (painter's algorithm: far → mid → near)
    const sortedLayers = [...layers].sort((a, b) => {
      const depthOrder = { far: 0, mid: 1, near: 2 }
      return depthOrder[a.depth] - depthOrder[b.depth]
    })

    // PASS 1: Draw all shadows first (painter's algorithm)
    for (const layer of sortedLayers) {
      await drawLayerShadow(ctx, layer, roomWidth, roomHeight)
    }

    // PASS 2: Draw all products (painter's algorithm)
    for (const layer of sortedLayers) {
      await drawLayerProduct(ctx, layer, roomWidth, roomHeight)
    }

    // Convert canvas to JPEG buffer
    const compositedBuffer = canvas.toBuffer('image/jpeg', { quality: 90 })

    // Upload to Vercel Blob
    const key = `composites/${sessionId}-composite.jpg`
    const blob = await put(key, compositedBuffer, {
      contentType: 'image/jpeg',
      access: 'public',
    })

    console.log('[v0] Stage 8 complete: Composite created')

    return {
      composite_url: blob.url,
      width: roomWidth,
      height: roomHeight,
    }
  } catch (error) {
    console.error('[v0] Stage 8 error:', error)
    throw new Error(`Compositing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function drawLayerShadow(
  ctx: any,
  layer: CompositeLayer,
  roomWidth: number,
  roomHeight: number
) {
  try {
    const depthConfig = DEPTH_SCALE[layer.depth]

    // Calculate scaled dimensions
    const scaledWidth = layer.width * depthConfig.scale
    const scaledHeight = layer.height * depthConfig.scale

    // Draw elliptical shadow (wider horizontally, narrower vertically)
    ctx.save()
    ctx.fillStyle = `rgba(0, 0, 0, ${depthConfig.shadowOpacity})`
    ctx.globalAlpha = depthConfig.shadowOpacity

    // Shadow position: slightly below and offset from product
    const shadowX = layer.x
    const shadowY = layer.y + scaledHeight * 0.08

    ctx.beginPath()
    ctx.ellipse(shadowX, shadowY, scaledWidth * 0.55, scaledHeight * 0.12, 0, 0, Math.PI * 2)
    ctx.fill()

    // Apply blur effect
    ctx.filter = `blur(${depthConfig.shadowBlur}px)`
    ctx.fillStyle = `rgba(0, 0, 0, ${depthConfig.shadowOpacity * 0.5})`
    ctx.fill()

    ctx.restore()
  } catch (error) {
    console.warn('[v0] Failed to draw shadow for product:', layer.productId, error)
  }
}

async function drawLayerProduct(
  ctx: any,
  layer: CompositeLayer,
  roomWidth: number,
  roomHeight: number
) {
  try {
    const depthConfig = DEPTH_SCALE[layer.depth]

    // Fetch product image
    const response = await fetch(layer.imageUrl)
    if (!response.ok) throw new Error('Failed to fetch product image')
    const buffer = Buffer.from(await response.arrayBuffer())

    const { Image } = await import('canvas')
    const productImage = new Image()
    productImage.src = buffer

    // Calculate scaled dimensions
    const scaledWidth = layer.width * depthConfig.scale
    const scaledHeight = layer.height * depthConfig.scale

    // Calculate rotation: items on left rotate left, items on right rotate right
    // angle = ((cx / room_width - 0.5) * 10)
    const normalizedX = layer.x / roomWidth
    const rotationAngle = (normalizedX - 0.5) * 10 // ±10 degrees

    // Draw product with rotation
    ctx.save()
    ctx.translate(layer.x, layer.y)
    ctx.rotate((rotationAngle * Math.PI) / 180)
    ctx.globalAlpha = 0.95
    ctx.globalCompositeOperation = 'source-over'

    // Draw centered
    ctx.drawImage(productImage, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight)

    ctx.restore()

    console.log('[v0] Composited product:', layer.productId, 'depth:', layer.depth, 'rotation:', rotationAngle.toFixed(1) + '°')
  } catch (error) {
    console.warn('[v0] Failed to composite product:', layer.productId, error)
  }
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
