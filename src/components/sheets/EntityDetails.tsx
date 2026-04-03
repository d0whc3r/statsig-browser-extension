import type { ReactNode } from 'react'

import { Badge } from '@/src/components/ui/badge'

export function EntityDetailsContainer({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>
}

export function EntityDetailsHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border overflow-x-auto">
      {children}
    </div>
  )
}

export function EntityDetailsField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col min-w-max">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="text-sm font-medium flex items-center">{children}</div>
    </div>
  )
}

export function EntityDetailsDivider() {
  return <div className="h-8 w-px bg-border shrink-0" />
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
    <EntityDetailsSection title="Tags">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </EntityDetailsSection>
  )
}
