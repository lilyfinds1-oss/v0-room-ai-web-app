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

// Improved system prompt for structured product queries
const SYSTEM_PROMPT = `You are an Interior Design Procurement Expert. 
Your goal is to analyze a user's budget and style preference and output a structured JSON query for furniture from a database.
You must distribute the budget logically: 60% for main furniture (bed/sofa), 20% for accent pieces, 20% for accessories.`

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
    console.log('[v0] Stage 3: AI Product Selection with Llama-3.1-8b')

    const prompt = `${SYSTEM_PROMPT}

User Input:
- Budget: $${userBudget}
- Style: ${stylePreference}
- Room Type: ${roomProfile.room_type}
- Existing items: ${roomProfile.existing_furniture?.join(', ') || 'none'}

Output JSON only. No explanation. Start with { and end with }:

{
  "design_strategy": {
    "style_tag": "${stylePreference}",
    "primary_color_palette": ${JSON.stringify(roomProfile.palette?.slice(0, 3) || ['neutral'])},
    "total_budget": ${userBudget}
  },
  "product_queries": [
    {
      "category": "bed_frame|sofa|table|chair|lamp|cabinet",
      "max_price": ${Math.round(userBudget * 0.6)},
      "required_features": ["key feature 1", "key feature 2"],
      "priority": "high|medium|low",
      "position": { "x": 0.3-0.5, "y": 0.3-0.5 },
      "depth": "far|mid|near"
    }
  ],
  "design_concept": "1 sentence design idea",
  "reasoning": "why this works with budget"
}

IMPORTANT: 
- Output valid JSON only
- Use normalized coordinates (0-1) for x, y
- depth: far=back wall, mid=center, near=front
- scale is calculated from product dimensions`

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
      'meta/llama-3.1-8b-instruct',
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
