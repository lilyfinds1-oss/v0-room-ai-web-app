import { Inngest } from 'inngest'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { normalizeImage } from './pipeline/stage0-normalization'
import { analyzeRoom } from './pipeline/stage1-analysis'
import { detectObjects } from './pipeline/stage2-detection'
import { segmentObjects } from './pipeline/stage3-segmentation'
import { estimateDepth } from './pipeline/stage4-depth'
import { planPlacement } from './pipeline/stage5-placement'
import { fetchProducts } from './pipeline/stage6-products'
import { removeBackground } from './pipeline/stage7-removal'
import { compositeProducts } from './pipeline/stage8-compositing'
import { upscaleComposite } from './pipeline/stage9-upscaling'

export const inngest = new Inngest({ id: 'roomai' })

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
  { id: 'design-pipeline', retryFn: async (attempt) => attempt < 3 },
  { event: 'roomai/design.requested' },
  async ({ event, step }) => {
    const {
      jobId,
      userId,
      imageUrl,
      budget,
      stylePreference,
      variationCount = 1,
      enableUpscaling = true,
    } = event.data as PipelineInput

    try {
      // Stage 0: Normalize Image
      const stage0 = await step.run('stage-0-normalization', async () => {
        console.log('[v0] Pipeline: Starting Stage 0')
        return await normalizeImage(imageUrl, jobId)
      })

      await logPipelineStage(jobId, 0, 'Normalization', 'completed', stage0)

      // Stage 1: Room Analysis
      const stage1 = await step.run('stage-1-analysis', async () => {
        console.log('[v0] Pipeline: Starting Stage 1')
        return await analyzeRoom(stage0.normalizedUrl)
      })

      await logPipelineStage(jobId, 1, 'Room Analysis', 'completed', stage1)

      // Stage 2: Object Detection
      const stage2 = await step.run('stage-2-detection', async () => {
        console.log('[v0] Pipeline: Starting Stage 2')
        return await detectObjects(stage0.normalizedUrl, stage1.existing_furniture)
      })

      await logPipelineStage(jobId, 2, 'Object Detection', 'completed', stage2)

      // Stage 3: Segmentation
      const stage3 = await step.run('stage-3-segmentation', async () => {
        console.log('[v0] Pipeline: Starting Stage 3')
        return await segmentObjects(stage0.normalizedUrl, stage2)
      })

      await logPipelineStage(jobId, 3, 'Segmentation', 'completed', stage3)

      // Stage 4: Depth Estimation
      const stage4 = await step.run('stage-4-depth', async () => {
        console.log('[v0] Pipeline: Starting Stage 4')
        return await estimateDepth(stage0.normalizedUrl)
      })

      await logPipelineStage(jobId, 4, 'Depth Estimation', 'completed', stage4)

      // Stage 5: Placement Planning
      const stage5 = await step.run('stage-5-placement', async () => {
        console.log('[v0] Pipeline: Starting Stage 5')
        return await planPlacement(stage1, stage2, budget, stylePreference, 0, variationCount)
      })

      await logPipelineStage(jobId, 5, 'Placement Planning', 'completed', stage5)

      // Stage 6: Product Fetching
      const stage6 = await step.run('stage-6-products', async () => {
        console.log('[v0] Pipeline: Starting Stage 6')
        const products = []
        for (const variation of stage5) {
          for (const placement of variation.placements) {
            const prods = await fetchProducts(placement, budget, stylePreference)
            products.push(...prods)
          }
        }
        return products
      })

      await logPipelineStage(jobId, 6, 'Product Fetching', 'completed', stage6)

      // Stage 7: Background Removal
      const stage7 = await step.run('stage-7-removal', async () => {
        console.log('[v0] Pipeline: Starting Stage 7')
        const processed = []
        for (const product of stage6) {
          const result = await removeBackground(product.image_url, product.product_id)
          processed.push(result)
        }
        return processed
      })

      await logPipelineStage(jobId, 7, 'Background Removal', 'completed', stage7)

      // Stage 8: Compositing (for each variation)
      const stage8Results = await step.run('stage-8-compositing', async () => {
        console.log('[v0] Pipeline: Starting Stage 8')
        const results = []
        for (let i = 0; i < variationCount; i++) {
          const variation = stage5[i]
          const layers = variation.placements.map((p: any, idx: number) => ({
            productId: p.product_name,
            imageUrl: stage7[idx % stage7.length].transparent_url,
            x: stage0.metadata.processed_width * (p.x || 0.5),
            y: stage0.metadata.processed_height * (p.y || 0.5),
            width: stage0.metadata.processed_width * (p.scale || 0.3),
            height: stage0.metadata.processed_height * (p.scale || 0.3),
            depth: p.z_depth || 'mid',
          }))

          const composite = await compositeProducts(
            stage0.normalizedUrl,
            layers,
            stage0.metadata.processed_width,
            stage0.metadata.processed_height,
            `${jobId}-v${i + 1}`
          )
          results.push(composite)
        }
        return results
      })

      await logPipelineStage(jobId, 8, 'Compositing', 'completed', stage8Results)

      // Stage 9: Upscaling (for each composite)
      const stage9Results = await step.run('stage-9-upscaling', async () => {
        console.log('[v0] Pipeline: Starting Stage 9')
        const results = []
        for (let i = 0; i < stage8Results.length; i++) {
          const upscaled = await upscaleComposite(
            stage8Results[i].composite_url,
            2,
            `${jobId}-v${i + 1}`,
            enableUpscaling
          )
          results.push(upscaled)
        }
        return results
      })

      await logPipelineStage(jobId, 9, 'Upscaling', 'completed', stage9Results)

      // Update job status to completed
      await updateJobStatus(jobId, 'completed', {
        results: stage9Results,
        design_concept: stage5[0]?.design_concept,
        reasoning: stage5[0]?.reasoning,
      })

      console.log('[v0] Pipeline complete for job:', jobId)
      return { success: true, results: stage9Results }
    } catch (error) {
      console.error('[v0] Pipeline error:', error)

      // Log error stage
      await logPipelineStage(
        jobId,
        -1,
        'Pipeline',
        'failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )

      // Update job status to failed
      await updateJobStatus(jobId, 'failed', {
        error: error instanceof Error ? error.message : 'Pipeline failed',
      })

      throw error
    }
  }
)

async function logPipelineStage(
  jobId: string,
  stage: number,
  stageName: string,
  status: string,
  data: any
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    await supabase.from('pipeline_logs').insert({
      job_id: jobId,
      stage,
      stage_name: stageName,
      status,
      output_data: data,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('[v0] Failed to log pipeline stage:', error)
  }
}

async function updateJobStatus(jobId: string, status: string, metadata: any) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    await supabase
      .from('jobs')
      .update({
        status,
        metadata,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', jobId)
  } catch (error) {
    console.warn('[v0] Failed to update job status:', error)
  }
}
