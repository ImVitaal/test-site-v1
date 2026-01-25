'use client'

import { useState, useCallback } from 'react'
import { api } from '@/lib/api/client'

export interface UploadState {
  file: File | null
  progress: number
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  videoUrl?: string
  thumbnailUrl?: string
}

interface UploadResult {
  videoUrl: string
  thumbnailUrl?: string
  videoId: string
}

interface UseUploadOptions {
  onSuccess?: (result: UploadResult) => void
  onError?: (error: Error) => void
  onProgress?: (progress: number) => void
}

export function useUpload(options?: UseUploadOptions) {
  const [state, setState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle',
  })

  const upload = useCallback(
    async (file: File) => {
      setState({
        file,
        progress: 0,
        status: 'uploading',
      })

      try {
        // Step 1: Get presigned upload URL
        const { uploadUrl, videoId } = await api.post<{ uploadUrl: string; videoId: string }>(
          '/clips/upload-url',
          {
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }
        )

        // Step 2: Upload file to presigned URL with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100)
              setState((prev) => ({ ...prev, progress }))
              options?.onProgress?.(progress)
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'))
          })

          xhr.open('PUT', uploadUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.send(file)
        })

        // Step 3: Processing phase (video transcoding)
        setState((prev) => ({ ...prev, status: 'processing', progress: 100 }))

        // Step 4: Poll for processing completion or wait
        // In a real implementation, you might poll an endpoint or use webhooks
        // For now, we'll simulate a brief processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Step 5: Get final video URLs
        const result: UploadResult = {
          videoUrl: `https://stream.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
          thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
          videoId,
        }

        setState((prev) => ({
          ...prev,
          status: 'complete',
          videoUrl: result.videoUrl,
          thumbnailUrl: result.thumbnailUrl,
        }))

        options?.onSuccess?.(result)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'

        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }))

        options?.onError?.(error instanceof Error ? error : new Error(errorMessage))
      }
    },
    [options]
  )

  const cancel = useCallback(() => {
    // In a real implementation, you would abort the XHR request
    setState({
      file: null,
      progress: 0,
      status: 'idle',
    })
  }, [])

  const reset = useCallback(() => {
    setState({
      file: null,
      progress: 0,
      status: 'idle',
    })
  }, [])

  return {
    state,
    upload,
    cancel,
    reset,
  }
}
