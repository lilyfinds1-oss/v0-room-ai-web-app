import Replicate from 'replicate'

export interface RoomAnalysis {
  room_type: string
  style: string
  palette: string[]
  mood: string
  lighting: string
  floor_material: string
  wall_color: string
  existing_furniture: string[]
  missing_items: string[]
  style_notes: string
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function imageToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export async function analyzeRoom(normalizedImageUrl: string, retryCount = 0): Promise<RoomAnalysis> {
  const maxRetries = 1

  try {
    console.log('[v0] Stage 1: Analyzing room with LLaVA-13b')

    const base64Image = await imageToBase64(normalizedImageUrl)
    const dataUri = `data:image/jpeg;base64,${base64Image}`

    const prompt = `Analyze this room photo and respond ONLY with a valid JSON object.
No explanation. No markdown. Start immediately with {

Return exactly this JSON structure:
{
  "room_type": "bedroom|living_room|kitchen|office|dining|bathroom|other",
  "style": "modern|minimalist|bohemian|industrial|farmhouse|luxury|eclectic|classic",
  "palette": ["#HEX1", "#HEX2", "#HEX3"],
  "mood": "warm|cool|energetic|calm|sophisticated",
  "lighting": "natural|artificial|mixed",
  "floor_material": "hardwood|tile|carpet|concrete|stone",
  "wall_color": "color description or hex",
  "existing_furniture": ["item1", "item2", "item3"],
  "missing_items": ["item1", "item2", "item3"],
  "style_notes": "brief description"
}`

    const output = (await replicate.run(
      'yorickvp/llava-13b:6bfc98a381504cac29ecc0bfe048db80314b1ad4c9b0e881d7b1d0360834b358',
      {
        image: dataUri,
        prompt: prompt,
      }
    )) as string | string[]

    const responseText = Array.isArray(output) ? output.join('') : String(output)
    console.log('[v0] LLaVA response length:', responseText.length)

    // Extract JSON from response
    let analysis: RoomAnalysis
    try {
      // Try direct parse first
      analysis = JSON.parse(responseText)
    } catch {
      // Try extracting from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1])
      } else {
        // Try finding JSON object
        const objectMatch = responseText.match(/\{[\s\S]*\}/)
        if (objectMatch) {
          analysis = JSON.parse(objectMatch[0])
        } else {
          throw new Error('No valid JSON found in response')
        }
      }
    }

    // Validate required fields
    const required = ['room_type', 'style', 'palette', 'mood', 'lighting']
    for (const field of required) {
      if (!analysis[field as keyof RoomAnalysis]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Ensure palette is array of 3 colors
    if (!Array.isArray(analysis.palette) || analysis.palette.length !== 3) {
      analysis.palette = analysis.palette?.slice(0, 3) || ['#808080', '#808080', '#808080']
    }

    // Ensure arrays exist
    analysis.existing_furniture = analysis.existing_furniture || []
    analysis.missing_items = analysis.missing_items || []

    console.log('[v0] Stage 1 complete: Room type=' + analysis.room_type + ', Style=' + analysis.style)
    return analysis
  } catch (error) {
    console.error('[v0] Stage 1 error:', error)

    // Retry once on parse error
    if (retryCount < maxRetries) {
      console.log('[v0] Retrying Stage 1 analysis...')
      return analyzeRoom(normalizedImageUrl, retryCount + 1)
    }

    throw new Error(`Room analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

