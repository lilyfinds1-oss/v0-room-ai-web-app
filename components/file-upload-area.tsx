'use client'

import { useCallback, useState } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  accept?: string
  maxSize?: number
}

export function FileUploadArea({
  onFileSelect,
  isLoading = false,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')

  const validateFile = (file: File) => {
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`)
      return false
    }
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return false
    }
    return true
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setError('')
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      const file = files[0]
      setError('')
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
  }

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-white/20 hover:border-primary/50 bg-surface/30 hover:bg-surface/50'
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-rotate-spin" />
              ) : (
                <ImageIcon className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-text-primary">
              {isLoading ? 'Uploading...' : 'Drop your room photo here'}
            </p>
            <p className="text-sm text-text-secondary">or click to browse</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <span>PNG, JPG up to {maxSize / 1024 / 1024}MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-error/10 border border-error/30 text-error text-sm animate-slide-up">
          {error}
        </div>
      )}
    </div>
  )
}
