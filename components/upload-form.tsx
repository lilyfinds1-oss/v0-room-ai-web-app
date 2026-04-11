'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Wand2 } from 'lucide-react'

const ROOM_TYPES = ['Bedroom', 'Living Room', 'Kitchen', 'Office']
const BUDGET_RANGES = ['$0-5k', '$5-10k', '$10k+']
const STYLES = ['Modern', 'Traditional', 'Eclectic', 'Minimalist', 'Maximalist']

export default function UploadForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [roomType, setRoomType] = useState('Bedroom')
  const [budgetRange, setBudgetRange] = useState('$5-10k')
  const [style, setStyle] = useState('Modern')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
      setError('')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(droppedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select an image')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomType', roomType.toLowerCase().replace(' ', '_'))
      formData.append('budgetRange', `budget_${budgetRange.replace(/[^0-9k]/g, '')}`)
      formData.append('stylePreference', style.toLowerCase())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      // Redirect to dashboard to view job progress
      router.push(`/dashboard?jobId=${data.jobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: File Upload */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 bg-surface/30 hover:bg-surface/50"
          >
            {preview ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-3xl">📸</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-text-primary font-semibold">Drop your room photo here</p>
                  <p className="text-sm text-text-secondary">or click to browse</p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm animate-slide-up">
              {error}
            </div>
          )}
        </div>

        {/* Right: Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Preferences</h3>

          <Card className="p-6 space-y-4 border-white/10">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background-dark border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Budget Range
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background-dark border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {BUDGET_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Design Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background-dark border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          <Button
            type="submit"
            disabled={!file || loading}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            <Wand2 className="w-5 h-5" />
            {loading ? 'Processing...' : 'Generate Design'}
          </Button>
        </div>
      </div>
    </form>
  )
}
