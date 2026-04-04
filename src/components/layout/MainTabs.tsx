import { Beaker, Settings2, ToggleLeft, History } from 'lucide-react'
import { memo } from 'react'

import { AuditLogs } from '@/src/components/AuditLogs'
import { DynamicConfigsTable } from '@/src/components/tables/DynamicConfigsTable'
import { ExperimentsTable } from '@/src/components/tables/ExperimentsTable'
import { FeatureGatesTable } from '@/src/components/tables/FeatureGatesTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'

interface MainTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const MainTabs = memo(({ activeTab, onTabChange }: MainTabsProps) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-none border-b px-4 py-2">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments">
            <Beaker className="mr-2 h-4 w-4" />
            Experiments
          </TabsTrigger>
          <TabsTrigger value="dynamic_configs">
            <Settings2 className="mr-2 h-4 w-4" />
            Configs
          </TabsTrigger>
          <TabsTrigger value="feature_gates">
            <ToggleLeft className="mr-2 h-4 w-4" />
            Gates
          </TabsTrigger>
          <TabsTrigger value="audit_logs">
            <History className="mr-2 h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="experiments"
        className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0 data-[state=inactive]:hidden"
      >
        <ExperimentsTable />
      </TabsContent>

      <TabsContent
        value="dynamic_configs"
        className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0 data-[state=inactive]:hidden"
      >
        <DynamicConfigsTable />
      </TabsContent>

      <TabsContent
        value="feature_gates"
        className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0 data-[state=inactive]:hidden"
      >
        <FeatureGatesTable />
      </TabsContent>

      <TabsContent
        value="audit_logs"
        className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0 data-[state=inactive]:hidden"
      >
        <AuditLogs />
      </TabsContent>
    </Tabs>
  </div>
))
MainTabs.displayName = 'MainTabs'
