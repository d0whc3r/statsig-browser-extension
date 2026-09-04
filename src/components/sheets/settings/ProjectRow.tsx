import { Check, RefreshCw, Trash2 } from 'lucide-react'
import React, { useCallback, useState } from 'react'

import type { ProjectMatchReason, StatsigProject } from '@/src/lib/projects'

import { ProjectLabelInput } from '@/src/components/sheets/settings/ProjectLabelInput'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { useRefreshProject, useSwitchProject } from '@/src/hooks/use-projects'
import { MATCH_REASON_LABELS } from '@/src/lib/projects'
import { useSettingsStore } from '@/src/store/use-settings-store'

interface ProjectRowProps {
  project: StatsigProject
  isActive: boolean
  matchReason?: ProjectMatchReason
}

const KEY_PREVIEW_LENGTH = 14

const detectionBadge = (project: StatsigProject) => {
  if (project.clientKeys.length > 0) {
    return { label: `${project.clientKeys.length} client keys`, variant: 'secondary' as const }
  }
  if (project.gateHashes.length > 0) {
    return { label: 'Gate fingerprint', variant: 'secondary' as const }
  }
  return { label: 'No detection data', variant: 'outline' as const }
}

export function ProjectRow({ isActive, matchReason, project }: Readonly<ProjectRowProps>) {
  const switchProject = useSwitchProject()
  const refreshProject = useRefreshProject()
  const removeProject = useSettingsStore((state) => state.removeProject)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleSelect = useCallback(() => {
    void switchProject(project.id, true)
  }, [project.id, switchProject])

  const handleRemove = useCallback(() => {
    void removeProject(project.id)
  }, [project.id, removeProject])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    void refreshProject(project.id, project.apiKey).finally(() => {
      setIsRefreshing(false)
    })
  }, [project.apiKey, project.id, refreshProject])

  const detection = detectionBadge(project)

  return (
    <div className="flex items-start gap-2 rounded-md border p-2" data-active={isActive}>
      <Button
        type="button"
        variant={isActive ? 'default' : 'outline'}
        size="icon"
        className="mt-0.5 h-7 w-7 shrink-0"
        onClick={handleSelect}
        aria-label={isActive ? `${project.label} is active` : `Use ${project.label}`}
        aria-pressed={isActive}
      >
        {isActive && <Check className="h-4 w-4" />}
      </Button>

      <div className="min-w-0 flex-1 space-y-1">
        <ProjectLabelInput projectId={project.id} label={project.label} />
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {project.apiKey.slice(0, KEY_PREVIEW_LENGTH)}…
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant={detection.variant}>{detection.label}</Badge>
          {matchReason && isActive && <Badge variant="default">{MATCH_REASON_LABELS[matchReason]}</Badge>}
          {project.origins.map((origin) => (
            <Badge key={origin} variant="outline">
              {origin.replace(/^https?:\/\//u, '')}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-label={`Refresh detection data for ${project.label}`}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive"
        onClick={handleRemove}
        aria-label={`Remove ${project.label}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
