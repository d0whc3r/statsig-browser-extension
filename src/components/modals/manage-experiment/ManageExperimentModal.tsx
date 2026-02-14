import { useCallback } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { useStore } from '@/src/store/use-store'

import { GroupsSection } from './GroupsSection'
import { OverridesSection } from './OverridesSection'

export function ManageExperimentModal() {
  const {
    currentItemId,
    isManageExperimentModalOpen,
    setItemSheetOpen,
    setManageExperimentModalOpen,
  } = useStore((state) => state)

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
          <DialogTitle>Manage Experiment: {currentItemId}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="overrides">Overrides</TabsTrigger>
          </TabsList>
          <TabsContent value="groups">
            <GroupsSection />
          </TabsContent>
          <TabsContent value="overrides">
            <OverridesSection />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
