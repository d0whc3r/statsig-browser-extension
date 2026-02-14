import { useCallback } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { useStore } from '@/src/store/use-store'

import { GateOverridesSection } from './GateOverridesSection'

export function ManageGateOverridesModal() {
  const {
    currentItemId,
    isManageGateOverridesModalOpen,
    setItemSheetOpen,
    setGateOverridesModalOpen,
  } = useStore((state) => state)

  const handleCloseModal = useCallback(
    (open: boolean) => {
      if (!open) {
        setGateOverridesModalOpen(false)
        setItemSheetOpen(true)
      }
    },
    [setGateOverridesModalOpen, setItemSheetOpen],
  )

  if (!currentItemId) {
    return
  }

  return (
    <Dialog open={isManageGateOverridesModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Gate Overrides: {currentItemId}</DialogTitle>
        </DialogHeader>
        <GateOverridesSection />
      </DialogContent>
    </Dialog>
  )
}
