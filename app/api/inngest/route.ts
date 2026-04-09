import { serve } from 'inngest/next'
import { inngest, designPipeline } from '@/lib/pipeline-orchestration'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [designPipeline],
})

