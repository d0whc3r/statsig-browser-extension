import { cva, type VariantProps } from 'class-variance-authority'
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
  variants: {
    variant: {
      experiment: '',
      feature_gate: '',
      dynamic_config: '',
      rule: '',
      override: '',
      group: '',
      audit_log: '',
      user: '',
      search: '',
      error: '',
    },
  },
  defaultVariants: {
    variant: 'experiment',
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
  experiment: {
    icon: FlaskConical,
    title: 'No experiments found',
    description: 'There are no experiments to display.',
  },
  feature_gate: {
    icon: ToggleRight,
    title: 'No feature gates found',
    description: 'There are no feature gates to display.',
  },
  dynamic_config: {
    icon: Settings,
    title: 'No dynamic configs found',
    description: 'There are no dynamic configs to display.',
  },
  rule: {
    icon: List,
    title: 'No rules configured',
    description: 'No rules have been configured.',
  },
  override: {
    icon: Database,
    title: 'No overrides found',
    description: 'There are no overrides configured.',
  },
  group: {
    icon: Users,
    title: 'No groups found',
    description: 'There are no groups configured.',
  },
  audit_log: {
    icon: FileText,
    title: 'No audit logs found',
    description: 'There are no audit logs to display.',
  },
  user: {
    icon: User,
    title: 'No User Found',
    description: "We couldn't detect a Statsig user on this page.",
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your filters to see more results.',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An error occurred while loading data.',
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
    <Empty className={cn(generalEmptyStateVariants({ variant, className }))} {...props}>
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
