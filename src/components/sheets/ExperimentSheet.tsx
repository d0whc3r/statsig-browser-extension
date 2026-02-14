import { useCallback } from 'react'

import { ExperimentOverrides } from '@/src/components/ExperimentOverrides'
import { ExperimentRules } from '@/src/components/ExperimentRules'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/src/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { useExperiment } from '@/src/hooks/use-experiment'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useOverrides } from '@/src/hooks/use-overrides'
import { useStore } from '@/src/store/use-store'

import { ExperimentSheetDetails } from './ExperimentSheetDetails'
import { ExperimentSheetHeader } from './ExperimentSheetHeader'

export const ExperimentSheet = () => {
  const { currentItemId, isItemSheetOpen, setItemSheetOpen, setManageExperimentModalOpen } =
    useStore((state) => state)

  const [typeApiKey] = useLocalStorage('statsig-type-api-key', 'read-key')

  const {
    data: experiment,
    isLoading: isLoadingExperiment,
    error: experimentError,
  } = useExperiment(currentItemId)
  const {
    data: overrides,
    isLoading: isLoadingOverrides,
    error: overridesError,
  } = useOverrides(currentItemId)

  const isLoading = isLoadingExperiment || isLoadingOverrides
  const error = experimentError || overridesError

  const isOpen = isItemSheetOpen && Boolean(currentItemId)

  const handleClose = useCallback(() => {
    setItemSheetOpen(false)
  }, [setItemSheetOpen])

  const handleManage = useCallback(() => {
    setManageExperimentModalOpen(true)
  }, [setManageExperimentModalOpen])

  return (
    <Sheet open={isOpen} onOpenChange={setItemSheetOpen}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <ExperimentSheetHeader
          isLoading={isLoading}
          experiment={experiment}
          currentItemId={currentItemId}
          typeApiKey={typeApiKey}
          onClose={handleClose}
          onManage={handleManage}
        />

        <div className="flex-1 overflow-hidden flex flex-col relative">
          <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-2 border-b shrink-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="overrides">Overrides</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="details" className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <ExperimentSheetDetails
                    isLoading={isLoading}
                    error={error}
                    experiment={experiment}
                  />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rules" className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {currentItemId && <ExperimentRules experimentId={currentItemId} />}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="overrides" className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {overrides && experiment && (
                    <ExperimentOverrides overrides={overrides} groups={experiment.groups} />
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
