import type { ReactNode } from 'react'

import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/src/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { useUIStore } from '@/src/store/use-ui-store'

interface CommonSheetProps {
  type: 'feature_gate' | 'dynamic_config' | 'experiment'
  children: ReactNode
}

export function CommonSheet({ type, children }: CommonSheetProps) {
  const { isItemSheetOpen, setItemSheetOpen, currentItemType } = useUIStore((state) => state)

  const isOpen = isItemSheetOpen && currentItemType === type

  return (
    <Sheet open={isOpen} onOpenChange={setItemSheetOpen}>
      <SheetContent className="flex h-full w-full flex-col overflow-y-hidden p-0 sm:max-w-xl">{children}</SheetContent>
    </Sheet>
  )
}

interface SheetTabsProps {
  detailsContent: ReactNode
  rulesContent: ReactNode
  overridesContent?: ReactNode
  labels?: {
    details?: string
    rules?: string
    overrides?: string
  }
}

const EMPTY_LABELS = {}

export function SheetTabs({ detailsContent, rulesContent, overridesContent, labels = EMPTY_LABELS }: SheetTabsProps) {
  const { details = 'Details', rules = 'Rules', overrides = 'Overrides' } = labels
  const gridCols = overridesContent ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-6">
          <TabsList className={`grid w-full ${gridCols}`}>
            <TabsTrigger value="details">{details}</TabsTrigger>
            <TabsTrigger value="rules">{rules}</TabsTrigger>
            {overridesContent && <TabsTrigger value="overrides">{overrides}</TabsTrigger>}
          </TabsList>
        </div>

        <TabsContent value="details" className="m-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6">{detailsContent}</div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rules" className="m-0 min-h-0 flex-1 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-6">{rulesContent}</div>
          </ScrollArea>
        </TabsContent>

        {overridesContent && (
          <TabsContent value="overrides" className="m-0 min-h-0 flex-1 data-[state=inactive]:hidden">
            <ScrollArea className="h-full">
              <div className="p-6">{overridesContent}</div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
