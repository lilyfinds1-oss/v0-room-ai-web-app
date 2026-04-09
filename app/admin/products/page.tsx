'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  category: string
  style: string
  price_min: number
  price_max: number
  color: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    style: '',
    price_min: 0,
    price_max: 0,
    color: '',
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProducts([data.product, ...products])
        setFormData({
          name: '',
          category: '',
          style: '',
          price_min: 0,
          price_max: 0,
          color: '',
        })
        setShowAddForm(false)
        alert('Product added successfully')
      }
    } catch (error) {
      console.error('[v0] Failed to add product:', error)
      alert('Failed to add product')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage furniture database</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent hover:bg-accent/90"
        >
          {showAddForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Modern Sofa"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">Select category...</option>
                <option value="sofa">Sofa</option>
                <option value="chair">Chair</option>
                <option value="table">Table</option>
                <option value="lamp">Lamp</option>
                <option value="cabinet">Cabinet</option>
                <option value="artwork">Artwork</option>
                <option value="rug">Rug</option>
                <option value="plant">Plant</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Style</label>
              <select
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">Select style...</option>
                <option value="modern">Modern</option>
                <option value="traditional">Traditional</option>
                <option value="minimalist">Minimalist</option>
                <option value="eclectic">Eclectic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Navy Blue"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Min Price ($)</label>
              <input
                type="number"
                value={formData.price_min / 100}
                onChange={(e) => setFormData({ ...formData, price_min: e.target.valueAsNumber * 100 })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Max Price ($)</label>
              <input
                type="number"
                value={formData.price_max / 100}
                onChange={(e) => setFormData({ ...formData, price_max: e.target.valueAsNumber * 100 })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
          </div>

          <Button onClick={handleAddProduct} className="bg-accent hover:bg-accent/90">
            Create Product
          </Button>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Style</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Price Range</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Color</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="px-6 py-4 text-sm font-semibold">{product.name}</td>
                  <td className="px-6 py-4 text-sm capitalize">{product.category}</td>
                  <td className="px-6 py-4 text-sm capitalize">{product.style}</td>
                  <td className="px-6 py-4 text-sm">
                    ${(product.price_min / 100).toLocaleString()} - ${(product.price_max / 100).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{product.color}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No products found</p>
          <Button onClick={() => setShowAddForm(true)} className="bg-accent hover:bg-accent/90">
            Add First Product
          </Button>
        </div>
      )}
    </div>
  )
}
