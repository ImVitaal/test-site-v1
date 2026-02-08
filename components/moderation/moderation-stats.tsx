'use client'

import { Clock, CheckCircle, XCircle, Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ModerationStatsProps {
  pending: number
  approvedToday: number
  rejectedToday: number
  totalReviewed: number
}

export function ModerationStats({ pending, approvedToday, rejectedToday, totalReviewed }: ModerationStatsProps) {
  const stats = [
    {
      label: 'Pending Review',
      value: pending,
      icon: Inbox,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Approved Today',
      value: approvedToday,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Rejected Today',
      value: rejectedToday,
      icon: XCircle,
      color: 'text-error',
      bgColor: 'bg-error/10',
    },
    {
      label: 'Total Reviewed',
      value: totalReviewed,
      icon: Clock,
      color: 'text-foreground-muted',
      bgColor: 'bg-surface-hover',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-full p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-foreground-muted">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
