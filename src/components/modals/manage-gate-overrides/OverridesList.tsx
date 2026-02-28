import { ChevronDown, ChevronUp } from 'lucide-react'
import { memo, useMemo, useState } from 'react'

import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'

import type { DeleteGateOverrideParams, OverrideType } from './types'

import { OverrideRow } from './OverrideRow'

interface OverridesListProps {
  allOverrides: {
    id: string
    type: OverrideType
    environment: string | null
    idType: string | null
    isCurrentUser: boolean
  }[]
  canEdit: boolean
  isPending: boolean
  onDeleteOverride: (params: DeleteGateOverrideParams) => void
  onSwitchToForm: () => void
}

export const OverridesList = memo(
  ({ allOverrides, canEdit, isPending, onDeleteOverride, onSwitchToForm }: OverridesListProps) => {
    const [showOthers, setShowOthers] = useState(false)

    const { currentUserOverrides, otherOverrides } = useMemo(() => {
      const current = allOverrides.filter((override) => override.isCurrentUser)
      const others = allOverrides.filter((override) => !override.isCurrentUser)
      return { currentUserOverrides: current, otherOverrides: others }
    }, [allOverrides])

    const hasOverrides = allOverrides.length > 0

    return (
      <SharedOverridesList onAddManual={onSwitchToForm} canEdit={canEdit}>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Result</TableHead>
                  {canEdit && <TableHead className="w-[50px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasOverrides ? (
                  <>
                    {currentUserOverrides.map((item) => (
                      <OverrideRow
                        key={`${item.type}-${item.id}-${item.idType}-${item.environment}`}
                        item={item}
                        canEdit={canEdit}
                        isPending={isPending}
                        onDeleteOverride={onDeleteOverride}
                      />
                    ))}
                    {showOthers &&
                      otherOverrides.map((item) => (
                        <OverrideRow
                          key={`${item.type}-${item.id}-${item.idType}-${item.environment}`}
                          item={item}
                          canEdit={canEdit}
                          isPending={isPending}
                          onDeleteOverride={onDeleteOverride}
                        />
                      ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <GeneralEmptyState variant="override" entityName="gate" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {otherOverrides.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowOthers(!showOthers)}
              >
                {showOthers ? (
                  <>
                    <ChevronUp className="mr-2 h-3 w-3" />
                    Hide {otherOverrides.length} other overrides
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-3 w-3" />
                    Show {otherOverrides.length} other overrides
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </SharedOverridesList>
    )
  },
)

OverridesList.displayName = 'OverridesList'
