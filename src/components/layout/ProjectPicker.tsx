import type { ReactNode } from 'react'

import { Check, RotateCcw, Settings } from 'lucide-react'
import React, { useCallback } from 'react'

import type { StatsigProject } from '@/src/lib/projects'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { useSwitchProject } from '@/src/hooks/use-projects'
import { useContextStore } from '@/src/store/use-context-store'
import { useSettingsStore } from '@/src/store/use-settings-store'
import { useUIStore } from '@/src/store/use-ui-store'

interface ProjectMenuItemProps {
  project: StatsigProject
  isPicked: boolean
  onPick: (projectId: string) => void
}

function ProjectMenuItem({ isPicked, onPick, project }: Readonly<ProjectMenuItemProps>) {
  const handleSelect = useCallback(() => {
    onPick(project.id)
  }, [onPick, project.id])

  return (
    <DropdownMenuItem className="cursor-pointer" onSelect={handleSelect}>
      <Check className={`h-4 w-4 ${isPicked ? '' : 'invisible'}`} />
      <span className="truncate">{project.label}</span>
    </DropdownMenuItem>
  )
}

interface ProjectPickerProps {
  /** The control opening the menu. */
  children: ReactNode
}

/**
 * Lets the user manage any configured project without visiting the site that uses it. The choice is
 * kept in memory only, so it dies with the popup and the page detection takes over again — pinning a
 * site to a project permanently is still a Settings decision.
 */
export function ProjectPicker({ children }: Readonly<ProjectPickerProps>) {
  const projects = useSettingsStore((state) => state.projects)
  const manualProjectId = useContextStore((state) => state.manualProjectId)
  const setManualProject = useContextStore((state) => state.setManualProject)
  const setSettingsSheetOpen = useUIStore((state) => state.setSettingsSheetOpen)
  const switchProject = useSwitchProject()

  const handleSelect = useCallback(
    (projectId: string) => {
      setManualProject(projectId)
      void switchProject(projectId)
    },
    [setManualProject, switchProject],
  )

  const handleClear = useCallback(() => {
    setManualProject(undefined)
  }, [setManualProject])

  const handleOpenSettings = useCallback(() => {
    setSettingsSheetOpen(true)
  }, [setSettingsSheetOpen])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-[280px]">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Manage a project without leaving this page. Only for this popup.
        </DropdownMenuLabel>
        {projects.map((project) => (
          <ProjectMenuItem
            key={project.id}
            project={project}
            isPicked={project.id === manualProjectId}
            onPick={handleSelect}
          />
        ))}
        <DropdownMenuSeparator />
        {manualProjectId && (
          <DropdownMenuItem className="cursor-pointer" onSelect={handleClear}>
            <RotateCcw className="h-4 w-4" />
            <span>Back to page detection</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer" onSelect={handleOpenSettings}>
          <Settings className="h-4 w-4" />
          <span>Project settings…</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
