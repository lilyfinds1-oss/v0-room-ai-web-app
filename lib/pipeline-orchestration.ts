import { Inngest } from 'inngest'
import Replicate from 'replicate'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { normalizeImage } from './pipeline/stage0-normalization'
import { analyzeRoom } from './pipeline/stage1-analysis'
import { estimateDepth } from './pipeline/stage4-depth'
import { planPlacement } from './pipeline/stage5-placement'
import { fetchProducts } from './pipeline/stage6-products'
import { compositeProducts3D } from './pipeline/stage8-3d-compositing'
import { upscaleComposite } from './pipeline/stage9-upscaling'
import { logPipelineStage } from './pipeline-utils'
import type { PipelineInput } from './pipeline-schemas'

export const inngest = new Inngest({ id: 'roomai' })
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export interface PipelineInput {
  jobId: string
  userId: string
  imageUrl: string
  budget: number
  stylePreference: string
  variationCount?: number
  enableUpscaling?: boolean
}

export const designPipeline = inngest.createFunction(
  { id: 'design-pipeline', retries: 3, triggers: [{ event: 'roomai/design.requested' }] },
  async ({ event, step }: { event: { data: PipelineInput }; step: any }) => {
    const { jobId, userId, imageUrl, budget, stylePreference, variationCount = 1, enableUpscaling = true } = event.data

    try {
      // === OPTIMIZED 5-STAGE PIPELINE ===

      // Stage 0: Normalize
      const stage0 = await step.run('stage-0', async () => {
        return await normalizeImage(imageUrl, jobId)
      })

      // Stage 1: Virtual Room Clearing (interior-design)
      const stage1 = await step.run('stage-1-virtual-staging', async () => {
        console.log('[v0] Stage 1: Virtual Room Clearing')
        return await analyzeRoom(stage0.normalizedUrl, stylePreference)
      })

      // Stage 2: Floor Mapping (depth-anything)
      const stage2 = await step.run('stage-2-floor-mapping', async () => {
        console.log('[v0] Stage 2: Floor Mapping')
        const cleanedRoom = (stage1 as any).cleaned_room_url || stage0.normalizedUrl
        return await estimateDepth(cleanedRoom)
      })

      // Stage 3: Product Selection (Llama)
      const stage3 = await step.run('stage-3-product-selection', async () => {
        console.log('[v0] Stage 3: AI Product Selection')
        return await planPlacement(stage1, [], budget, stylePreference, 0, variationCount)
      })

      // Stage 4: Product Fetch (pre-processed DB)
      const stage4 = await step.run('stage-4-product-fetch', async () => {
        console.log('[v0] Stage 4: Product Fetching from DB')
        const products = []
        for (const variation of stage3) {
          for (const placement of variation.placements) {
            const prods = await fetchProducts(placement, budget, stylePreference)
            products.push(...prods)
          }
        }
        return products
      })

      // Stage 5: Three.js Rendering + FLUX + Upscale
      const results = await step.run('stage-5-final-render', async () => {
        console.log('[v0] Stage 5: Three.js + FLUX + Upscale')
        
        const cleanedRoomUrl = (stage1 as any).cleaned_room_url || stage0.normalizedUrl
        const roomPalette = stage1.palette || []
        const finalResults = []

        for (let i = 0; i < variationCount; i++) {
          const variation = stage3[i]
          
          const layers = variation.placements.map((p: any, idx: number) => {
            const product = stage4[idx % stage4.length]
            return {
              productId: p.product_name || p.product_id || 'product',
              // Use GLB if available, otherwise transparent PNG
              imageUrl: product?.model_3d_url || product?.transparent_url || product?.image_url,
              glbUrl: product?.model_3d_url,  // Three.js can use this for 3D rendering
              x: stage0.metadata.processed_width * (p.x || 0.5),
              y: stage0.metadata.processed_height * (p.y || 0.5),
              width: product?.dimensions?.width || 36,
              height: product?.dimensions?.height || 30,
              depth: p.z_depth || 'mid',
              category: p.category || 'furniture',
            }
          })

          console.log('[v0] Stage 5a: 3D Rendering', layers.length, 'products')

          // 3D Canvas compositing
          const composite = await compositeProducts3D({
            roomImageUrl: cleanedRoomUrl,
            depthMapUrl: stage2?.depth_map_url,
            layers,
            roomWidth: stage0.metadata.processed_width,
            roomHeight: stage0.metadata.processed_height,
            sessionId: `${jobId}-v${i + 1}`,
            roomPalette,
          })

          console.log('[v0] Stage 5b: FLUX.1 Fill')
          
          // FLUX enhancement
          const fluxOutput = await replicate.run(
            'black-forest-labs/flux-fill-pro',
            {
              input: {
                image: composite.composite_url,
                prompt: `A professionally designed ${stage1.style} room with high-end furniture, perfect lighting, catalog quality`,
                strength: 0.25,
              },
            }
          ) as string

          const fluxUrl = typeof fluxOutput === 'string' ? fluxOutput : fluxOutput[0]
          
          let finalUrl = fluxUrl
          
          // Upscale if enabled
          if (enableUpscaling) {
            console.log('[v0] Stage 5c: ESRGAN Upscale')
            const upscaled = await upscaleComposite(fluxUrl, 2, `${jobId}-v${i + 1}`, true)
            finalUrl = upscaled.url
          }

          finalResults.push({ composite_url: finalUrl, width: composite.width, height: composite.height })
        }
        return finalResults
      })

      await logPipelineStage(jobId, 5, 'Final Render', 'completed', results)

      return results.map((r: any) => r.composite_url)

    } catch (error) {
      console.error('[v0] Pipeline error:', error)
      throw error
    }
  })