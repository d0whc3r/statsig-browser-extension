import { Copy } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import type { DynamicConfig } from '@/src/types/statsig'

import { DynamicConfigRules } from '@/src/components/DynamicConfigRules'
import { Button } from '@/src/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { useDynamicConfig } from '@/src/hooks/use-dynamic-config'
import { useUIStore } from '@/src/store/use-ui-store'

import { CommonSheet, SheetTabs } from './CommonSheet'

interface ConfigHeaderProps {
  isLoading: boolean
  config?: DynamicConfig
}

const ConfigHeader = ({ isLoading, config }: ConfigHeaderProps) => {
  const handleCopyId = useCallback(() => {
    if (config?.id) {
      navigator.clipboard.writeText(config.id)
    }
  }, [config?.id])

  return (
    <div className="flex justify-between items-start gap-4">
      <div className="space-y-1">
        <SheetTitle className="text-xl font-bold break-all">
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            config?.name || config?.id || 'Dynamic Config'
          )}
        </SheetTitle>
        {config?.id && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{config.id}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={handleCopyId}>
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy ID</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy ID</TooltipContent>
            </Tooltip>
          </div>
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
}

interface ConfigDetailsProps {
  isLoading: boolean
  error: unknown
  config?: DynamicConfig
}

const ConfigMetadata = ({ config }: { config: DynamicConfig }) => (
  <div className="bg-muted/50 rounded-lg p-3 border border-border space-y-3">
    <div>
      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
        Description
      </h3>
      <p className="text-xs leading-relaxed">{config.description || 'No description provided.'}</p>
    </div>

    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border/50">
      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Created</span>
        <div className="text-xs font-medium truncate">
          {new Date(config.createdTime).toLocaleDateString()}
          <span className="text-[10px] text-muted-foreground ml-1 font-normal">
            ({config.creatorName})
          </span>
        </div>
      </div>
      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase">Updated</span>
        <div className="text-xs font-medium truncate">
          {new Date(config.lastModifiedTime).toLocaleDateString()}
          <span className="text-[10px] text-muted-foreground ml-1 font-normal">
            ({config.lastModifierName})
          </span>
        </div>
      </div>
    </div>
  </div>
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
