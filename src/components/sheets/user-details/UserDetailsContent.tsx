import type { LucideIcon } from 'lucide-react'

import { Copy, Database, Globe, Lock, Mail, MapPin, Monitor, Network, User } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import type { StatsigUser } from '@/src/types/statsig'

import { UserEmptyState } from '@/src/components/sheets/user-details/UserEmptyState'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Separator } from '@/src/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'
import { cn } from '@/src/lib/utils'

const COPIED_TIMEOUT = 2000

interface UserDetailsContentProps {
  userDetails: StatsigUser | null | undefined
  onRefetch: () => void
  error?: string | null
}

const CopyableValue = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      event.stopPropagation()
      navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_TIMEOUT)
    },
    [value],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        copyToClipboard(event)
      }
    },
    [copyToClipboard],
  )

  return (
    <button
      className="flex items-center gap-2 group cursor-pointer border-0 bg-transparent p-0 text-left w-full"
      onClick={copyToClipboard}
      onKeyDown={handleKeyDown}
      type="button"
    >
      <span className="text-sm font-mono break-all text-foreground" title={value}>
        {value}
      </span>
      <TooltipProvider>
        <Tooltip open={copied}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity p-0"
            >
              {copied ? (
                <div className="text-green-500">✓</div>
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </button>
  )
}

const UserHeader = memo(({ userDetails }: { userDetails: StatsigUser }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xl font-bold truncate tracking-tight">
            {userDetails.name || 'Anonymous User'}
          </h4>
          {userDetails.statsigEnvironment && (
            <Badge
              variant="outline"
              className="capitalize px-2 py-0.5 text-xs font-medium shrink-0"
            >
              {userDetails.statsigEnvironment.tier || 'unknown'}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground group">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="w-16 text-xs font-medium uppercase tracking-wider">User ID</span>
            {userDetails.userID ? (
              <CopyableValue value={userDetails.userID} />
            ) : (
              <span className="font-mono text-muted-foreground/50">No User ID</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground group">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span className="w-16 text-xs font-medium uppercase tracking-wider">Stable ID</span>
            {userDetails.stableID ? (
              <CopyableValue value={userDetails.stableID} />
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
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border bg-card/50', className)}>
      <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center text-muted-foreground border shadow-sm shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  )
}

const UserOverview = memo(({ userDetails }: { userDetails: StatsigUser }) => {
  const hasContent =
    userDetails.email ||
    userDetails.country ||
    userDetails.locale ||
    userDetails.ip ||
    userDetails.userAgent

  if (!hasContent) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h5>
      </div>
      <Card className={cn('shadow-sm overflow-hidden', variant === 'private' && 'border-dashed')}>
        <div className="divide-y">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="p-3 flex flex-col gap-1 hover:bg-muted/50 transition-colors">
              <span className="text-xs font-medium text-muted-foreground">{key}</span>
              <CopyableValue
                value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
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

  const additionalProps = Object.fromEntries(
    Object.entries(userDetails).filter(([key]) => !standardKeys.has(key)),
  )

  return <PropertySection title="Additional Properties" icon={Database} data={additionalProps} />
})

UserAdditionalProperties.displayName = 'UserAdditionalProperties'

export const UserDetailsContent = memo(
  ({ userDetails, onRefetch, error }: UserDetailsContentProps) => {
    if (!userDetails || Object.keys(userDetails).length === 0 || error) {
      return <UserEmptyState onRefetch={onRefetch} error={error} />
    }

    return (
      <div className="space-y-8 pb-8">
        <UserHeader userDetails={userDetails} />

        <div className="space-y-6">
          <UserOverview userDetails={userDetails} />

          {(userDetails.custom ||
            userDetails.privateAttributes ||
            Object.keys(userDetails).length > 10) && <Separator />}

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
  },
)

UserDetailsContent.displayName = 'UserDetailsContent'
