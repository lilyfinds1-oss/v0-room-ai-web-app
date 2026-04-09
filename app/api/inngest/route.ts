import { Inngest, serve } from 'inngest'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runPipeline } from '@/lib/pipeline/coordinator'
import { compositeDesign } from '@/lib/pipeline/stage8-compositing'
import fetch from 'node-fetch'

export const inngest = new Inngest({ id: 'roomai' })

// Define the main room processing event
export const processRoomEvent = inngest.createEventType({
  name: 'roomai/process.room',
  data: {
    jobId: 'string',
    uploadId: 'string',
    userId: 'string',
    imageUrl: 'string',
    roomType: 'string',
    budgetRange: 'string',
    stylePreference: 'string',
  },
})

// Main pipeline function
export const processRoomPipeline = inngest.createFunction(
  {
    id: 'roomai-process-room',
    timeoutMs: 30 * 60 * 1000, // 30 minutes
  },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    const { jobId, uploadId, userId, imageUrl, roomType, budgetRange, stylePreference } = event.data

    logger.info('Starting RoomAI pipeline', { jobId, uploadId })

    try {
      // Run the complete AI pipeline (Stages 0-7)
      const pipelineResult = await step.run('run-ai-pipeline', async () => {
        logger.info('Running AI pipeline stages 0-7...')
        const result = await runPipeline(jobId, uploadId, jobId, imageUrl)
        return result
      })

      // Prepare for compositing (Stage 8)
      const compositeResult = await step.run('composite-design', async () => {
        logger.info('Running image compositing (Stage 8)...')

        // Mock product images for now
        const productImages = new Map()
        for (const productId of pipelineResult.productIds) {
          // In production, fetch real product images from e-commerce API
          const mockImageUrl = `https://via.placeholder.com/300x300?text=Product+${productId}`
          try {
            const response = await fetch(mockImageUrl)
            if (response.ok) {
              const buffer = Buffer.from(await response.arrayBuffer())
              productImages.set(productId, buffer)
            }
          } catch (error) {
            logger.warn(`Failed to fetch product image for ${productId}`)
          }
        }

        const compositeUrl = await compositeDesign({
          roomImageUrl: pipelineResult.normalizedUrl,
          placements: pipelineResult.placements,
          metadata: {
            original_width: 1024,
            original_height: 1024,
            processed_width: 1024,
            processed_height: 1024,
            scale_x: 1,
            scale_y: 1,
          },
          sessionId: jobId,
          productImages,
        })

        return compositeUrl
      })

      // Update job with final result
      await step.run('update-job', async () => {
        logger.info('Updating job with final result...')
        
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

        // Create design record
        const { data: design, error: designError } = await supabase
          .from('designs')
          .insert({
            job_id: jobId,
            upload_id: uploadId,
            user_id: userId,
            variation_number: 1,
            design_image_url: compositeResult,
            design_image_key: `results/${jobId}-composed.jpg`,
            furniture_data: pipelineResult.placements,
            room_analysis: pipelineResult.roomProfile,
            placement_map: pipelineResult.placements,
          })
          .select()
          .single()

        if (designError) {
          logger.error('Failed to create design', { error: designError })
          throw designError
        }

        // Update job status
        await supabase
          .from('jobs')
          .update({
            status: 'completed',
            current_stage: 9,
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId)

        logger.info('Job completed successfully', { designId: design.id })
        return design
      })

      return {
        success: true,
        jobId,
        message: 'Room design generated successfully',
      }
    } catch (error) {
      logger.error('Pipeline failed', { error, jobId })

      // Update job with error
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
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', jobId)

      throw error
    }
  }
)

const inngestHandler = serve(inngest, [processRoomPipeline])

export const POST = inngestHandler
export const GET = inngestHandler
export const PUT = inngestHandler
