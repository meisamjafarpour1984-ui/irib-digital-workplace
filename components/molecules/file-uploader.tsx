'use client'

import { useCallback, useState } from 'react'
import { Upload, X, FileText, Image, File, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  url?: string
}

interface FileUploaderProps {
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: string[]
  onUpload?: (files: File[]) => void
  onRemove?: (id: string) => void
  className?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

export function FileUploader({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  onUpload,
  onRemove,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const simulateUpload = useCallback((file: File): UploadedFile => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const uploadedFile: UploadedFile = {
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading',
    }

    // Simulate chunked upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, progress: 100, status: 'completed', url: URL.createObjectURL(file) }
              : f
          )
        )
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: Math.min(progress, 99) } : f))
        )
      }
    }, 200)

    return uploadedFile
  }, [])

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null)
      const newFiles = Array.from(fileList)

      // Validate count
      if (files.length + newFiles.length > maxFiles) {
        setError(`حداکثر ${maxFiles} فایل مجاز است`)
        return
      }

      // Validate sizes
      const oversized = newFiles.find((f) => f.size > maxSize)
      if (oversized) {
        setError(`فایل "${oversized.name}" بیش از ${formatSize(maxSize)} است`)
        return
      }

      // Create upload entries
      const uploadFiles = newFiles.map(simulateUpload)
      setFiles((prev) => [...prev, ...uploadFiles])
      onUpload?.(newFiles)
    },
    [files.length, maxFiles, maxSize, simulateUpload, onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    onRemove?.(id)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-brand bg-brand/5'
            : 'border-border hover:border-brand/50 hover:bg-muted/50'
        )}
      >
        <Upload
          className={cn('size-8', isDragging ? 'text-brand' : 'text-muted-foreground/30')}
          aria-hidden
        />
        <p className="mt-2 text-sm text-muted-foreground">فایل‌ها را اینجا رها کنید یا کلیک کنید</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          حداکثر {formatSize(maxSize)} · حداکثر {maxFiles} فایل
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="size-4" aria-hidden />
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.type)
            return (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-brand">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                  {file.status === 'uploading' && (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {file.status === 'completed' && (
                    <CheckCircle className="size-4 text-success" aria-hidden />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="size-4 text-error" aria-hidden />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error"
                    aria-label={`حذف ${file.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
