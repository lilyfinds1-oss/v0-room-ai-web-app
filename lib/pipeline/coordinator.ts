import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { normalizeImage } from './stage0-normalization'
import { analyzeRoom } from './stage1-analysis'
import { RoomProfile, Placement, DesignConcept } from './pipeline-schemas'

// Mock product database for stage 6
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Modern Sofa',
    category: 'sofa',
    price: 899,
    width_cm: 220,
    height_cm: 85,
    depth_cm: 95,
    image_url: 'https://via.placeholder.com/300x200?text=Modern+Sofa',
  },
  {
    id: '2',
    name: 'Accent Chair',
    category: 'chair',
    price: 299,
    width_cm: 85,
    height_cm: 90,
    depth_cm: 85,
    image_url: 'https://via.placeholder.com/300x200?text=Accent+Chair',
  },
  {
    id: '3',
    name: 'Coffee Table',
    category: 'table',
    price: 199,
    width_cm: 120,
    height_cm: 45,
    depth_cm: 60,
    image_url: 'https://via.placeholder.com/300x200?text=Coffee+Table',
  },
]

export async function runPipeline(jobId: string, uploadId: string, sessionId: string, imageUrl: string) {
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

  try {
    console.log('[v0] Starting pipeline for job', jobId)

    // Stage 0: Image Normalization
    console.log('[v0] Running Stage 0...')
    const { normalizedUrl, metadata } = await normalizeImage(imageUrl, sessionId)
    await supabase.from('jobs').update({
      current_stage: 0,
      stage_results: { stage_0: { normalized_url: normalizedUrl, metadata } },
    }).eq('id', jobId)

    // Stage 1: Room Analysis
    console.log('[v0] Running Stage 1...')
    const roomProfile = await analyzeRoom(normalizedUrl)
    await supabase.from('jobs').update({
      current_stage: 1,
      stage_results: {
        stage_0: { normalized_url: normalizedUrl, metadata },
        stage_1: roomProfile,
      },
    }).eq('id', jobId)

    // Stages 2-7: Mock (Object Detection, Segmentation, Depth, Placement, Product Search, Selection)
    console.log('[v0] Running Stages 2-7 (mock)...')
    
    // Stage 2-7: Generate mock placements
    const mockPlacements: Placement[] = [
      {
        product_id: '1',
        x: 0.3,
        y: 0.4,
        width: 0.4,
        height: 0.35,
        rotation: 0,
        depth_zone: 'mid',
        scale_factor: 1.0,
        shadow_intensity: 0.6,
      },
      {
        product_id: '2',
        x: 0.75,
        y: 0.5,
        width: 0.2,
        height: 0.25,
        rotation: -5,
        depth_zone: 'far',
        scale_factor: 0.9,
        shadow_intensity: 0.4,
      },
      {
        product_id: '3',
        x: 0.5,
        y: 0.65,
        width: 0.3,
        height: 0.12,
        rotation: 2,
        depth_zone: 'near',
        scale_factor: 1.1,
        shadow_intensity: 0.7,
      },
    ]

    await supabase.from('jobs').update({
      current_stage: 7,
      stage_results: {
        stage_0: { normalized_url: normalizedUrl, metadata },
        stage_1: roomProfile,
        stage_2_7: {
          detected_objects: [],
          placement_plan: mockPlacements,
        },
      },
    }).eq('id', jobId)

    // Stage 8: Image Compositing
    console.log('[v0] Running Stage 8 (compositing)...')
    // This will be handled separately by compositing service
    // For now, mark as ready for compositing

    // Stage 9: Optional upscaling - skip for MVP
    console.log('[v0] Pipeline complete, ready for compositing')

    return {
      success: true,
      jobId,
      normalizedUrl,
      roomProfile,
      placements: mockPlacements,
      productIds: mockPlacements.map((p) => p.product_id),
    }
  } catch (error) {
    console.error('[v0] Pipeline error:', error)
    await supabase.from('jobs').update({
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    }).eq('id', jobId)

    throw error
  }
}
