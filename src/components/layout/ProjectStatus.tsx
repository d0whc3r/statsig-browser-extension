import { CircleCheck, CircleHelp, CircleSlash, Hand, TriangleAlert } from 'lucide-react'
import React from 'react'

import type { ProjectDetectionStatus } from '@/src/lib/projects'

import { ProjectPicker } from '@/src/components/layout/ProjectPicker'
import { Button } from '@/src/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { usePageProject } from '@/src/hooks/use-page-project'
import { MATCH_REASON_LABELS } from '@/src/lib/projects'

type ShownStatus = Exclude<ProjectDetectionStatus, 'pending'>

const STATUS_STYLES: Record<ShownStatus, { Icon: typeof CircleCheck; className: string }> = {
  matched: { Icon: CircleCheck, className: 'text-emerald-600 dark:text-emerald-500' },
  'no-statsig': { Icon: CircleSlash, className: 'text-muted-foreground' },
  'unknown-project': { Icon: TriangleAlert, className: 'text-amber-600 dark:text-amber-500' },
  unverifiable: { Icon: CircleHelp, className: 'text-amber-600 dark:text-amber-500' },
}

const MANUAL_STYLE = { Icon: Hand, className: 'text-sky-600 dark:text-sky-500' }

/** Tells at a glance whether the page being inspected belongs to the active Console API key. */
export function ProjectStatus() {
  const { activeLabel, detectedKey, hasProjects, reason, status } = usePageProject()

  if (!hasProjects || status === 'pending') {
    return null
  }

  const projectLabel = activeLabel ?? 'Project'
  const isManual = reason === 'manual'
  const { className, Icon } = isManual ? MANUAL_STYLE : STATUS_STYLES[status]

  const label = isManual
    ? `${projectLabel} · picked by hand`
    : {
        matched: `${projectLabel} · this page`,
        'no-statsig': 'No Statsig on this page',
        'unknown-project': 'Other Statsig project',
        unverifiable: 'Project not verified',
      }[status]

  const detail = isManual
    ? `You are working on ${projectLabel}, which this page does not use. The choice lasts until the popup closes.`
    : {
        matched: reason ? MATCH_REASON_LABELS[reason] : `This page belongs to ${projectLabel}.`,
        'no-statsig':
          'The page has no Statsig SDK, so it cannot be linked to a project and nothing is loaded. Pick the project you want to manage, or add the key of the one this site uses.',
        'unknown-project': `The page uses ${detectedKey ?? 'a Statsig key'}, which none of your Console API keys owns. Pick the project you want to manage, or add that project's key.`,
        unverifiable:
          'None of your projects knows its own client keys or gates yet, so this page cannot be checked and nothing is loaded. Pick the project you want to manage, refresh a project in Settings, or use a Console API key with the "can_access_keys" scope.',
      }[status]

  return (
    <Tooltip>
      <ProjectPicker>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 gap-1.5 px-2 text-xs font-normal ${className}`}
            aria-label={`Page project status: ${label}`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="max-w-[180px] truncate">{label}</span>
          </Button>
        </TooltipTrigger>
      </ProjectPicker>
      <TooltipContent side="bottom" className="max-w-[320px]">
        {detail}
      </TooltipContent>
    </Tooltip>
  )
}
