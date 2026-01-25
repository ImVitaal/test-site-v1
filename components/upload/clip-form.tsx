'use client'

import * as React from 'react'
import { Plus, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { AnimatorAttributionField, type AttributionInput } from './animator-attribution-field'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { api } from '@/lib/api/client'
import { ANIMATION_ROLES } from '@/config/constants'
import type { AnimatorCard } from '@/types/animator'
import type { PaginatedResponse } from '@/types/api'

interface Anime {
  id: string
  slug: string
  title: string
  nativeTitle: string | null
  year: number
}

interface Tag {
  id: string
  slug: string
  name: string
  category: string
}

export interface ClipFormData {
  title: string
  animeId: string
  episodeNumber?: number
  timestampStart?: string
  techniqueDescription: string
  attributions: AttributionInput[]
  tagIds: string[]
}

interface ClipFormProps {
  onSubmit: (data: ClipFormData) => void
  isSubmitting: boolean
  availableTags: Tag[]
}

const defaultAttribution: AttributionInput = {
  animatorId: '',
  role: ANIMATION_ROLES[0],
  sourceUrl: '',
  sourceNote: '',
}

export function ClipForm({ onSubmit, isSubmitting, availableTags }: ClipFormProps) {
  const [title, setTitle] = React.useState('')
  const [animeId, setAnimeId] = React.useState('')
  const [selectedAnime, setSelectedAnime] = React.useState<Anime | null>(null)
  const [episodeNumber, setEpisodeNumber] = React.useState('')
  const [timestampStart, setTimestampStart] = React.useState('')
  const [techniqueDescription, setTechniqueDescription] = React.useState('')
  const [attributions, setAttributions] = React.useState<AttributionInput[]>([{ ...defaultAttribution }])
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([])

  // Anime search
  const [animeQuery, setAnimeQuery] = React.useState('')
  const [animeResults, setAnimeResults] = React.useState<Anime[]>([])
  const [isSearchingAnime, setIsSearchingAnime] = React.useState(false)
  const debouncedAnimeQuery = useDebounce(animeQuery, 300)

  // Animator search
  const [animatorQuery, setAnimatorQuery] = React.useState('')
  const [animatorResults, setAnimatorResults] = React.useState<AnimatorCard[]>([])
  const [isSearchingAnimators, setIsSearchingAnimators] = React.useState(false)
  const debouncedAnimatorQuery = useDebounce(animatorQuery, 300)

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Search anime
  React.useEffect(() => {
    if (!debouncedAnimeQuery.trim()) {
      setAnimeResults([])
      return
    }

    const searchAnime = async () => {
      setIsSearchingAnime(true)
      try {
        // Note: This endpoint would need to be created
        const response = await api.get<PaginatedResponse<Anime>>('/anime', {
          q: debouncedAnimeQuery,
          limit: 10,
        })
        setAnimeResults(response.data)
      } catch (error) {
        console.error('Anime search error:', error)
      } finally {
        setIsSearchingAnime(false)
      }
    }

    searchAnime()
  }, [debouncedAnimeQuery])

  // Search animators
  React.useEffect(() => {
    if (!debouncedAnimatorQuery.trim()) {
      setAnimatorResults([])
      return
    }

    const searchAnimators = async () => {
      setIsSearchingAnimators(true)
      try {
        const response = await api.get<PaginatedResponse<AnimatorCard>>('/animators', {
          q: debouncedAnimatorQuery,
          limit: 10,
        })
        setAnimatorResults(response.data)
      } catch (error) {
        console.error('Animator search error:', error)
      } finally {
        setIsSearchingAnimators(false)
      }
    }

    searchAnimators()
  }, [debouncedAnimatorQuery])

  const addAttribution = () => {
    setAttributions([...attributions, { ...defaultAttribution }])
  }

  const updateAttribution = (index: number, value: AttributionInput) => {
    const updated = [...attributions]
    updated[index] = value
    setAttributions(updated)
  }

  const removeAttribution = (index: number) => {
    if (attributions.length > 1) {
      setAttributions(attributions.filter((_, i) => i !== index))
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!animeId) {
      newErrors.anime = 'Please select an anime'
    }

    if (!techniqueDescription.trim()) {
      newErrors.techniqueDescription = 'Technique description is required for Fair Use compliance'
    } else if (techniqueDescription.trim().length < 50) {
      newErrors.techniqueDescription = 'Please provide at least 50 characters describing the technique'
    }

    const validAttributions = attributions.filter((a) => a.animatorId)
    if (validAttributions.length === 0) {
      newErrors.attributions = 'At least one animator attribution is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const formData: ClipFormData = {
      title: title.trim(),
      animeId,
      episodeNumber: episodeNumber ? parseInt(episodeNumber) : undefined,
      timestampStart: timestampStart || undefined,
      techniqueDescription: techniqueDescription.trim(),
      attributions: attributions.filter((a) => a.animatorId),
      tagIds: selectedTagIds,
    }

    onSubmit(formData)
  }

  // Group tags by category
  const tagsByCategory = React.useMemo(() => {
    const grouped: Record<string, Tag[]> = {}
    availableTags.forEach((tag) => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = []
      }
      grouped[tag.category].push(tag)
    })
    return grouped
  }, [availableTags])

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Clip Title <span className="text-error">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sword of the Stranger - Final Fight"
            error={errors.title}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Anime Source <span className="text-error">*</span>
          </label>
          <Combobox
            value={selectedAnime}
            onChange={(anime) => {
              setSelectedAnime(anime)
              setAnimeId(anime?.id || '')
            }}
            options={animeResults}
            getOptionLabel={(a) => `${a.title} (${a.year})`}
            getOptionValue={(a) => a.id}
            onSearch={setAnimeQuery}
            isLoading={isSearchingAnime}
            placeholder="Search for an anime..."
            searchPlaceholder="Type anime title..."
            emptyMessage="No anime found"
            error={errors.anime}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Episode Number
            </label>
            <Input
              type="number"
              min={1}
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              placeholder="e.g., 12"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Timestamp Start
            </label>
            <Input
              value={timestampStart}
              onChange={(e) => setTimestampStart(e.target.value)}
              placeholder="e.g., 12:34"
            />
          </div>
        </div>
      </section>

      {/* Technique Description */}
      <section className="space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-foreground">Technique Description</h2>
          <div className="flex items-center gap-1 text-xs text-foreground-muted">
            <Info className="h-3 w-3" />
            Required for Fair Use
          </div>
        </div>

        <Textarea
          value={techniqueDescription}
          onChange={(e) => setTechniqueDescription(e.target.value)}
          placeholder="Describe the animation technique showcased in this clip. What makes it notable? What technical aspects are being demonstrated? (Minimum 50 characters)"
          maxLength={2000}
          showCount
          error={errors.techniqueDescription}
          className="min-h-[120px]"
        />
        <p className="text-xs text-foreground-muted">
          This description supports our educational purpose and Fair Use claim. Please describe specific techniques,
          timing, or stylistic elements.
        </p>
      </section>

      {/* Attributions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Animator Attributions</h2>
        {errors.attributions && (
          <p className="text-sm text-error">{errors.attributions}</p>
        )}

        <div className="space-y-4">
          {attributions.map((attribution, index) => (
            <AnimatorAttributionField
              key={index}
              index={index}
              value={attribution}
              onChange={(value) => updateAttribution(index, value)}
              onRemove={() => removeAttribution(index)}
              animators={animatorResults}
              isSearching={isSearchingAnimators}
              onSearch={setAnimatorQuery}
              canRemove={attributions.length > 1}
            />
          ))}
        </div>

        <Button type="button" variant="secondary" onClick={addAttribution}>
          <Plus className="mr-2 h-4 w-4" />
          Add Another Animator
        </Button>
      </section>

      {/* Tags */}
      {availableTags.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Tags</h2>

          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-medium capitalize text-foreground-muted">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-sm transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-accent text-white'
                        : 'bg-surface-hover text-foreground hover:bg-surface-hover/80'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-4 border-t border-border pt-6">
        <Button type="submit" isLoading={isSubmitting}>
          Submit for Review
        </Button>
      </div>
    </form>
  )
}
