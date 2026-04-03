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
  <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-2 border-b flex-none">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments">
            <Beaker className="w-4 h-4 mr-2" />
            Experiments
          </TabsTrigger>
          <TabsTrigger value="dynamic_configs">
            <Settings2 className="w-4 h-4 mr-2" />
            Configs
          </TabsTrigger>
          <TabsTrigger value="feature_gates">
            <ToggleLeft className="w-4 h-4 mr-2" />
            Gates
          </TabsTrigger>
          <TabsTrigger value="audit_logs">
            <History className="w-4 h-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="experiments"
        className="flex-1 flex flex-col min-h-0 overflow-hidden m-0 p-0 data-[state=inactive]:hidden"
      >
        <ExperimentsTable />
      </TabsContent>

      <TabsContent
        value="dynamic_configs"
        className="flex-1 flex flex-col min-h-0 overflow-hidden m-0 p-0 data-[state=inactive]:hidden"
      >
        <DynamicConfigsTable />
      </TabsContent>

      <TabsContent
        value="feature_gates"
        className="flex-1 flex flex-col min-h-0 overflow-hidden m-0 p-0 data-[state=inactive]:hidden"
      >
        <FeatureGatesTable />
      </TabsContent>

      <TabsContent
        value="audit_logs"
        className="flex-1 flex flex-col min-h-0 overflow-hidden m-0 p-0 data-[state=inactive]:hidden"
      >
        <AuditLogs />
      </TabsContent>
    </Tabs>
  </div>
))
MainTabs.displayName = 'MainTabs'
