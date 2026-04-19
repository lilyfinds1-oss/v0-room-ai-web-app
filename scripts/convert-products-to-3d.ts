import Replicate from 'replicate'
import { createClient } from '@supabase/supabase-js'
import { put } from '@vercel/blob'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BLOB_TOKEN = process.env.BLOB_READWRITE_TOKEN || process.env.VERCEL_BLOB_REST_API_TOKEN

async function convertTo3D(imageUrl: string, productId: string): Promise<string | null> {
  console.log(`[3D] Converting ${productId} to 3D...`)
  
  try {
    // Convert 2D image to 3D model using Hunyuan3D
    const output = await replicate.run(
      'tencent/hunyuan3d-2mv',
      {
        input: {
          image: imageUrl,
          num_inference_steps: 25,
          resolution: 256,
        },
      }
    ) as any

    // Output is a GLB file - upload to Vercel Blob
    if (output && output.url) {
      const response = await fetch(output.url)
      const buffer = await response.arrayBuffer()
      
      const blob = await put(`products-3d/${productId}.glb`, Buffer.from(buffer), {
        contentType: 'model/gltf-binary',
        access: 'public',
      })
      
      console.log(`[3D] Created 3D model: ${blob.url}`)
      return blob.url
    }
    
    // Sometimes output is an array of images (preview)
    if (Array.isArray(output) && output[0]) {
      console.log(`[3D] Got preview images, not 3D model`)
      return null
    }
    
    return null
  } catch (error) {
    console.error(`[3D] Failed for ${productId}:`, error)
    return null
  }
}

async function main() {
  console.log('[3D] Starting product 3D conversion...')
  
  // Get only 20 products without 3D models (to save credits)
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .is('model_3d_url', null)  // Only products without GLB
    .limit(20)
    
  console.log(`[3D] Converting ${products?.length} products to 3D`)
  
  let converted = 0
  for (const product of products || []) {
    // Get product image
    const { data: images } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', product.id)
      .eq('is_transparent', true)
      .limit(1)
      .single()
    
    if (!images?.image_url) {
      console.log(`[3D] Skip ${product.name}: no transparent image`)
      continue
    }
    
    // Convert to 3D
    const glbUrl = await convertTo3D(images.image_url, product.id)
    
    if (glbUrl) {
      // Save GLB URL to Supabase (permanent storage)
      await supabase
        .from('products')
        .update({ model_3d_url: glbUrl })
        .eq('id', product.id)
      
      console.log(`[3D] Saved to Supabase: ${glbUrl.slice(0, 50)}`)
      
      converted++
      console.log(`[3D] Converted ${converted}/${products?.length}`)
    }
    
    // Rate limit: wait 10 seconds between calls
    await new Promise(r => setTimeout(r, 10000))
  }
  
  console.log(`[3D] Done! Converted ${converted} products to 3D`)
}

main().catch(console.error)