export interface ProductMatch {
  product_id: string
  title: string
  price: number
  image_url: string
  dimensions: {
    width: number
    depth: number
    height: number
  }
  asin?: string
  affiliate_url?: string
  score: number
}

// Mock product database for development
const mockProducts: ProductMatch[] = [
  {
    product_id: '1',
    title: 'Modern Gray Sofa',
    price: 79999,
    image_url: 'https://via.placeholder.com/400x300?text=Gray+Sofa',
    dimensions: { width: 84, depth: 38, height: 32 },
    score: 0.95,
  },
  {
    product_id: '2',
    title: 'Minimalist White Chair',
    price: 29999,
    image_url: 'https://via.placeholder.com/400x300?text=White+Chair',
    dimensions: { width: 28, depth: 30, height: 32 },
    score: 0.88,
  },
  {
    product_id: '3',
    title: 'Walnut Coffee Table',
    price: 39999,
    image_url: 'https://via.placeholder.com/400x300?text=Coffee+Table',
    dimensions: { width: 48, depth: 24, height: 18 },
    score: 0.85,
  },
  {
    product_id: '4',
    title: 'Modern Floor Lamp',
    price: 12999,
    image_url: 'https://via.placeholder.com/400x300?text=Floor+Lamp',
    dimensions: { width: 12, depth: 12, height: 60 },
    score: 0.82,
  },
  {
    product_id: '5',
    title: 'Contemporary Bookshelf',
    price: 34999,
    image_url: 'https://via.placeholder.com/400x300?text=Bookshelf',
    dimensions: { width: 30, depth: 12, height: 72 },
    score: 0.80,
  },
]

export async function fetchProducts(
  placement: {
    product_name: string
    category: string
    scale: number
  },
  budget: number,
  stylePreference: string
): Promise<ProductMatch[]> {
  try {
    console.log('[v0] Stage 6: Fetching products for', placement.product_name)

    // In production, query Amazon Product Advertising API
    // For now, return mock data filtered by budget and style
    const filtered = mockProducts.filter(
      (p) => p.price <= budget && p.title.toLowerCase().includes(placement.category.toLowerCase())
    )

    console.log('[v0] Stage 6 complete: Found', filtered.length, 'products')
    return filtered.slice(0, 3)
  } catch (error) {
    console.error('[v0] Stage 6 error:', error)
    console.log('[v0] Falling back to mock data')
    return mockProducts.slice(0, 3)
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
