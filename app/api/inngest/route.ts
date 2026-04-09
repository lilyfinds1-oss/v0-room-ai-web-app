import { Inngest } from 'inngest'
import { serve } from 'inngest/next'
import { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']

export const inngest = new Inngest({ id: 'roomai' })

// Define events
export const roomaiEvents = {
  processRoom: inngest.createEventType({
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
  }),
}

// Stage 0: Room Analysis
export const stageRoomAnalysis = inngest.createFunction(
  { id: 'stage-0-room-analysis' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('analyze-room', async () => {
      logger.info('Stage 0: Analyzing room...', { jobId: event.data.jobId })

      // Mock room analysis - in production, use Replicate LLaVA or Claude Vision
      const analysis = {
        dimensions: {
          width: 15,
          depth: 12,
          height: 9,
        },
        existingFurniture: [
          { type: 'sofa', color: 'gray', style: 'modern' },
          { type: 'coffee_table', color: 'brown', style: 'traditional' },
        ],
        lighting: 'natural_windows_north',
        flooring: 'hardwood',
        wallColor: 'beige',
        detectedStyle: event.data.stylePreference,
        confidence: 0.92,
      }

      return analysis
    })
  }
)

// Stage 1: Budget Breakdown
export const stageBudgetBreakdown = inngest.createFunction(
  { id: 'stage-1-budget-breakdown' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('calculate-budget', async () => {
      logger.info('Stage 1: Breaking down budget...', { jobId: event.data.jobId })

      const budgetMap = {
        'budget_0_5k': 5000,
        'budget_5_10k': 10000,
        'budget_10k_plus': 25000,
      }

      const totalBudget = budgetMap[event.data.budgetRange as keyof typeof budgetMap] || 5000

      const breakdown = {
        total: totalBudget,
        furniture: totalBudget * 0.6,
        lighting: totalBudget * 0.15,
        accessories: totalBudget * 0.15,
        installation: totalBudget * 0.1,
      }

      return breakdown
    })
  }
)

// Stage 2: Furniture Placement
export const stagePlacement = inngest.createFunction(
  { id: 'stage-2-furniture-placement' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('generate-placement', async () => {
      logger.info('Stage 2: Generating furniture placement...', { jobId: event.data.jobId })

      const placementMap = {
        zones: [
          { name: 'seating', coordinates: [1, 1], priority: 'high' },
          { name: 'dining', coordinates: [8, 6], priority: 'medium' },
          { name: 'accent', coordinates: [12, 3], priority: 'low' },
        ],
        trafficFlow: 'optimized',
        symmetry: false,
      }

      return placementMap
    })
  }
)

// Stage 3: Product Search & Ranking
export const stageProductSearch = inngest.createFunction(
  { id: 'stage-3-product-search' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('search-products', async () => {
      logger.info('Stage 3: Searching for products...', { jobId: event.data.jobId })

      // Would search products database or external API
      const searchResults = {
        sofas: 15,
        chairs: 8,
        tables: 12,
        lamps: 10,
        accessories: 20,
      }

      return searchResults
    })
  }
)

// Stage 4: Product Ranking
export const stageRanking = inngest.createFunction(
  { id: 'stage-4-product-ranking' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('rank-products', async () => {
      logger.info('Stage 4: Ranking products...', { jobId: event.data.jobId })

      const rankedProducts = [
        { id: '1', name: 'Modern Sofa', score: 0.95, price: 1200 },
        { id: '2', name: 'Accent Chair', score: 0.88, price: 450 },
        { id: '3', name: 'Coffee Table', score: 0.85, price: 320 },
      ]

      return rankedProducts
    })
  }
)

// Stage 5: Final Product Selection
export const stageSelection = inngest.createFunction(
  { id: 'stage-5-product-selection' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('select-products', async () => {
      logger.info('Stage 5: Selecting final products...', { jobId: event.data.jobId })

      const selectedProducts = [
        {
          id: '1',
          name: 'Modern Sofa',
          category: 'sofa',
          price: 1200,
          image: 'https://via.placeholder.com/400',
          position: [2, 2],
          scale: 1.2,
        },
        {
          id: '2',
          name: 'Accent Chair',
          category: 'chair',
          price: 450,
          image: 'https://via.placeholder.com/300',
          position: [10, 3],
          scale: 0.9,
        },
        {
          id: '3',
          name: 'Floor Lamp',
          category: 'lamp',
          price: 280,
          image: 'https://via.placeholder.com/200',
          position: [12, 4],
          scale: 0.7,
        },
      ]

      return selectedProducts
    })
  }
)

// Stage 6: Background Removal
export const stageBackgroundRemoval = inngest.createFunction(
  { id: 'stage-6-background-removal' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('remove-background', async () => {
      logger.info('Stage 6: Removing backgrounds...', { jobId: event.data.jobId })

      // Mock: in production, use Replicate or similar for background removal
      const cleanedItems = [
        { id: '1', background_removed: true, url: 'https://via.placeholder.com/400' },
        { id: '2', background_removed: true, url: 'https://via.placeholder.com/300' },
        { id: '3', background_removed: true, url: 'https://via.placeholder.com/200' },
      ]

      return cleanedItems
    })
  }
)

// Stage 7: Image Compositing (the complex part!)
export const stageCompositing = inngest.createFunction(
  { id: 'stage-7-image-compositing' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('composite-images', async () => {
      logger.info('Stage 7: Compositing images...', { jobId: event.data.jobId })

      // Mock composite result - actual compositing happens on frontend
      const composites = [
        {
          variationNumber: 1,
          imageUrl: 'https://via.placeholder.com/800x600?text=Variation+1',
          blendMode: 'normal_soft_light',
          depthScaled: true,
        },
        {
          variationNumber: 2,
          imageUrl: 'https://via.placeholder.com/800x600?text=Variation+2',
          blendMode: 'normal_soft_light',
          depthScaled: true,
        },
        {
          variationNumber: 3,
          imageUrl: 'https://via.placeholder.com/800x600?text=Variation+3',
          blendMode: 'normal_soft_light',
          depthScaled: true,
        },
      ]

      return composites
    })
  }
)

// Stage 8: Optional Upscaling
export const stageUpscaling = inngest.createFunction(
  { id: 'stage-8-upscaling' },
  { event: 'roomai/process.room' },
  async ({ event, step, logger }) => {
    return await step.run('upscale-images', async () => {
      logger.info('Stage 8: Upscaling images...', { jobId: event.data.jobId })

      const upscaled = {
        status: 'completed',
        upscalePerformed: false, // Free tier doesn't upscale
      }

      return upscaled
    })
  }
)

// Main orchestration function
export const orchestrateDesignPipeline = inngest.createFunction(
  { id: 'orchestrate-design-pipeline' },
  { event: 'roomai/process.room' },
  async ({ event, step }) => {
    // Execute stages sequentially
    const stage0 = await step.invoke('stage-0', {
      function: stageRoomAnalysis,
      data: event,
    })

    const stage1 = await step.invoke('stage-1', {
      function: stageBudgetBreakdown,
      data: event,
    })

    const stage2 = await step.invoke('stage-2', {
      function: stagePlacement,
      data: event,
    })

    const stage3 = await step.invoke('stage-3', {
      function: stageProductSearch,
      data: event,
    })

    const stage4 = await step.invoke('stage-4', {
      function: stageRanking,
      data: event,
    })

    const stage5 = await step.invoke('stage-5', {
      function: stageSelection,
      data: event,
    })

    const stage6 = await step.invoke('stage-6', {
      function: stageBackgroundRemoval,
      data: event,
    })

    const stage7 = await step.invoke('stage-7', {
      function: stageCompositing,
      data: event,
    })

    const stage8 = await step.invoke('stage-8', {
      function: stageUpscaling,
      data: event,
    })

    return {
      jobId: event.data.jobId,
      status: 'completed',
      stages: [stage0, stage1, stage2, stage3, stage4, stage5, stage6, stage7, stage8],
    }
  }
)

export const handler = serve(inngest, [
  stageRoomAnalysis,
  stageBudgetBreakdown,
  stagePlacement,
  stageProductSearch,
  stageRanking,
  stageSelection,
  stageBackgroundRemoval,
  stageCompositing,
  stageUpscaling,
  orchestrateDesignPipeline,
])
