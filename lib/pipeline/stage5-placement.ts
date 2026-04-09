import Replicate from 'replicate'

export interface PlacementPlan {
  placements: Array<{
    product_id: string
    x: number
    y: number
    z_depth: number
    scale: number
    rotation: number
  }>
  design_concept: string
  reasoning: string
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function planPlacement(
  roomProfile: Record<string, any>,
  detectedObjects: Array<{ label: string; x_min: number; y_min: number; x_max: number; y_max: number }>,
  userBudget: number,
  stylePreference: string,
  retryCount = 0,
  variationCount = 1
): Promise<PlacementPlan[]> {
  const maxRetries = 1

  try {
    console.log('[v0] Stage 5: Placement planning with GPT-4.1-nano')

    const prompt = `You are an interior designer. Given a room profile and existing furniture, suggest furniture placements.

Room Profile:
- Type: ${roomProfile.room_type}
- Style: ${roomProfile.style}
- Palette: ${roomProfile.palette.join(', ')}
- Mood: ${roomProfile.mood}
- Existing Furniture: ${roomProfile.existing_furniture.join(', ')}
- Missing Items: ${roomProfile.missing_items.join(', ')}

User Budget: $${userBudget}
Style Preference: ${stylePreference}

Respond ONLY with valid JSON. No explanation. No markdown. Start with {

Return exactly this JSON structure (up to 5 items):
{
  "placements": [
    {
      "product_name": "item name",
      "category": "sofa|chair|table|lamp|etc",
      "x": 0.1,
      "y": 0.2,
      "z_depth": "near|mid|far",
      "scale": 0.8,
      "rotation": 0
    }
  ],
  "design_concept": "overall design idea",
  "reasoning": "why these placements work"
}`

    const output = (await replicate.run(
      'openai/gpt-4.1-nano:4e5ff0e449b5e91b0e4a3517a6f78f1c0f5e6f7e8d9c0b1a2f3e4d5c6b7a8f9',
      {
        prompt: prompt,
        max_tokens: 2000,
      }
    )) as string | string[]

    const responseText = Array.isArray(output) ? output.join('') : String(output)

    // Parse JSON
    let parsed: any
    try {
      parsed = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      parsed = JSON.parse(jsonMatch[0])
    }

    // Generate variations
    const variations: PlacementPlan[] = []
    for (let i = 0; i < variationCount; i++) {
      variations.push({
        placements: (parsed.placements || []).slice(0, 5),
        design_concept: parsed.design_concept || 'Design concept',
        reasoning: parsed.reasoning || 'Design reasoning',
      })
    }

    console.log('[v0] Stage 5 complete: Generated', variations.length, 'variation(s)')
    return variations
  } catch (error) {
    console.error('[v0] Stage 5 error:', error)

    if (retryCount < maxRetries) {
      console.log('[v0] Retrying Stage 5...')
      return planPlacement(roomProfile, detectedObjects, userBudget, stylePreference, retryCount + 1, variationCount)
    }

    throw new Error(`Placement planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
