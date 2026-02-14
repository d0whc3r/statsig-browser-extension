import { memo, useCallback } from 'react'

import type { StatsigUser } from '@/src/types/statsig'

import { UserEmptyState } from '@/src/components/sheets/user-details/UserEmptyState'
import { UserProperty } from '@/src/components/sheets/user-details/UserProperty'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent } from '@/src/components/ui/card'
import { Separator } from '@/src/components/ui/separator'

interface UserDetailsContentProps {
  userDetails: StatsigUser | null | undefined
  onRefetch: () => void
}

export const UserDetailsContent = memo(({ userDetails, onRefetch }: UserDetailsContentProps) => {
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

  if (!userDetails || Object.keys(userDetails).length === 0) {
    return <UserEmptyState onRefetch={onRefetch} />
  }

  const standardFields = ['userID', 'email', 'ip', 'userAgent', 'country', 'locale']

  return (
    <>
      <Card className="shadow-sm bg-background">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {getInitials(userDetails)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate">{userDetails.name || 'Anonymous User'}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {userDetails.userID || 'No User ID'}
              </p>
            </div>
            {userDetails.statsigEnvironment && (
              <Badge variant="secondary" className="capitalize">
                {userDetails.statsigEnvironment.tier || 'unknown'}
              </Badge>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {standardFields.map(
              (key, idx, arr) =>
                Boolean(userDetails[key]) && (
                  <UserProperty
                    key={key}
                    label={key === 'userID' ? 'User ID' : key}
                    value={userDetails[key]}
                    isLast={idx === arr.length - 1}
                  />
                ),
            )}
          </div>
        </CardContent>
      </Card>

      {userDetails.custom && Object.keys(userDetails.custom).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold px-1">Custom Properties</h4>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              {Object.entries(userDetails.custom).map(([key, value], idx, arr) => (
                <UserProperty key={key} label={key} value={value} isLast={idx === arr.length - 1} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {userDetails.privateAttributes && Object.keys(userDetails.privateAttributes).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold px-1">Private Attributes</h4>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              {Object.entries(userDetails.privateAttributes).map(([key, value], idx, arr) => (
                <UserProperty key={key} label={key} value={value} isLast={idx === arr.length - 1} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
})

UserDetailsContent.displayName = 'UserDetailsContent'
