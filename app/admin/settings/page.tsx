'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ApiKey {
  id: string
  service: string
  is_active: boolean
  created_at: string
}

interface SiteSetting {
  id: string
  setting_key: string
  setting_value: Record<string, any>
  category: string
}

export default function AdminSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyService, setNewKeyService] = useState('')
  const [newKeyValue, setNewKeyValue] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          setApiKeys(data.apiKeys || [])
          setSiteSettings(data.siteSettings || [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleAddApiKey = async () => {
    if (!newKeyService || !newKeyValue) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/admin/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: newKeyService, key: newKeyValue }),
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys([...apiKeys, data.apiKey])
        setNewKeyService('')
        setNewKeyValue('')
        alert('API key added successfully')
      }
    } catch (error) {
      console.error('[v0] Failed to add API key:', error)
      alert('Failed to add API key')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage API keys and site configuration</p>
      </div>

      {/* API Keys Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">API Keys</h2>
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Service</label>
            <select
              value={newKeyService}
              onChange={(e) => setNewKeyService(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            >
              <option value="">Select service...</option>
              <option value="replicate">Replicate</option>
              <option value="amazon-product-api">Amazon Product API</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">API Key</label>
            <input
              type="password"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="Enter API key..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </div>

          <Button onClick={handleAddApiKey} className="bg-accent hover:bg-accent/90">
            Add API Key
          </Button>
        </div>

        {/* Existing API Keys */}
        {apiKeys.length > 0 && (
          <div className="space-y-2 mt-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="p-4 rounded-lg border border-border bg-secondary/30 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold capitalize">{key.service}</p>
                  <p className="text-sm text-muted-foreground">
                    Added {new Date(key.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Toggle active status
                    }}
                  >
                    {key.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Branding Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Branding</h2>
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Site Name</label>
            <input
              type="text"
              placeholder="RoomAI"
              defaultValue="RoomAI"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Primary Color</label>
            <input
              type="color"
              defaultValue="#ff6b35"
              className="w-full h-10 rounded-lg border border-border cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Hero Subtitle</label>
            <textarea
              placeholder="AI-powered interior design at your fingertips..."
              defaultValue="AI-powered interior design at your fingertips"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              rows={2}
            />
          </div>

          <Button className="bg-accent hover:bg-accent/90">Save Branding Settings</Button>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Feature Toggles</h2>
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <span>Enable Upscaling (Stage 9)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <span>Enable Background Removal Fallback</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <span>Allow Free Users (1 variation)</span>
          </label>

          <Button className="bg-accent hover:bg-accent/90">Save Feature Toggles</Button>
        </div>
      </div>
    </div>
  )
}
