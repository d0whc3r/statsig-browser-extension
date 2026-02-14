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
      <SheetContent className="w-full sm:max-w-xl overflow-y-hidden flex flex-col h-full p-0">
        {children}
      </SheetContent>
    </Sheet>
  )
}

interface SheetTabsProps {
  detailsContent: ReactNode
  rulesContent: ReactNode
  overridesContent: ReactNode
}

export function SheetTabs({ detailsContent, rulesContent, overridesContent }: SheetTabsProps) {
  return (
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
            <div className="p-6 space-y-6">{detailsContent}</div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rules" className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-6">{rulesContent}</div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="overrides" className="flex-1 m-0 min-h-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-6">{overridesContent}</div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
