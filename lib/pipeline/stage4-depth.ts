import Replicate from 'replicate'

export interface DepthMap {
  depth_map_url: string
  min_depth: number
  max_depth: number
  width: number
  height: number
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function estimateDepth(imageUrl: string): Promise<DepthMap> {
  try {
    console.log('[v0] Stage 4: Depth estimation with Depth-Anything')

    const output = (await replicate.run(
      'adirik/depth-anything',
      {
        image: imageUrl,
      }
    )) as {
      depth: string
    }

    console.log('[v0] Stage 4 complete: Depth map generated')

    return {
      depth_map_url: output.depth,
      min_depth: 0,
      max_depth: 255,
      width: 1024,
      height: 1024,
    }
  } catch (error) {
    console.error('[v0] Stage 4 error:', error)
    throw new Error(`Depth estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function isValidFloorZone(x: number, y: number, depthValue: number): boolean {
  // Heuristic: valid floor zones typically have depth values in mid-range
  // Lower values = closer (walls), higher values = farther (ceiling)
  // Floor is usually in the middle-lower depth range
  return depthValue > 100 && depthValue < 200
}
