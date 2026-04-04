import type { LucideIcon } from 'lucide-react'

import { Database, Globe, Lock, Mail, MapPin, Monitor, Network, User } from 'lucide-react'
import { memo } from 'react'

import type { StatsigUser } from '@/src/types/statsig'

import { UserEmptyState } from '@/src/components/sheets/user-details/UserEmptyState'
import { Badge } from '@/src/components/ui/badge'
import { Card } from '@/src/components/ui/card'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { Separator } from '@/src/components/ui/separator'
import { cn } from '@/src/lib/utils'

interface UserDetailsContentProps {
  userDetails: StatsigUser | null | undefined
  onRefetch: () => void
  error?: string | null
}

const toDisplayValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  const serialized = JSON.stringify(value)
  return serialized ?? ''
}

const UserHeader = memo(({ userDetails }: { userDetails: StatsigUser }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate text-xl font-bold tracking-tight">{userDetails.name ?? 'Anonymous User'}</h4>
          {userDetails.statsigEnvironment && (
            <Badge variant="outline" className="shrink-0 px-2 py-0.5 text-xs font-medium capitalize">
              {userDetails.statsigEnvironment.tier ?? 'unknown'}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="group flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="w-16 text-xs font-medium tracking-wider uppercase">User ID</span>
            {userDetails.userID ? (
              <CopyableText
                value={userDetails.userID}
                copyLabel="Copy"
                containerClassName="w-full gap-2"
                valueClassName="text-sm font-mono break-all text-foreground"
                buttonClassName="text-muted-foreground"
                hideButtonUntilHover
              />
            ) : (
              <span className="font-mono text-muted-foreground/50">No User ID</span>
            )}
          </div>

          <div className="group flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span className="w-16 text-xs font-medium tracking-wider uppercase">Stable ID</span>
            {userDetails.stableID ? (
              <CopyableText
                value={userDetails.stableID}
                copyLabel="Copy"
                containerClassName="w-full gap-2"
                valueClassName="text-sm font-mono break-all text-foreground"
                buttonClassName="text-muted-foreground"
                hideButtonUntilHover
              />
            ) : (
              <span className="font-mono text-muted-foreground/50">No Stable ID</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
))

UserHeader.displayName = 'UserHeader'

const InfoItem = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon
  label: string
  value?: string
  className?: string
}) => {
  if (!value) {
    return null
  }
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border bg-card/50 p-3', className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-sm font-medium" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

const UserOverview = memo(({ userDetails }: { userDetails: StatsigUser }) => {
  const hasContent =
    userDetails.email ?? userDetails.country ?? userDetails.locale ?? userDetails.ip ?? userDetails.userAgent

  if (!hasContent) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <InfoItem icon={Mail} label="Email" value={userDetails.email} className="sm:col-span-2" />
      <InfoItem icon={MapPin} label="Country" value={userDetails.country} />
      <InfoItem icon={Globe} label="Locale" value={userDetails.locale} />
      <InfoItem icon={Network} label="IP Address" value={userDetails.ip} />
      <InfoItem
        icon={Monitor}
        label="User Agent"
        value={userDetails.userAgent}
        className={userDetails.ip ? '' : 'sm:col-span-2'}
      />
    </div>
  )
})

UserOverview.displayName = 'UserOverview'

const PropertySection = ({
  title,
  icon: Icon,
  data,
  variant = 'default',
}: {
  title: string
  icon: LucideIcon
  data?: Record<string, unknown>
  variant?: 'default' | 'private'
}) => {
  if (!data || Object.keys(data).length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <h5 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</h5>
      </div>
      <Card className={cn('overflow-hidden shadow-sm', variant === 'private' && 'border-dashed')}>
        <div className="divide-y">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1 p-3 transition-colors hover:bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground">{key}</span>
              <CopyableText
                value={toDisplayValue(value)}
                copyLabel="Copy"
                containerClassName="w-full gap-2"
                valueClassName="text-sm font-mono break-all text-foreground"
                buttonClassName="text-muted-foreground"
                hideButtonUntilHover
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const UserAdditionalProperties = memo(({ userDetails }: { userDetails: StatsigUser }) => {
  const standardKeys = new Set([
    'name',
    'userID',
    'statsigEnvironment',
    'custom',
    'privateAttributes',
    'email',
    'ip',
    'userAgent',
    'country',
    'locale',
  ])

  const additionalProps = Object.fromEntries(Object.entries(userDetails).filter(([key]) => !standardKeys.has(key)))

  return <PropertySection title="Additional Properties" icon={Database} data={additionalProps} />
})

UserAdditionalProperties.displayName = 'UserAdditionalProperties'

export const UserDetailsContent = memo(({ userDetails, onRefetch, error }: UserDetailsContentProps) => {
  if (!userDetails || Object.keys(userDetails).length === 0 || error) {
    return <UserEmptyState onRefetch={onRefetch} error={error} />
  }

  return (
    <div className="space-y-8 pb-8">
      <UserHeader userDetails={userDetails} />

      <div className="space-y-6">
        <UserOverview userDetails={userDetails} />

        {(userDetails.custom ?? userDetails.privateAttributes ?? Object.keys(userDetails).length > 10) && <Separator />}

        <PropertySection title="Custom Properties" icon={Database} data={userDetails.custom} />

        <PropertySection
          title="Private Attributes"
          icon={Lock}
          data={userDetails.privateAttributes}
          variant="private"
        />

        <UserAdditionalProperties userDetails={userDetails} />
      </div>
    </div>
  )
})

UserDetailsContent.displayName = 'UserDetailsContent'
