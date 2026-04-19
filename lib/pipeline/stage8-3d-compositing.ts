import { createCanvas, loadImage, Canvas } from 'canvas'
import { put } from '@vercel/blob'
import sharp from 'sharp'

export interface CompositeLayer {
  productId: string
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
  depth: 'far' | 'mid' | 'near'
  category: string
}

export interface CompositeInput {
  roomImageUrl: string
  depthMapUrl?: string
  layers: CompositeLayer[]
  roomWidth: number
  roomHeight: number
  sessionId: string
  roomPalette?: string[]
}

export interface CompositeResult {
  composite_url: string
  width: number
  height: number
}

// Depth-based configuration for realistic 3D-like rendering
const DEPTH_CONFIG = {
  far: { 
    scale: 0.48, 
    shadowBlur: 12, 
    shadowOpacity: 0.35,
    ambientLight: 0.7,
    perspective: 0.8,
    yOffset: 0.15,  // Higher placement for far items (perspective)
  },
  mid: { 
    scale: 0.70, 
    shadowBlur: 18, 
    shadowOpacity: 0.50,
    ambientLight: 0.85,
    perspective: 1.0,
    yOffset: 0.05,
  },
  near: { 
    scale: 1.0, 
    shadowBlur: 24, 
    shadowOpacity: 0.70,
    ambientLight: 1.0,
    perspective: 1.2,
    yOffset: 0,
  },
}

export async function compositeProducts3D(input: CompositeInput): Promise<CompositeResult> {
  const { roomImageUrl, depthMapUrl, layers, roomWidth, roomHeight, sessionId, roomPalette } = input

  console.log('[3D-Canvas] Starting with', layers.length, 'products, room:', roomWidth, 'x', roomHeight)

  // Create canvas matching room dimensions
  const canvas = createCanvas(roomWidth, roomHeight)
  const ctx = canvas.getContext('2d')

  // Load and draw room background
  const roomBuffer = await fetchImage(roomImageUrl)
  const roomImg = await loadImage(roomBuffer)
  ctx.drawImage(roomImg, 0, 0, roomWidth, roomHeight)

  // Apply room color grading if palette available
  if (roomPalette && roomPalette.length > 0) {
    ctx.filter = 'brightness(1.02) saturate(1.05)'
  }

  // Sort layers by depth (far first, near last)
  const depthOrder = { far: 0, mid: 1, near: 2 }
  const sortedLayers = [...layers].sort((a, b) => depthOrder[a.depth] - depthOrder[b.depth])

  // Process each product
  for (const layer of sortedLayers) {
    try {
      const config = DEPTH_CONFIG[layer.depth] || DEPTH_CONFIG.mid

      // Load product image
      const productBuffer = await fetchImage(layer.imageUrl)
      const productImg = await loadImage(productBuffer)

      // Calculate dimensions based on depth
      // Use actual product dimensions if available, otherwise scale from room
      const aspectRatio = productImg.width / productImg.height
      
      // Base size: products typically 30-90 inches, map to room pixels
      const baseWidthInches = layer.width || 36
      const inchesPerPixel = 144 / roomWidth  // Assume 12ft room
      const baseWidth = (baseWidthInches / inchesPerPixel) * config.scale
      const baseHeight = baseWidth / aspectRatio

      // Perspective adjustment: items further away appear higher (floor perspective)
      const yAdjust = config.yOffset * roomHeight
      const centerX = layer.x
      const centerY = layer.y + yAdjust

      // Create shadow first (under product)
      const shadowX = centerX + 10
      const shadowY = centerY + baseHeight * 0.45
      
      // Gradient shadow for 3D effect
      const shadowGradient = ctx.createRadialGradient(
        shadowX, shadowY, 0,
        shadowX, shadowY, baseWidth * 0.6
      )
      shadowGradient.addColorStop(0, `rgba(0,0,0,${config.shadowOpacity})`)
      shadowGradient.addColorStop(0.5, `rgba(0,0,0,${config.shadowOpacity * 0.5})`)
      shadowGradient.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.save()
      ctx.filter = 'none'
      ctx.fillStyle = shadowGradient
      ctx.beginPath()
      ctx.ellipse(shadowX, shadowY, baseWidth * 0.5, baseHeight * 0.15, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Draw product with lighting adjustment
      ctx.save()
      
      // Apply ambient light based on depth (far = darker)
      const brightness = config.ambientLight
      ctx.filter = `brightness(${brightness})`
      
      // Draw product centered at position
      ctx.drawImage(
        productImg,
        centerX - baseWidth / 2,
        centerY - baseHeight,
        baseWidth,
        baseHeight
      )

      ctx.restore()

      // Add subtle edge highlight for depth
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.fillStyle = `rgba(255,255,255,${0.1 * config.perspective})`
      ctx.fillRect(
        centerX - baseWidth / 2,
        centerY - baseHeight,
        baseWidth,
        baseHeight * 0.1
      )
      ctx.restore()

      console.log('[3D-Canvas] Placed', layer.productId, 'at depth', layer.depth, 
        'size:', Math.round(baseWidth), 'x', Math.round(baseHeight))

    } catch (err) {
      console.error('[3D-Canvas] Failed to place', layer.productId, err)
    }
  }

  // Convert to buffer and upload
  const buffer = canvas.toBuffer('image/jpeg', { quality: 92 })
  
  const blob = await put(`composites/${sessionId}-3d.jpg`, buffer, {
    contentType: 'image/jpeg',
    access: 'public',
  })

  console.log('[3D-Canvas] Done:', blob.url.slice(0, 50))

  return {
    composite_url: blob.url,
    width: roomWidth,
    height: roomHeight,
  }
}

async function fetchImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RoomAI/2.0' },
  })
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}