import { findProject, getProjectDetection } from '@/src/lib/projects'
import { useContextStore } from '@/src/store/use-context-store'
import { useSettingsStore } from '@/src/store/use-settings-store'

/**
 * Whether the inspected page belongs to one of the configured projects, which is what decides if
 * any project data may be loaded at all. A project picked by hand short-circuits that question:
 * the user asked for it, so it counts as matched until the popup closes.
 *
 * @returns The detection status, the signal that resolved a match, the active project label and the
 *   client SDK key found on the page
 */
export const usePageProject = () => {
  const projects = useSettingsStore((state) => state.projects)
  const activeProjectId = useSettingsStore((state) => state.activeProjectId)
  const isApiKeyLoading = useSettingsStore((state) => state.isApiKeyLoading)
  const detectedKeys = useContextStore((state) => state.detectedKeys)
  const projectMatch = useContextStore((state) => state.projectMatch)
  const manualProjectId = useContextStore((state) => state.manualProjectId)

  const validMatch =
    projectMatch && (projectMatch.projectId !== activeProjectId || !findProject(projects, projectMatch.projectId))
      ? null
      : projectMatch
  const detection =
    manualProjectId === activeProjectId && findProject(projects, manualProjectId)
      ? ({ reason: 'manual', status: 'matched' } as const)
      : getProjectDetection(projects, detectedKeys, validMatch)
  const { reason, status } = isApiKeyLoading ? { reason: undefined, status: 'pending' as const } : detection

  return {
    activeLabel: findProject(projects, activeProjectId)?.label,
    detectedKey: detectedKeys?.sdkKeys[0],
    hasProjects: projects.length > 0,
    reason,
    status,
  }
}
