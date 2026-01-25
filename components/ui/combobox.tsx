'use client'

import * as React from 'react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ComboboxProps<T> {
  value: T | null
  onChange: (value: T | null) => void
  options: T[]
  getOptionLabel: (option: T) => string
  getOptionValue: (option: T) => string
  onSearch?: (query: string) => void
  isLoading?: boolean
  placeholder?: string
  searchPlaceholder?: string
  error?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
}

function Combobox<T>({
  value,
  onChange,
  options,
  getOptionLabel,
  getOptionValue,
  onSearch,
  isLoading = false,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  error,
  disabled,
  className,
  emptyMessage = 'No results found',
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedLabel = value ? getOptionLabel(value) : ''

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    onSearch?.(newQuery)
  }

  const filteredOptions = onSearch
    ? options
    : options.filter((option) => getOptionLabel(option).toLowerCase().includes(query.toLowerCase()))

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-button border bg-surface px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error' : 'border-border',
          !value && 'text-foreground-muted'
        )}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown
          className={cn('ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full overflow-hidden rounded-button border border-border bg-surface shadow-lg',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full bg-transparent px-2 py-1 text-sm text-foreground',
                'placeholder:text-foreground-muted',
                'focus:outline-none'
              )}
            />
          </div>

          <div role="listbox" className="max-h-60 overflow-auto py-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />
              </div>
            ) : filteredOptions.length === 0 ? (
              <p className="py-4 text-center text-sm text-foreground-muted">{emptyMessage}</p>
            ) : (
              filteredOptions.map((option) => {
                const optionValue = getOptionValue(option)
                const isSelected = value ? getOptionValue(value) === optionValue : false

                return (
                  <button
                    key={optionValue}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm',
                      'hover:bg-surface-hover focus:bg-surface-hover focus:outline-none',
                      isSelected && 'bg-surface-hover'
                    )}
                  >
                    <span className="flex-1 truncate text-left">{getOptionLabel(option)}</span>
                    {isSelected && <Check className="ml-2 h-4 w-4 shrink-0 text-accent" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}

export { Combobox }
