import { Plus } from 'lucide-react'
import { ReactNode } from 'react'

import { Button } from '@/src/components/ui/button'

interface SharedOverridesListProps {
  onAddManual: () => void
  canEdit: boolean
  children: ReactNode
}

export const SharedOverridesList = ({
  onAddManual,
  canEdit,
  children,
}: SharedOverridesListProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">Active Overrides</h3>
      {canEdit && (
        <Button size="sm" onClick={onAddManual}>
          <Plus className="mr-2 h-4 w-4" />
          Add Manual
        </Button>
      )}
    </div>
    {children}
  </div>
)
