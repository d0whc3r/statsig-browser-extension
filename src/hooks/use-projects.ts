import { useCallback, useEffect, useRef } from 'react'

import { fetchProjectFingerprint } from '@/src/handlers/project-fingerprint'
import { useActiveTabOrigin } from '@/src/hooks/use-active-tab-origin'
import { hasProjectFingerprint } from '@/src/lib/projects'
import { queryClient } from '@/src/lib/query-client'
import { useSettingsStore } from '@/src/store/use-settings-store'

/**
 * Adds a project from its Console API key and caches the identifiers used to recognise it on a page.
 * With `pinOrigin` the inspected site is pinned to it, which is how a key added for the page in
 * front of the user keeps winning there even when its project cannot be fingerprinted (Console key
 * without the `can_access_keys` scope, or a page evaluating Statsig server-side).
 *
 * @returns A callback resolving to the new (or existing) project id
 */
export const useAddProject = () => {
  const addProject = useSettingsStore((state) => state.addProject)
  const updateProject = useSettingsStore((state) => state.updateProject)
  const setActiveProject = useSettingsStore((state) => state.setActiveProject)
  const origin = useActiveTabOrigin()

  return useCallback(
    async (apiKey: string, pinOrigin = false) => {
      const projectId = await addProject(apiKey)
      await updateProject(projectId, await fetchProjectFingerprint(apiKey))
      if (pinOrigin) {
        await setActiveProject(projectId, origin)
      }
      return projectId
    },
    [addProject, origin, setActiveProject, updateProject],
  )
}

/**
 * Fills in the identifiers of projects that have none yet — keys added before this feature existed,
 * or whose lookup failed — otherwise those projects could never be recognised on a page.
 */
export const useBackfillProjectFingerprints = () => {
  const projects = useSettingsStore((state) => state.projects)
  const updateProject = useSettingsStore((state) => state.updateProject)
  const attempted = useRef(new Set<string>())

  useEffect(() => {
    const pending = projects.filter((project) => !hasProjectFingerprint(project) && !attempted.current.has(project.id))

    for (const project of pending) {
      attempted.current.add(project.id)
      void fetchProjectFingerprint(project.apiKey).then(async (fingerprint) => {
        if (fingerprint.clientKeys.length > 0 || fingerprint.gateHashes.length > 0) {
          await updateProject(project.id, fingerprint)
        }
      })
    }
  }, [projects, updateProject])
}

/** Re-reads the project identifiers, needed after a client SDK key is created or rotated. */
export const useRefreshProject = () => {
  const updateProject = useSettingsStore((state) => state.updateProject)

  return useCallback(
    async (projectId: string, apiKey: string) => {
      await updateProject(projectId, await fetchProjectFingerprint(apiKey))
    },
    [updateProject],
  )
}

/**
 * Switches the active project and drops the cached data of the previous one.
 * A manual switch also pins the current origin, so the choice sticks on sites
 * where the SDK key cannot be detected.
 */
export const useSwitchProject = () => {
  const setActiveProject = useSettingsStore((state) => state.setActiveProject)
  const origin = useActiveTabOrigin()

  return useCallback(
    async (projectId: string, pinOrigin = false) => {
      await setActiveProject(projectId, pinOrigin ? origin : undefined)
      await queryClient.resetQueries()
    },
    [origin, setActiveProject],
  )
}
