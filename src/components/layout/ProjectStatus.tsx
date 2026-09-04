import { CircleCheck, CircleHelp, CircleSlash, TriangleAlert } from 'lucide-react'
import React, { useCallback } from 'react'

import type { ProjectDetectionStatus } from '@/src/lib/projects'

import { Button } from '@/src/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { usePageProject } from '@/src/hooks/use-page-project'
import { MATCH_REASON_LABELS } from '@/src/lib/projects'
import { useUIStore } from '@/src/store/use-ui-store'

type ShownStatus = Exclude<ProjectDetectionStatus, 'pending'>

const STATUS_STYLES: Record<ShownStatus, { Icon: typeof CircleCheck; className: string }> = {
  matched: { Icon: CircleCheck, className: 'text-emerald-600 dark:text-emerald-500' },
  'no-statsig': { Icon: CircleSlash, className: 'text-muted-foreground' },
  'unknown-project': { Icon: TriangleAlert, className: 'text-amber-600 dark:text-amber-500' },
  unverifiable: { Icon: CircleHelp, className: 'text-amber-600 dark:text-amber-500' },
}

/** Tells at a glance whether the page being inspected belongs to the active Console API key. */
export function ProjectStatus() {
  const { activeLabel, detectedKey, hasProjects, reason, status } = usePageProject()
  const setSettingsSheetOpen = useUIStore((state) => state.setSettingsSheetOpen)

  const handleOpenSettings = useCallback(() => {
    setSettingsSheetOpen(true)
  }, [setSettingsSheetOpen])

  if (!hasProjects || status === 'pending') {
    return null
  }

  const projectLabel = activeLabel ?? 'Project'
  const { className, Icon } = STATUS_STYLES[status]

  const label = {
    matched: `${projectLabel} · this page`,
    'no-statsig': 'No Statsig on this page',
    'unknown-project': 'Other Statsig project',
    unverifiable: 'Project not verified',
  }[status]

  const detail = {
    matched: reason ? MATCH_REASON_LABELS[reason] : `This page belongs to ${projectLabel}.`,
    'no-statsig':
      'The page has no Statsig SDK, so it cannot be linked to a project and nothing is loaded. Add the key of the project this site uses, or pick one of yours.',
    'unknown-project': `The page uses ${detectedKey ?? 'a Statsig key'}, which none of your Console API keys owns. Nothing is loaded until that project's key is added.`,
    unverifiable:
      'None of your projects knows its own client keys or gates yet, so this page cannot be checked and nothing is loaded. Refresh a project in Settings, or use a Console API key with the "can_access_keys" scope.',
  }[status]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenSettings}
          className={`h-7 gap-1.5 px-2 text-xs font-normal ${className}`}
          aria-label={`Page project status: ${label}`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="max-w-[180px] truncate">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[320px]">
        {detail}
      </TooltipContent>
    </Tooltip>
  )
}
