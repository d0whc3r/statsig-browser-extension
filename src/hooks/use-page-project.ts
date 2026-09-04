import { findProject, getProjectDetection } from '@/src/lib/projects'
import { useContextStore } from '@/src/store/use-context-store'
import { useSettingsStore } from '@/src/store/use-settings-store'

/**
 * Whether the inspected page belongs to one of the configured projects, which is what decides if
 * any project data may be loaded at all.
 *
 * @returns The detection status, the signal that resolved a match, the active project label and the
 *   client SDK key found on the page
 */
export const usePageProject = () => {
  const projects = useSettingsStore((state) => state.projects)
  const activeProjectId = useSettingsStore((state) => state.activeProjectId)
  const detectedKeys = useContextStore((state) => state.detectedKeys)
  const projectMatch = useContextStore((state) => state.projectMatch)

  const { reason, status } = getProjectDetection(projects, detectedKeys, projectMatch)

  return {
    activeLabel: findProject(projects, activeProjectId)?.label,
    detectedKey: detectedKeys?.sdkKeys[0],
    hasProjects: projects.length > 0,
    reason,
    status,
  }
}
