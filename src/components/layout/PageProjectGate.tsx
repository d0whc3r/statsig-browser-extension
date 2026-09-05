import { CircleHelp, CircleSlash, Loader2, TriangleAlert } from 'lucide-react'
import React from 'react'

import type { ProjectDetectionStatus } from '@/src/lib/projects'

import { ProjectPicker } from '@/src/components/layout/ProjectPicker'
import { AddProjectForm } from '@/src/components/sheets/settings/AddProjectForm'
import { Button } from '@/src/components/ui/button'
import { useActiveTabOrigin } from '@/src/hooks/use-active-tab-origin'
import { usePageProject } from '@/src/hooks/use-page-project'

type GatedStatus = Exclude<ProjectDetectionStatus, 'matched' | 'pending'>

const GATE_COPY: Record<GatedStatus, { Icon: typeof CircleSlash; title: string }> = {
  'no-statsig': { Icon: CircleSlash, title: 'No Statsig SDK on this page' },
  'unknown-project': { Icon: TriangleAlert, title: 'This page belongs to another Statsig project' },
  unverifiable: { Icon: CircleHelp, title: 'This page cannot be checked against your projects' },
}

const isGatedStatus = (status: ProjectDetectionStatus): status is GatedStatus =>
  status !== 'matched' && status !== 'pending'

const describeSite = (status: GatedStatus, site: string, detectedKey: string | undefined) => {
  if (status === 'unverifiable') {
    return `Statsig runs on ${site}, but none of your projects knows its own client keys or gates yet, so the page cannot be linked to one.`
  }
  if (status === 'no-statsig') {
    return `No Statsig SDK was detected on ${site}, so it cannot be linked to a project. Sites evaluating Statsig on the server look the same from here.`
  }
  return `${site} uses ${detectedKey ?? 'a Statsig SDK key'}, which none of your Console API keys owns.`
}

interface GatePanelProps {
  status: GatedStatus
  detectedKey?: string
}

function GatePanel({ detectedKey, status }: Readonly<GatePanelProps>) {
  const origin = useActiveTabOrigin()

  const { Icon, title } = GATE_COPY[status]
  const site = origin ? origin.replace(/^https?:\/\//u, '') : 'this site'

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="text-xs text-muted-foreground">{describeSite(status, site, detectedKey)}</p>
            <p className="text-xs text-muted-foreground">
              Nothing is loaded on its own: the extension will not guess which project&apos;s data belongs here. Pick
              one below to manage it anyway — that choice only lasts until the popup closes.
            </p>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <p className="pb-2 text-xs text-muted-foreground">
            Add the Console API key of the project {site} uses. It will be used for this site from now on.
          </p>
          <AddProjectForm pinOrigin />
        </div>

        <ProjectPicker>
          <Button type="button" variant="outline" size="sm" className="w-full">
            Manage one of my projects anyway
          </Button>
        </ProjectPicker>
      </div>
    </div>
  )
}

/**
 * Shown instead of the gates, experiments, configs and audit logs whenever the inspected page does
 * not belong to a configured project. Nothing is fetched on its own in that case — guessing which
 * project owns the page would be misleading — so the panel asks for the Console API key of the
 * project this site uses, or lets the user pick one of theirs for the life of the popup.
 */
export function PageProjectGate() {
  const { detectedKey, hasProjects, status } = usePageProject()

  // No key configured at all: the login modal already owns the screen.
  if (!hasProjects) {
    return null
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking which Statsig project this page uses…
      </div>
    )
  }

  return isGatedStatus(status) ? <GatePanel status={status} detectedKey={detectedKey} /> : null
}
