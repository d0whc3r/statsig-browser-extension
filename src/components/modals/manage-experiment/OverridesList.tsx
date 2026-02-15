import { SharedOverridesList } from '@/src/components/common/SharedOverridesList'
import { OverridesTable } from '@/src/components/tables/OverridesTable'

interface OverridesListProps {
  typeApiKey: string
  onCreateOverrideClick: () => void
  overridesData:
    | {
        userIDOverrides: any[]
        overrides: any[]
      }
    | undefined
  currentItemId: string | undefined
}

export const OverridesList = ({
  typeApiKey,
  onCreateOverrideClick,
  overridesData,
  currentItemId,
}: OverridesListProps) => (
  <SharedOverridesList onAddManual={onCreateOverrideClick} canEdit={typeApiKey === 'write-key'}>
    <OverridesTable
      overridesData={overridesData}
      currentItemId={currentItemId}
      typeApiKey={typeApiKey}
    />
  </SharedOverridesList>
)
