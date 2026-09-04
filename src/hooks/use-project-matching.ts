import { useEffect } from 'react'

import { useActiveTabOrigin } from '@/src/hooks/use-active-tab-origin'
import { matchProject } from '@/src/lib/projects'
import { queryClient } from '@/src/lib/query-client'
import { useContextStore } from '@/src/store/use-context-store'
import { useSettingsStore } from '@/src/store/use-settings-store'

/**
 * Keeps the active project in sync with the Statsig keys detected on the inspected page,
 * so the extension talks to the project the page actually uses.
 */
export const useProjectMatching = () => {
  const detectedKeys = useContextStore((state) => state.detectedKeys)
  const setProjectMatch = useContextStore((state) => state.setProjectMatch)
  const projects = useSettingsStore((state) => state.projects)
  const activeProjectId = useSettingsStore((state) => state.activeProjectId)
  const setActiveProject = useSettingsStore((state) => state.setActiveProject)
  const origin = useActiveTabOrigin()

  useEffect(() => {
    if (projects.length === 0) {
      return
    }

    const match = matchProject(projects, detectedKeys, origin)
    setProjectMatch(match)

    if (match && match.projectId !== activeProjectId) {
      queryClient.clear()
      void setActiveProject(match.projectId)
    }
  }, [projects, detectedKeys, origin, activeProjectId, setActiveProject, setProjectMatch])
}
