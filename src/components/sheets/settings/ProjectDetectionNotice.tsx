import { CircleCheck, CircleHelp, CircleSlash, TriangleAlert } from 'lucide-react'
import React from 'react'

import type { ProjectDetectionStatus } from '@/src/lib/projects'

import { usePageProject } from '@/src/hooks/use-page-project'
import { MATCH_REASON_LABELS } from '@/src/lib/projects'

type ShownStatus = Exclude<ProjectDetectionStatus, 'pending'>

const NOTICE_STYLES: Record<ShownStatus, { Icon: typeof CircleCheck; className: string }> = {
  matched: { Icon: CircleCheck, className: 'border-emerald-500/50 bg-emerald-500/10' },
  'no-statsig': { Icon: CircleSlash, className: 'border-border bg-muted/50' },
  'unknown-project': { Icon: TriangleAlert, className: 'border-amber-500/50 bg-amber-500/10' },
  unverifiable: { Icon: CircleHelp, className: 'border-amber-500/50 bg-amber-500/10' },
}

/** Spells out whether the inspected page belongs to the project whose Console API key is in use. */
export function ProjectDetectionNotice() {
  const { activeLabel, detectedKey, hasProjects, reason, status } = usePageProject()

  if (!hasProjects || status === 'pending') {
    return null
  }

  const { className, Icon } = NOTICE_STYLES[status]

  return (
    <div className={`flex items-start gap-2 rounded-md border p-2 text-xs ${className}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="space-y-0.5">
        {status === 'matched' && (
          <p>
            This page belongs to <b>{activeLabel ?? 'the active project'}</b>
            {reason ? ` — ${MATCH_REASON_LABELS[reason].toLowerCase()}.` : '.'}
          </p>
        )}
        {status === 'unknown-project' && (
          <p>
            This page uses {detectedKey ? <span className="font-mono">{detectedKey}</span> : 'a Statsig SDK key'}, which
            none of your Console API keys owns, so nothing is loaded. Add that project below, or select the project it
            belongs to — that also pins this site to it.
          </p>
        )}
        {status === 'unverifiable' && (
          <p>
            Statsig runs on this page, but no project knows its own client keys or gates yet, so the page cannot be
            checked and nothing is loaded. Press refresh on a project, and prefer a Console API key with the{' '}
            <code>can_access_keys</code> scope.
          </p>
        )}
        {status === 'no-statsig' && (
          <p>
            No Statsig SDK was detected on this page, so it cannot be linked to a project and nothing is loaded. Select
            the project this site uses to pin it, or add its key below.
          </p>
        )}
      </div>
    </div>
  )
}
