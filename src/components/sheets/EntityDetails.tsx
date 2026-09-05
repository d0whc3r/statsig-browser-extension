import type { ReactNode } from 'react'

import { Badge } from '@/src/components/ui/badge'
import { cn } from '@/src/lib/utils'

export function EntityDetailsContainer({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="space-y-6">{children}</div>
}

export function EntityDetailsList({ children, className }: Readonly<{ children: ReactNode; className?: string }>) {
  return <dl className={cn('divide-y divide-border rounded-md border bg-card text-sm', className)}>{children}</dl>
}

export function EntityDetailsField({ label, children }: Readonly<{ label?: string; children: ReactNode }>) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      {label && <dt className="shrink-0 font-medium text-muted-foreground">{label}</dt>}
      <dd
        className={cn('flex min-w-0 flex-1 items-center justify-end gap-2 text-right font-medium', !label && 'w-full')}
      >
        {children}
      </dd>
    </div>
  )
}

export function EntityDetailsSection({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{title}</h3>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  )
}

export function EntityDetailsTags({ tags }: Readonly<{ tags?: string[] }>) {
  if (!tags?.length) {
    return null
  }

  return (
    <div className="flex w-full flex-wrap justify-start gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="max-w-full min-w-0 shrink rounded-md px-2 py-0.5 text-xs font-normal break-words whitespace-normal"
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
