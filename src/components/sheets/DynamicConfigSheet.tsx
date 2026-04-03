import { useMemo } from 'react'

import type { DynamicConfig } from '@/src/types/statsig'

import { DynamicConfigRules } from '@/src/components/DynamicConfigRules'
import {
  EntityDetailsContainer,
  EntityDetailsDivider,
  EntityDetailsField,
  EntityDetailsHeader,
  EntityDetailsSection,
} from '@/src/components/sheets/EntityDetails'
import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useDynamicConfig } from '@/src/hooks/use-dynamic-config'
import { useUIStore } from '@/src/store/use-ui-store'

import { CommonSheet, SheetTabs } from './CommonSheet'

interface ConfigHeaderProps {
  isLoading: boolean
  config?: DynamicConfig
}

const ConfigHeader = ({ isLoading, config }: ConfigHeaderProps) => (
  <div className="flex justify-between items-start gap-4">
    <div className="space-y-1">
      <SheetTitle className="text-xl font-bold break-all">
        {isLoading ? (
          <Skeleton className="h-6 w-32" />
        ) : (
          (config?.name ?? config?.id ?? 'Dynamic Config')
        )}
      </SheetTitle>
      {config?.id && (
        <CopyableText
          value={config.id}
          copyLabel="Copy ID"
          containerClassName="text-xs text-muted-foreground font-mono"
        />
      )}
    </div>
    <div className="shrink-0">
      {config?.id && (
        <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
          <a
            href={`https://console.statsig.com/dynamic_configs/${config.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Statsig
          </a>
        </Button>
      )}
    </div>
  </div>
)

interface ConfigDetailsProps {
  isLoading: boolean
  error: unknown
  config?: DynamicConfig
}

const ConfigMetadata = ({ config }: { config: DynamicConfig }) => (
  <EntityDetailsContainer>
    <EntityDetailsHeader>
      <EntityDetailsField label="Created">
        <div className="flex items-center gap-1">
          {new Date(config.createdTime).toLocaleDateString()}
          <span className="text-[10px] text-muted-foreground font-normal">
            ({config.creatorName})
          </span>
        </div>
      </EntityDetailsField>

      <EntityDetailsDivider />

      <EntityDetailsField label="Updated">
        <div className="flex items-center gap-1">
          {new Date(config.lastModifiedTime).toLocaleDateString()}
          <span className="text-[10px] text-muted-foreground font-normal">
            ({config.lastModifierName})
          </span>
        </div>
      </EntityDetailsField>
    </EntityDetailsHeader>

    <EntityDetailsSection title="Description">
      <p>{config.description || 'No description provided.'}</p>
    </EntityDetailsSection>
  </EntityDetailsContainer>
)

const ConfigDefaultValue = ({ defaultValue }: { defaultValue: unknown }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Default Value</h3>
    <div className="rounded-md border bg-muted p-4 overflow-auto max-h-[400px]">
      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
        {JSON.stringify(defaultValue, undefined, 2)}
      </pre>
    </div>
  </div>
)

const ConfigDetails = ({ isLoading, error, config }: ConfigDetailsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-sm text-destructive py-4">
        Failed to load config details: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  if (!config) {
    return
  }

  return (
    <>
      <ConfigMetadata config={config} />
      <ConfigDefaultValue defaultValue={config.defaultValue} />
    </>
  )
}

export const DynamicConfigSheet = () => {
  const { currentItemId, isItemSheetOpen, currentItemType } = useUIStore((state) => state)

  const isOpen = isItemSheetOpen && currentItemType === 'dynamic_config'

  const { data: config, isLoading, error } = useDynamicConfig(isOpen ? currentItemId : undefined)

  const detailsContent = useMemo(
    () => <ConfigDetails isLoading={isLoading} error={error} config={config} />,
    [isLoading, error, config],
  )

  const rulesContent = useMemo(
    () => (config ? <DynamicConfigRules configId={config.id} /> : null),
    [config],
  )

  return (
    <CommonSheet type="dynamic_config">
      <SheetHeader className="px-6 py-4 border-b pr-12">
        <ConfigHeader isLoading={isLoading} config={config} />
        <SheetDescription className="sr-only">
          Details for dynamic config {config?.name}
        </SheetDescription>
      </SheetHeader>
      <SheetTabs detailsContent={detailsContent} rulesContent={rulesContent} />
    </CommonSheet>
  )
}
