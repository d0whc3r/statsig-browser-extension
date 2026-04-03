import type { ReactNode } from 'react'

import { Badge } from '@/src/components/ui/badge'
import { cn } from '@/src/lib/utils'

export function EntityDetailsContainer({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>
}

export function EntityDetailsList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <dl className={cn('divide-y divide-border rounded-md border text-sm bg-card', className)}>
      {children}
    </dl>
  )
}

export function EntityDetailsField({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      {label && <dt className="text-muted-foreground font-medium">{label}</dt>}
      <dd
        className={cn(
          'font-medium flex items-center gap-2 text-right justify-end',
          !label && 'w-full',
        )}
      >
        {children}
      </dd>
    </div>
  )
}

export function EntityDetailsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  )
}

export function EntityDetailsTags({ tags }: { tags?: string[] }) {
  if (!tags?.length) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1.5 justify-start w-full">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
          {tag}
        </Badge>
      ))}
    </div>
  )
}
