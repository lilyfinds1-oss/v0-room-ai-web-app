import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface ProductMatch {
  product_id: string
  source_id: string
  title: string
  price: number
  image_url: string
  transparent_url?: string
  model_3d_url?: string
  dimensions: {
    width: number
    depth: number
    height: number
  }
  category: string
  style: string
  score: number
}

export async function fetchProducts(
  placement: {
    product_name: string
    category: string
    scale: number
    max_price?: number
  },
  budget: number,
  stylePreference: string
): Promise<ProductMatch[]> {
  try {
    console.log('[v0] Stage 4: Querying Supabase for products')
    
    // Normalize category
    const categoryMap: Record<string, string> = {
      bed: 'BED', sofa: 'SOFA', chair: 'CHR', table: 'TABLE',
      lamp: 'LAMP', cabinet: 'CAB', storage: 'CAB', desk: 'DSK',
    }
    const normalizedCategory = categoryMap[placement.category?.toLowerCase()] || placement.category?.toUpperCase() || 'SOFA'
    
    // Query products with GLB and transparent images
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price_cents,
        category,
        style,
        dimensions_width,
        dimensions_depth,
        dimensions_height,
        model_3d_url,
        product_images (
          image_url,
          image_type,
          is_transparent
        )
      `)
      .eq('category', normalizedCategory)
      .eq('is_active', true)
      .lte('price_cents', (placement.max_price || budget) * 100)
      .limit(10)

    if (error) {
      console.error('[v0] Supabase query error:', error)
      return []
    }

    // Transform to ProductMatch format
    const matches: ProductMatch[] = (products || []).map((p: any) => {
      // Find transparent image
      const transparentImg = p.product_images?.find(
        (img: any) => img.is_transparent === true
      )
      
      return {
        product_id: p.id,
        source_id: p.id,
        title: p.name,
        price: (p.price_cents || 0) / 100,
        image_url: transparentImg?.image_url || '',
        transparent_url: transparentImg?.image_url,
        model_3d_url: p.model_3d_url,
        dimensions: {
          width: p.dimensions_width || 36,
          depth: p.dimensions_depth || 30,
          height: p.dimensions_height || 30,
        },
        category: p.category || normalizedCategory,
        style: p.style || stylePreference,
        score: p.model_3d_url ? 1.0 : 0.5,  // Prefer products with 3D
      }
    })
    .filter(p => p.image_url)  // Must have image

    // Sort: prefer 3D products
    matches.sort((a, b) => b.score - a.score)

    console.log('[v0] Stage 4: Found', matches.length, 'products,', 
      matches.filter(p => p.model_3d_url).length, 'with 3D')
    
    return matches.slice(0, 5)
  } catch (error) {
    console.error('[v0] Stage 4 error:', error)
    return []
  }
}

export function scaleProductDimensions(
  dimensions: { width: number; depth: number; height: number },
  scale: number
): { width: number; depth: number; height: number } {
  return {
    width: dimensions.width * scale,
    depth: dimensions.depth * scale,
    height: dimensions.height * scale,
  }
}