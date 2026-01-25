'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { VideoDropzone, UploadProgress, ClipForm, type ClipFormData } from '@/components/upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUpload } from '@/lib/hooks/use-upload'
import { useToast } from '@/components/ui/toast'
import { api } from '@/lib/api/client'
import { ROUTES } from '@/config/routes'

interface Tag {
  id: string
  slug: string
  name: string
  category: string
}

interface UploadPageClientProps {
  tags: Tag[]
}

type Step = 'upload' | 'details' | 'success'

export function UploadPageClient({ tags }: UploadPageClientProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [step, setStep] = React.useState<Step>('upload')
  const [videoData, setVideoData] = React.useState<{
    videoUrl: string
    thumbnailUrl?: string
    videoId: string
  } | null>(null)

  const { state: uploadState, upload, cancel, reset } = useUpload({
    onSuccess: (result) => {
      setVideoData(result)
      setStep('details')
      addToast({
        type: 'success',
        title: 'Video uploaded',
        description: 'Now fill in the clip details.',
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Upload failed',
        description: error.message,
      })
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (data: ClipFormData) => {
      return api.post('/clips', {
        ...data,
        videoUrl: videoData?.videoUrl,
        thumbnailUrl: videoData?.thumbnailUrl,
      })
    },
    onSuccess: () => {
      setStep('success')
      addToast({
        type: 'success',
        title: 'Clip submitted',
        description: 'Your clip has been submitted for review.',
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Failed to submit clip',
      })
    },
  })

  const handleFileSelect = (file: File) => {
    upload(file)
  }

  const handleFormSubmit = (data: ClipFormData) => {
    submitMutation.mutate(data)
  }

  const handleStartOver = () => {
    reset()
    setVideoData(null)
    setStep('upload')
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4">
        <StepIndicator
          number={1}
          label="Upload Video"
          active={step === 'upload'}
          complete={step === 'details' || step === 'success'}
        />
        <div className="h-px w-8 bg-border" />
        <StepIndicator
          number={2}
          label="Add Details"
          active={step === 'details'}
          complete={step === 'success'}
        />
        <div className="h-px w-8 bg-border" />
        <StepIndicator number={3} label="Submit" active={step === 'success'} complete={false} />
      </div>

      {/* Step content */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VideoDropzone
              onFileSelect={handleFileSelect}
              disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
            />
            <UploadProgress
              progress={uploadState.progress}
              status={uploadState.status}
              onCancel={cancel}
              error={uploadState.error}
            />
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Clip Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleStartOver}>
                Upload Different Video
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ClipForm
              onSubmit={handleFormSubmit}
              isSubmitting={submitMutation.isPending}
              availableTags={tags}
            />
          </CardContent>
        </Card>
      )}

      {step === 'success' && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Clip Submitted!</h2>
            <p className="mt-2 text-foreground-muted">
              Your clip has been submitted for review. A moderator will review it shortly.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button variant="secondary" onClick={handleStartOver}>
                Upload Another
              </Button>
              <Button onClick={() => router.push(ROUTES.clips.list)}>
                Browse Clips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      {step !== 'success' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li>• Clips must be from commercially released anime</li>
              <li>• Maximum duration: 45 seconds</li>
              <li>• Maximum file size: 100MB</li>
              <li>• Accepted formats: MP4, WebM</li>
              <li>• Include a detailed technique description for Fair Use compliance</li>
              <li>• Provide accurate animator attribution with sources when possible</li>
              <li>• No explicit/NSFW content</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface StepIndicatorProps {
  number: number
  label: string
  active: boolean
  complete: boolean
}

function StepIndicator({ number, label, active, complete }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
          complete
            ? 'bg-success text-white'
            : active
              ? 'bg-accent text-white'
              : 'bg-surface-hover text-foreground-muted'
        }`}
      >
        {complete ? <CheckCircle className="h-4 w-4" /> : number}
      </div>
      <span className={`text-xs ${active || complete ? 'text-foreground' : 'text-foreground-muted'}`}>
        {label}
      </span>
    </div>
  )
}
