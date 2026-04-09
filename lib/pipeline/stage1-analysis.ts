import Replicate from 'replicate'
import { RoomProfile, RoomProfileSchema } from './pipeline-schemas'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function imageToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export async function analyzeRoom(normalizedImageUrl: string): Promise<RoomProfile> {
  try {
    console.log('[v0] Stage 1: Analyzing room with LLaVA')

    const base64Image = await imageToBase64(normalizedImageUrl)
    const dataUri = `data:image/jpeg;base64,${base64Image}`

    const prompt = `Analyze this room photo and respond ONLY with a valid JSON object. 
No explanation. No markdown. Start your response with {

Return exactly this JSON structure:
{
  "room_type": "bedroom|living room|kitchen|office|dining|bathroom|other",
  "style": "modern|minimalist|bohemian|industrial|farmhouse|luxury|eclectic|classic",
  "palette": ["#HEX1", "#HEX2", "#HEX3"],
  "mood": "warm|cool|energetic|calm|sophisticated",
  "lighting": "natural-left|natural-right|natural-center|artificial-warm|artificial-cool",
  "floor_material": "hardwood|tile|carpet|concrete|stone",
  "wall_color": "#HEX or descriptive",
  "existing_furniture": ["item1", "item2", ...],
  "missing_items": ["item1", "item2", "item3", "item4", "item5"],
  "style_notes": "brief description"
}`

    const output = await replicate.run(
      'yorickvp/llava-13b:6bfc98a381504cac29ecc0bfe048db80314b1ad4c9b0e881d7b1d0360834b358',
      {
        input: {
          image: dataUri,
          prompt: prompt,
        },
      }
    ) as string[]

    const responseText = output.join('')
    console.log('[v0] LLaVA response:', responseText.substring(0, 200))

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const validated = RoomProfileSchema.parse(parsed)

    console.log('[v0] Stage 1 complete: Room type =', validated.room_type)
    return validated
  } catch (error) {
    console.error('[v0] Stage 1 error:', error)
    throw new Error(`Room analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
