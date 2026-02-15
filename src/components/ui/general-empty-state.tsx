import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import {
  AlertCircle,
  Database,
  FileText,
  FlaskConical,
  List,
  Search,
  Settings,
  ToggleRight,
  User,
  Users,
} from 'lucide-react'
import React from 'react'

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/src/components/ui/empty'
import { cn } from '@/src/lib/utils'

const generalEmptyStateVariants = cva('border-0 p-0', {
  defaultVariants: {
    variant: 'experiment',
  },
  variants: {
    variant: {
      audit_log: '',
      dynamic_config: '',
      error: '',
      experiment: '',
      feature_gate: '',
      group: '',
      override: '',
      rule: '',
      search: '',
      user: '',
    },
  },
})

export type GeneralEmptyStateVariant = NonNullable<
  VariantProps<typeof generalEmptyStateVariants>['variant']
>

interface EmptyStateConfig {
  icon: React.ElementType
  title: string
  description: string
}

const EMPTY_STATE_CONFIGS: Record<GeneralEmptyStateVariant, EmptyStateConfig> = {
  audit_log: {
    description: 'There are no audit logs to display.',
    icon: FileText,
    title: 'No audit logs found',
  },
  dynamic_config: {
    description: 'There are no dynamic configs to display.',
    icon: Settings,
    title: 'No dynamic configs found',
  },
  error: {
    description: 'An error occurred while loading data.',
    icon: AlertCircle,
    title: 'Something went wrong',
  },
  experiment: {
    description: 'There are no experiments to display.',
    icon: FlaskConical,
    title: 'No experiments found',
  },
  feature_gate: {
    description: 'There are no feature gates to display.',
    icon: ToggleRight,
    title: 'No feature gates found',
  },
  group: {
    description: 'There are no groups configured.',
    icon: Users,
    title: 'No groups found',
  },
  override: {
    description: 'There are no overrides configured.',
    icon: Database,
    title: 'No overrides found',
  },
  rule: {
    description: 'No rules have been configured.',
    icon: List,
    title: 'No rules configured',
  },
  search: {
    description: 'Try adjusting your filters to see more results.',
    icon: Search,
    title: 'No results found',
  },
  user: {
    description: "We couldn't detect a Statsig user on this page.",
    icon: User,
    title: 'No User Found',
  },
}

interface GeneralEmptyStateProps
  extends React.ComponentProps<typeof Empty>, VariantProps<typeof generalEmptyStateVariants> {
  variant: GeneralEmptyStateVariant
  title?: string
  description?: string
  icon?: React.ElementType
  children?: React.ReactNode
  entityName?: string // Optional name to append to description (e.g. "for this experiment")
}

export function GeneralEmptyState({
  variant,
  title,
  description,
  icon,
  children,
  className,
  entityName,
  ...props
}: GeneralEmptyStateProps) {
  const config = EMPTY_STATE_CONFIGS[variant]
  const Icon = icon || config.icon

  const finalDescription =
    description ||
    (entityName
      ? `${config.description.replace(/\.$/, '')} for this ${entityName}.`
      : config.description)

  return (
    <Empty className={cn(generalEmptyStateVariants({ className, variant }))} {...props}>
      <EmptyMedia>
        <Icon className="text-muted-foreground size-8" />
      </EmptyMedia>
      <EmptyTitle>{title || config.title}</EmptyTitle>
      <EmptyDescription>{finalDescription}</EmptyDescription>
      {children}
    </Empty>
  )
}

export { generalEmptyStateVariants }
