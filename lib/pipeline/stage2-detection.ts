import Replicate from 'replicate'

export interface DetectionBoundingBox {
  label: string
  confidence: number
  x_min: number
  y_min: number
  x_max: number
  y_max: number
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function detectObjects(
  imageUrl: string,
  existingFurniture: string[],
  retryCount = 0
): Promise<DetectionBoundingBox[]> {
  const maxRetries = 1

  try {
    console.log('[v0] Stage 2: Object detection with Grounding DINO')

    // Prepare furniture list as dot-separated string
    const furnitureText = existingFurniture.join('. ')

    const output = (await replicate.run(
      'adirik/grounding-dino:b6c1372f32ab4061626059402c0432858cd20aee5ad457fa10d2cc79aa7baf5c',
      {
        image: imageUrl,
        text_prompt: furnitureText,
      }
    )) as {
      results: Array<{
        label: string
        confidence: number
        x_min: number
        y_min: number
        x_max: number
        y_max: number
      }>
    }

    const boxes = output.results.map((result) => ({
      label: result.label,
      confidence: result.confidence,
      x_min: result.x_min,
      y_min: result.y_min,
      x_max: result.x_max,
      y_max: result.y_max,
    }))

    console.log('[v0] Stage 2 complete: Detected', boxes.length, 'objects')
    return boxes
  } catch (error) {
    console.error('[v0] Stage 2 error:', error)

    if (retryCount < maxRetries) {
      console.log('[v0] Retrying Stage 2...')
      return detectObjects(imageUrl, existingFurniture, retryCount + 1)
    }

    throw new Error(`Object detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
