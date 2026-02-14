import { Database, Globe, Lock, Mail, MapPin, Monitor, Network, User } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { StatsigUser } from '@/src/types/statsig'

import { UserEmptyState } from '@/src/components/sheets/user-details/UserEmptyState'
import { UserProperty } from '@/src/components/sheets/user-details/UserProperty'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent } from '@/src/components/ui/card'

interface UserDetailsContentProps {
  userDetails: StatsigUser | null | undefined
  onRefetch: () => void
}

const UserHeader = memo(({ userDetails }: { userDetails: StatsigUser }) => {
  const getInitials = useCallback((details: StatsigUser) => {
    if (details.name) {
      return details.name
        .split(' ')
        .map((namePart: string) => namePart[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return details.userID?.slice(0, 2).toUpperCase() || 'U'
  }, [])

  return (
    <Card className="shadow-sm border-none bg-muted/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl ring-4 ring-background shadow-sm">
            {getInitials(userDetails)}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="text-xl font-bold truncate tracking-tight">
              {userDetails.name || 'Anonymous User'}
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="font-mono truncate max-w-[200px]" title={userDetails.userID}>
                {userDetails.userID || 'No User ID'}
              </span>
            </div>
            {userDetails.statsigEnvironment && (
              <div className="pt-1">
                <Badge variant="secondary" className="capitalize px-2 py-0.5 text-xs font-medium">
                  {userDetails.statsigEnvironment.tier || 'unknown'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

UserHeader.displayName = 'UserHeader'

const UserIdentityCard = memo(({ userDetails }: { userDetails: StatsigUser }) => (
  <div className="space-y-3">
    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
      Identity & Location
    </h5>
    <Card className="shadow-sm">
      <CardContent className="p-0 divide-y">
        {userDetails.email && (
          <div className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="text-sm font-medium truncate">{userDetails.email}</p>
            </div>
          </div>
        )}
        {userDetails.country && (
          <div className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-md bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Country</p>
              <p className="text-sm font-medium truncate">{userDetails.country}</p>
            </div>
          </div>
        )}
        {userDetails.locale && (
          <div className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-md bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Globe className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Locale</p>
              <p className="text-sm font-medium truncate">{userDetails.locale}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
))

UserIdentityCard.displayName = 'UserIdentityCard'

const UserDeviceCard = memo(({ userDetails }: { userDetails: StatsigUser }) => (
  <div className="space-y-3">
    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
      Device & Network
    </h5>
    <Card className="shadow-sm">
      <CardContent className="p-0 divide-y">
        {userDetails.ip && (
          <div className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Network className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">IP Address</p>
              <p className="text-sm font-medium font-mono truncate">{userDetails.ip}</p>
            </div>
          </div>
        )}
        {userDetails.userAgent && (
          <div className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
              <Monitor className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">User Agent</p>
              <p className="text-xs font-medium truncate" title={userDetails.userAgent}>
                {userDetails.userAgent}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
))

UserDeviceCard.displayName = 'UserDeviceCard'

const UserCustomProperties = memo(({ userDetails }: { userDetails: StatsigUser }) => {
  if (!userDetails.custom || Object.keys(userDetails.custom).length === 0) {
    // eslint-disable-next-line unicorn/no-null
    return null
  }

  return (
    <div className="space-y-3">
      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
        <Database className="h-3.5 w-3.5" />
        Custom Properties
      </h5>
      <Card className="shadow-sm">
        <CardContent className="p-4 grid gap-4 sm:grid-cols-2">
          {Object.entries(userDetails.custom).map(([key, value]) => (
            <UserProperty key={key} label={key} value={value} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
})

UserCustomProperties.displayName = 'UserCustomProperties'

const UserPrivateAttributes = memo(({ userDetails }: { userDetails: StatsigUser }) => {
  if (!userDetails.privateAttributes || Object.keys(userDetails.privateAttributes).length === 0) {
    // eslint-disable-next-line unicorn/no-null
    return null
  }

  return (
    <div className="space-y-3">
      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5" />
        Private Attributes
      </h5>
      <Card className="shadow-sm border-dashed">
        <CardContent className="p-4 grid gap-4 sm:grid-cols-2">
          {Object.entries(userDetails.privateAttributes).map(([key, value]) => (
            <UserProperty key={key} label={key} value={value} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
})

UserPrivateAttributes.displayName = 'UserPrivateAttributes'

export const UserDetailsContent = memo(({ userDetails, onRefetch }: UserDetailsContentProps) => {
  if (!userDetails || Object.keys(userDetails).length === 0) {
    return <UserEmptyState onRefetch={onRefetch} />
  }

  return (
    <div className="space-y-6">
      <UserHeader userDetails={userDetails} />
      <div className="grid gap-6">
        <UserIdentityCard userDetails={userDetails} />
        <UserDeviceCard userDetails={userDetails} />
        <UserCustomProperties userDetails={userDetails} />
        <UserPrivateAttributes userDetails={userDetails} />
      </div>
    </div>
  )
})

UserDetailsContent.displayName = 'UserDetailsContent'
