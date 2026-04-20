import Replicate from 'replicate'
import { createClient } from '@supabase/supabase-js'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const BLOB_TOKEN = process.env.BLOB_READWRITE_TOKEN

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  return Buffer.from(await res.arrayBuffer())
}

async function convertTo3D(imageUrl: string, productId: string): Promise<string | null> {
  console.log(`[3D] Converting ${productId}...`)
  
  try {
    const output = await replicate.run(
      'tencent/hunyuan3d-2',
      {
        input: {
          image: imageUrl,
          num_inference_steps: 25,
          resolution: 256,
        },
      }
    ) as any

    console.log('[3D] Output:', output)
    
    if (output?.url) {
      // Download the GLB
      const glbRes = await fetch(output.url)
      const buffer = await glbRes.arrayBuffer()
      
      // Upload to Vercel Blob
      const { put } = await import('@vercel/blob')
      const blob = await put(`products-3d/${productId}.glb`, Buffer.from(buffer), {
        contentType: 'model/gltf-binary',
        access: 'public',
      })
      
      console.log(`[3D] Created: ${blob.url}`)
      return blob.url
    }
    
    return null
  } catch (error: any) {
    console.error(`[3D] Error for ${productId}:`, error.message)
    return null
  }
}

async function main() {
  console.log('[3D] Starting 3D conversion for 20 products...')
  
  // Get products with transparent images but no 3D
  const { data: products } = await supabase
    .from('product_images')
    .select('product_id, image_url')
    .eq('is_transparent', true)
    .limit(20)

  console.log(`[3D] Found ${products?.length} products with transparent images`)
  
  let converted = 0
  for (const img of products || []) {
    if (!img.image_url) continue
    
    const glbUrl = await convertTo3D(img.image_url, img.product_id)
    
    if (glbUrl) {
      // Save to product_images (reuse existing columns or use image_url)
      await supabase
        .from('product_images')
        .update({ image_url: glbUrl })  // Overwrite with GLB URL
        .eq('product_id', img.product_id)
        .eq('is_transparent', true)
        .eq('image_type', 'hero')
      
      converted++
      console.log(`[3D] ${converted}/20 done`)
    }
    
    // Wait between requests (Hunyuan3D takes ~107s)
    await new Promise(r => setTimeout(r, 120000))
  }

  console.log(`[3D] Done! Converted ${converted} products`)
}

main().catch(console.error)