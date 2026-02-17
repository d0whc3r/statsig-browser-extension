import { useCallback } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { useUIStore } from '@/src/store/use-ui-store'

import { OverridesSection } from './OverridesSection'

export function ManageExperimentModal() {
  const {
    currentItemId,
    isManageExperimentModalOpen,
    setItemSheetOpen,
    setManageExperimentModalOpen,
  } = useUIStore((state) => state)

  const handleCloseModal = useCallback(
    (open: boolean) => {
      if (!open) {
        setManageExperimentModalOpen(false)
        setItemSheetOpen(true)
      }
    },
    [setManageExperimentModalOpen, setItemSheetOpen],
  )

  if (!currentItemId) {
    return
  }

  return (
    <Dialog open={isManageExperimentModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Experiment Overrides: {currentItemId}</DialogTitle>
        </DialogHeader>
        <OverridesSection />
      </DialogContent>
    </Dialog>
  )
}
