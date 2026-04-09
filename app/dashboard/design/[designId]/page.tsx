'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface Design {
  id: string
  design_image_url: string
  variation_number: number
  furniture_data: any[]
}

interface DesignProduct {
  id: string
  product_id: string
  product: {
    name: string
    price_min: number
    price_max: number
    image_url: string
    category: string
    color: string
  }
}

export default function DesignDetailPage({
  params,
}: {
  params: { designId: string }
}) {
  const [design, setDesign] = useState<Design | null>(null)
  const [products, setProducts] = useState<DesignProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDesignDetails = async () => {
      try {
        // Fetch design
        const { data: designData, error: designError } = await supabase
          .from('designs')
          .select('*')
          .eq('id', params.designId)
          .single()

        if (designError) throw designError
        setDesign(designData)

        // Fetch related products
        const { data: productData, error: productError } = await supabase
          .from('design_products')
          .select(`
            id,
            product_id,
            product:products(*)
          `)
          .eq('design_id', params.designId)

        if (productError) throw productError
        setProducts(productData || [])
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load design')
        setLoading(false)
      }
    }

    fetchDesignDetails()
  }, [params.designId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading design details...</p>
        </div>
      </div>
    )
  }

  if (error || !design) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Error</h1>
        <Card className="p-8 border-red-200 bg-red-50">
          <p className="text-red-800">{error || 'Design not found'}</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const totalPrice = products.reduce((sum, p) => {
    return sum + (p.product?.price_min || 0)
  }, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Design Variation {design.variation_number}
        </h1>
        <p className="text-slate-600">
          Explore the AI-generated design and shop all included items
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Design Image */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative w-full aspect-video bg-slate-100">
              <Image
                src={design.design_image_url}
                alt={`Design Variation ${design.variation_number}`}
                fill
                className="object-contain"
              />
            </div>
          </Card>
        </div>

        {/* Products Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-900 font-semibold mb-2">Total Est. Price</p>
            <p className="text-3xl font-bold text-blue-900">
              ${(totalPrice / 100).toLocaleString()}
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Prices are estimates and may vary by retailer
            </p>
          </Card>

          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Back to Results
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Included Furniture</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {products.map((item) => {
            const product = item.product as any
            return (
              <Card key={item.id} className="p-4 hover:shadow-lg transition">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-slate-100 rounded">
                    <Image
                      src={product?.image_url || 'https://via.placeholder.com/100'}
                      alt={product?.name || 'Product'}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-slate-900">{product?.name}</h3>
                    <p className="text-xs text-slate-600 capitalize">
                      {product?.category} • {product?.color}
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      ${(product?.price_min / 100).toLocaleString()} - ${(product?.price_max / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {products.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-600">No products linked to this design yet.</p>
        </Card>
      )}
    </div>
  )
}
