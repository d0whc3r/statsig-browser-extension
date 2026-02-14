import { OverridesTable } from '@/src/components/tables/OverridesTable'
import { Button } from '@/src/components/ui/button'

interface OverridesListProps {
  typeApiKey: string
  onCreateOverrideClick: () => void
}

export const OverridesList = ({ typeApiKey, onCreateOverrideClick }: OverridesListProps) => (
  <>
    <OverridesTable />
    {typeApiKey === 'write-key' && (
      <Button className="w-full" onClick={onCreateOverrideClick}>
        Create override
      </Button>
    )}
  </>
)
