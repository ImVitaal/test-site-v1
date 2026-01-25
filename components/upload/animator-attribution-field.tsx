'use client'

import * as React from 'react'
import { Trash2, Link as LinkIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { ANIMATION_ROLES, ANIMATION_ROLE_LABELS } from '@/config/constants'
import type { AnimatorCard } from '@/types/animator'

export interface AttributionInput {
  animatorId: string
  animatorName?: string
  role: string
  sourceUrl?: string
  sourceNote?: string
}

interface AnimatorAttributionFieldProps {
  index: number
  value: AttributionInput
  onChange: (value: AttributionInput) => void
  onRemove: () => void
  animators: AnimatorCard[]
  isSearching: boolean
  onSearch: (query: string) => void
  canRemove: boolean
}

const roleOptions = ANIMATION_ROLES.map((role) => ({
  value: role,
  label: ANIMATION_ROLE_LABELS[role],
}))

export function AnimatorAttributionField({
  index,
  value,
  onChange,
  onRemove,
  animators,
  isSearching,
  onSearch,
  canRemove,
}: AnimatorAttributionFieldProps) {
  const [showSourceFields, setShowSourceFields] = React.useState(!!value.sourceUrl || !!value.sourceNote)

  const selectedAnimator = animators.find((a) => a.id === value.animatorId) || null

  return (
    <div className="rounded-card border border-border bg-surface/50 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-foreground-muted">
          Attribution #{index + 1}
        </span>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-error hover:text-error">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Animator selector */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Animator <span className="text-error">*</span>
          </label>
          <Combobox
            value={selectedAnimator}
            onChange={(animator) =>
              onChange({
                ...value,
                animatorId: animator?.id || '',
                animatorName: animator?.name,
              })
            }
            options={animators}
            getOptionLabel={(a) => `${a.name}${a.nativeName ? ` (${a.nativeName})` : ''}`}
            getOptionValue={(a) => a.id}
            onSearch={onSearch}
            isLoading={isSearching}
            placeholder="Search for an animator..."
            searchPlaceholder="Type animator name..."
            emptyMessage="No animators found"
          />
        </div>

        {/* Role selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Role <span className="text-error">*</span>
          </label>
          <Select
            value={value.role}
            onChange={(role) => onChange({ ...value, role })}
            options={roleOptions}
            placeholder="Select role..."
          />
        </div>
      </div>

      {/* Source toggle */}
      <button
        type="button"
        onClick={() => setShowSourceFields(!showSourceFields)}
        className="flex items-center gap-1 text-sm text-accent hover:underline"
      >
        <LinkIcon className="h-3 w-3" />
        {showSourceFields ? 'Hide source info' : 'Add source info (optional)'}
      </button>

      {/* Source fields */}
      {showSourceFields && (
        <div className="space-y-3 pt-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Source URL
            </label>
            <Input
              type="url"
              value={value.sourceUrl || ''}
              onChange={(e) => onChange({ ...value, sourceUrl: e.target.value })}
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-foreground-muted">
              Link to credits, artbook, or interview confirming attribution
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Source Note
            </label>
            <Textarea
              value={value.sourceNote || ''}
              onChange={(e) => onChange({ ...value, sourceNote: e.target.value })}
              placeholder="e.g., Staff credits at 23:45 in episode 12"
              maxLength={500}
              showCount
            />
          </div>
        </div>
      )}
    </div>
  )
}
