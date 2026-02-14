import { FeatureGateRules } from '@/src/components/FeatureGateRules'
import { GateOverridesSection } from '@/src/components/modals/manage-gate-overrides/GateOverridesSection'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/src/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { useFeatureGate } from '@/src/hooks/use-feature-gate'
import { useGateOverrides } from '@/src/hooks/use-gate-overrides'
import { useStore } from '@/src/store/use-store'

import { FeatureGateSheetDetails } from './FeatureGateSheetDetails'
import { FeatureGateSheetHeader } from './FeatureGateSheetHeader'

export default function FeatureGateSheet() {
  const { currentItemId, isItemSheetOpen, setItemSheetOpen } = useStore((state) => state)
  const {
    data: featureGate,
    error: gateError,
    isLoading: isLoadingGate,
  } = useFeatureGate(currentItemId)
  const { error: overridesError, isLoading: isLoadingOverrides } = useGateOverrides(currentItemId)

  const isLoading = isLoadingGate || isLoadingOverrides
  const error = gateError || overridesError

  return (
    <Sheet open={isItemSheetOpen} onOpenChange={setItemSheetOpen}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-hidden flex flex-col h-full p-0">
        <FeatureGateSheetHeader
          isLoading={isLoading}
          featureGate={featureGate}
          currentItemId={currentItemId}
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="details" className="flex-1 flex flex-col">
            <div className="px-6 pt-2 border-b">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="overrides">Overrides</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="details" className="m-0 space-y-6">
                  <FeatureGateSheetDetails
                    isLoading={isLoading}
                    error={error}
                    featureGate={featureGate}
                  />
                </TabsContent>

                <TabsContent value="rules" className="m-0">
                  {currentItemId && <FeatureGateRules featureGateId={currentItemId} />}
                </TabsContent>

                <TabsContent value="overrides" className="m-0">
                  <GateOverridesSection />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
