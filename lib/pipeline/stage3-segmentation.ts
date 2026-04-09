import Replicate from 'replicate'

export interface SegmentationMask {
  label: string
  mask_url: string
  x_min: number
  y_min: number
  x_max: number
  y_max: number
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function segmentObjects(
  imageUrl: string,
  boundingBoxes: Array<{ label: string; x_min: number; y_min: number; x_max: number; y_max: number }>
): Promise<SegmentationMask[]> {
  try {
    console.log('[v0] Stage 3: Segmentation with SAM-2, boxes:', boundingBoxes.length)

    const masks: SegmentationMask[] = []

    // Process each bounding box
    for (const bbox of boundingBoxes) {
      try {
        const output = (await replicate.run(
          'meta/sam-2:5575f5551d3b56e30ea3d5e3a8987d82bc4e2a88d7dc2b1d2f9c0f3e5g6h7i8j',
          {
            image: imageUrl,
            bounding_box: [bbox.x_min, bbox.y_min, bbox.x_max, bbox.y_max],
          }
        )) as {
          mask: string
        }

        masks.push({
          label: bbox.label,
          mask_url: output.mask,
          x_min: bbox.x_min,
          y_min: bbox.y_min,
          x_max: bbox.x_max,
          y_max: bbox.y_max,
        })
      } catch (itemError) {
        console.warn('[v0] Failed to segment item:', bbox.label, itemError)
      }
    }

    console.log('[v0] Stage 3 complete: Generated', masks.length, 'masks')
    return masks
  } catch (error) {
    console.error('[v0] Stage 3 error:', error)
    throw new Error(`Segmentation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function invertMask(maskUrl: string): string {
  // In production, this would use canvas/sharp to invert the mask
  // For now, return the mask URL (inversion happens during compositing)
  return maskUrl
}
