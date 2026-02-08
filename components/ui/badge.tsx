import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import type { VerificationStatus } from '@prisma/client'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'verified' | 'speculative' | 'disputed' | 'outline'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-accent/20 text-accent',
      verified: 'bg-verified/20 text-verified',
      speculative: 'bg-speculative/20 text-speculative',
      disputed: 'bg-disputed/20 text-disputed',
      outline: 'border border-border text-foreground-muted',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config: Record<VerificationStatus, { label: string; variant: BadgeProps['variant'] }> = {
    VERIFIED: { label: 'Verified', variant: 'verified' as const },
    SPECULATIVE: { label: 'Speculative', variant: 'speculative' as const },
    DISPUTED: { label: 'Disputed', variant: 'disputed' as const },
  }

  const { label, variant } = config[status]

  return <Badge variant={variant}>{label}</Badge>
}

export { Badge }
