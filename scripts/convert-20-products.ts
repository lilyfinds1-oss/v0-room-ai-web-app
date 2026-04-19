import Replicate from 'replicate'
import { createClient } from '@supabase/supabase-js'
import { put } from '@vercel/blob'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function convertTo3D(imageUrl: string, productId: string): Promise<string | null> {
  console.log(`[3D] Converting ${productId}...`)
  
  try {
    const output = await replicate.run(
      'tencent/hunyuan3d-2mv',
      {
        input: {
          image: imageUrl,
          num_inference_steps: 25,
          resolution: 256,
        },
      }
    )

    if (output && (output as any).url) {
      const response = await fetch((output as any).url)
      const buffer = await response.arrayBuffer()
      
      const blob = await put(`products-3d/${productId}.glb`, Buffer.from(buffer), {
        contentType: 'model/gltf-binary',
        access: 'public',
      })
      
      console.log(`[3D] Created: ${blob.url.slice(0, 40)}`)
      return blob.url
    }
    
    return null
  } catch (error) {
    console.error(`[3D] Error:`, error)
    return null
  }
}

async function main() {
  console.log('[3D] Starting conversion for 20 products...')
  
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .is('model_3d_url', null)
    .limit(20)

  console.log(`[3D] Found ${products?.length} products without 3D`)
  
  let converted = 0
  for (const product of products || []) {
    const { data: img } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', product.id)
      .eq('is_transparent', true)
      .limit(1)
      .single()

    if (!img?.image_url) {
      console.log(`[3D] Skip ${product.name}: no image`)
      continue
    }

    const glbUrl = await convertTo3D(img.image_url, product.id)
    
    if (glbUrl) {
      await supabase
        .from('products')
        .update({ model_3d_url: glbUrl })
        .eq('id', product.id)
      
      converted++
      console.log(`[3D] Progress: ${converted}/20`)
    }

    await new Promise(r => setTimeout(r, 120000))  // Rate limit
  }

  console.log(`[3D] Done! Converted ${converted} products`)
}

main().catch(console.error)