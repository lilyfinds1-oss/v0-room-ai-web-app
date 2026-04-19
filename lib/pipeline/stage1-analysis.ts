import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function analyzeRoom(imageUrl: string, stylePreference = 'modern'): Promise<RoomAnalysis> {
  console.log('[v0] Stage 1: Virtual room clearing with interior-design')

  try {
    // Step 1: Use interior-design to clean/stage the room
    const clearPrompt = `A clean ${stylePreference} bedroom with empty floor space, minimal clutter, neutral tones, high resolution`

    const cleanOutput = await replicate.run(
      'adirik/interior-design',
      {
        input: {
          image: imageUrl,
          prompt: clearPrompt,
          prompt_strength: 0.75,
          guidance_scale: 15,
        },
      }
    ) as string

    const cleanedRoomUrl = typeof cleanOutput === 'string' ? cleanOutput : cleanOutput[0]
    console.log('[v0] Room cleared:', cleanedRoomUrl.slice(0, 50))

    // Step 2: Analyze the cleaned room
    console.log('[v0] Stage 1b: Analyzing cleaned room with LLaVA')
    const base64Image = await imageToBase64(cleanedRoomUrl)
    const dataUri = `data:image/jpeg;base64,${base64Image}`

    const analyzePrompt = `Analyze this room photo and respond ONLY with valid JSON.
Start immediately with { and end with }

Return:
{
  "room_type": "bedroom|living_room|kitchen|office|dining|bathroom|other",
  "style": "modern|minimalist|bohemian|industrial|farmhouse|luxury|eclectic|classic",
  "palette": ["#HEX1", "#HEX2", "#HEX3"],
  "mood": "warm|cool|energetic|calm|sophisticated",
  "lighting": "natural|artificial|mixed",
  "floor_material": "hardwood|tile|carpet|concrete|stone",
  "wall_color": "color description",
  "existing_furniture": ["item1"],
  "missing_items": ["item1"],
  "style_notes": "brief"
}`

    const llavaOutput = (await replicate.run(
      'yorickvp/llava-13b',
      {
        image: dataUri,
        prompt: analyzePrompt,
      }
    )) as string

    const responseText = Array.isArray(llavaOutput) ? llavaOutput.join('') : String(llavaOutput)
    console.log('[v0] LLaVA response:', responseText.slice(0, 200))

    // Parse JSON from response
    let analysis: RoomAnalysis
    try {
      analysis = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON in LLaVA response')
      }
    }

    // Validate
    const required = ['room_type', 'style', 'palette', 'mood', 'lighting']
    for (const field of required) {
      if (!analysis[field as keyof RoomAnalysis]) {
        analysis[field as keyof RoomAnalysis] = field === 'room_type' ? 'bedroom' : field === 'style' ? 'modern' : field === 'palette' ? ['#808080', '#606060', '#404040'] : field === 'mood' ? 'calm' : 'natural'
      }
    }

    // Add cleaned room URL for later stages
    ;(analysis as any).cleaned_room_url = cleanedRoomUrl

    console.log('[v0] Stage 1 complete:', analysis.room_type, analysis.style)
    return analysis
  } catch (error) {
    console.error('[v0] Stage 1 error:', error)
    throw new Error(`Room analysis failed: ${error instanceof Error ? error.message : 'Unknown'}`)
  }
}

// Helper
async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}