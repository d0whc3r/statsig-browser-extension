import { useMemo } from 'react'

import type { DynamicConfig } from '@/src/types/statsig'

import { DynamicConfigRules } from '@/src/components/DynamicConfigRules'
import { EntityDetailsContainer, EntityDetailsSection, EntityDetailsTags } from '@/src/components/sheets/EntityDetails'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import { TimeAgo } from '@/src/components/ui/time-ago'
import { useDynamicConfig } from '@/src/hooks/use-dynamic-config'
import { useUIStore } from '@/src/store/use-ui-store'

import { CommonSheet, SheetTabs } from './CommonSheet'

interface ConfigHeaderProps {
  isLoading: boolean
  config?: DynamicConfig
}

const ConfigHeader = ({ isLoading, config }: ConfigHeaderProps) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <SheetTitle className="text-xl font-bold break-all">
          {isLoading ? <Skeleton className="h-6 w-32" /> : (config?.name ?? config?.id ?? 'Dynamic Config')}
        </SheetTitle>
        {!isLoading && config && (
          <Badge variant={config.isEnabled ? 'default' : 'destructive'} className="h-5 shrink-0 px-1.5 text-[10px]">
            {config.isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {config?.id && (
          <CopyableText
            value={config.id}
            copyLabel="Copy ID"
            containerClassName="text-xs text-muted-foreground font-mono"
          />
        )}
        {!isLoading && config && (
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              Created <TimeAgo date={config.createdTime} />
            </span>
            <span className="flex items-center gap-1">
              Updated <TimeAgo date={config.lastModifiedTime} />
            </span>
          </div>
        )}
      </div>
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

const ConfigMetadata = ({ config }: { config: DynamicConfig }) => {
  const hasTags = config.tags && config.tags.length > 0
  const hasDescription = Boolean(config.description)

  if (!hasTags && !hasDescription) {
    return null
  }

  return (
    <EntityDetailsContainer>
      {hasTags && (
        <EntityDetailsSection title="Tags">
          <EntityDetailsTags tags={config.tags} />
        </EntityDetailsSection>
      )}

      {hasDescription && (
        <EntityDetailsSection title="Description">
          <p>{config.description}</p>
        </EntityDetailsSection>
      )}
    </EntityDetailsContainer>
  )
}

const ConfigDefaultValue = ({ defaultValue }: { defaultValue: unknown }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Default Value</h3>
    <div className="max-h-[400px] overflow-auto rounded-md border bg-muted p-4">
      <pre className="font-mono text-xs break-all whitespace-pre-wrap">
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
      <div className="py-4 text-center text-sm text-destructive">
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

  const rulesContent = useMemo(() => (config ? <DynamicConfigRules configId={config.id} /> : null), [config])

  return (
    <CommonSheet type="dynamic_config">
      <SheetHeader className="border-b px-6 py-4 pr-12">
        <ConfigHeader isLoading={isLoading} config={config} />
        <SheetDescription className="sr-only">Details for dynamic config {config?.name}</SheetDescription>
      </SheetHeader>
      <SheetTabs detailsContent={detailsContent} rulesContent={rulesContent} />
    </CommonSheet>
  )
}
