import { FolderKanban } from 'lucide-react'
import React from 'react'

import { AddProjectForm } from '@/src/components/sheets/settings/AddProjectForm'
import { ProjectDetectionNotice } from '@/src/components/sheets/settings/ProjectDetectionNotice'
import { ProjectRow } from '@/src/components/sheets/settings/ProjectRow'
import { useContextStore } from '@/src/store/use-context-store'
import { useSettingsStore } from '@/src/store/use-settings-store'

export function ProjectsSettings() {
  const projects = useSettingsStore((state) => state.projects)
  const activeProjectId = useSettingsStore((state) => state.activeProjectId)
  const projectMatch = useContextStore((state) => state.projectMatch)

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <FolderKanban className="h-3.5 w-3.5" />
        Statsig Projects
      </h3>
      <p className="text-xs text-muted-foreground">
        Add one Console API key per project. The extension only loads the project matching the Statsig SDK key detected
        on the page; selecting one manually pins the current site to it.
      </p>

      <ProjectDetectionNotice />

      <div className="space-y-2">
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            isActive={project.id === activeProjectId}
            matchReason={projectMatch?.projectId === project.id ? projectMatch.reason : undefined}
          />
        ))}
      </div>

      <AddProjectForm />
    </div>
  )
}
