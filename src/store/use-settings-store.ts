import type { Query } from '@tanstack/react-query'
import type { StoreApi } from 'zustand'

import { create } from 'zustand'

import type { StatsigProject } from '@/src/lib/projects'

import { createProject, findProject } from '@/src/lib/projects'
import { queryClient } from '@/src/lib/query-client'
import { activeProjectIdStorage, apiKeyStorage, projectsStorage } from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

interface SettingsState {
  projects: StatsigProject[]
  activeProjectId: string
  /** Console API key of the active project. */
  apiKey: string
  isApiKeyLoading: boolean

  initialize: () => Promise<void>
  addProject: (apiKey: string) => Promise<string>
  removeProject: (projectId: string) => Promise<void>
  setActiveProject: (projectId: string, pinOrigin?: string) => Promise<void>
  updateProject: (projectId: string, changes: Partial<Omit<StatsigProject, 'id'>>) => Promise<void>
  clearProjects: () => Promise<void>
}

const persist = async (projects: StatsigProject[], activeProjectId: string) => {
  await projectsStorage.setValue(projects)
  await activeProjectIdStorage.setValue(activeProjectId)
  // Mirror the active key so the background script can authorize requests without resolving projects.
  await apiKeyStorage.setValue(findProject(projects, activeProjectId)?.apiKey ?? '')
}

const nextLabel = (projects: StatsigProject[]) => `Project ${projects.length + 1}`

const restoreProjects = (stored: StatsigProject[] | null, legacyApiKey: string) => {
  if (stored?.length) {
    return stored
  }
  // Migrate the previous single-key setup into the first project.
  return legacyApiKey ? [createProject(legacyApiKey, 'Project 1')] : []
}

const pinOriginTo = (project: StatsigProject, projectId: string, origin: string): StatsigProject => {
  const origins =
    project.id === projectId
      ? [...new Set([...project.origins, origin])]
      : project.origins.filter((pinned) => pinned !== origin)

  return { ...project, origins }
}

const applyChanges = (project: StatsigProject, changes: Partial<Omit<StatsigProject, 'id'>>): StatsigProject => ({
  ...project,
  ...changes,
})

const readStoredSettings = () =>
  Promise.all([projectsStorage.getValue(), activeProjectIdStorage.getValue(), apiKeyStorage.getValue()])

const projectQueries = { predicate: (query: Query) => query.queryKey[0] !== 'user-details' }

const createProjectPersistence = (
  set: StoreApi<SettingsState>['setState'],
  get: StoreApi<SettingsState>['getState'],
) => {
  const control = { pendingWrites: 0, revision: 0, unwatch: [] as (() => void)[], writes: Promise.resolve() }

  const holdCredential = () => {
    set({ apiKey: '', isApiKeyLoading: true })
    useUIStore.getState().resetProjectSelection()
    return queryClient.cancelQueries(projectQueries).then(() => {
      queryClient.removeQueries(projectQueries)
    })
  }

  const update = (projects: StatsigProject[], activeProjectId: string): Promise<void> => {
    const apiKey = findProject(projects, activeProjectId)?.apiKey ?? ''
    const current = get()
    const changing = current.isApiKeyLoading || current.activeProjectId !== activeProjectId || current.apiKey !== apiKey
    const request = ++control.revision
    control.pendingWrites++
    const cacheReady = changing ? holdCredential() : Promise.resolve()
    set({ activeProjectId, projects })

    const operation = control.writes
      .then(async () => {
        await cacheReady
        await persist(projects, activeProjectId)
        if (request === control.revision) {
          set({ apiKey, isApiKeyLoading: false })
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to persist project settings:', error)
        throw error
      })
      .finally(() => {
        control.pendingWrites--
      })
    // A failed write must not prevent a later retry, while each caller still receives its failure.
    control.writes = operation.catch(() => {})
    return operation
  }

  const publishExternal = async (
    [stored, activeProjectId, mirroredKey]: Awaited<ReturnType<typeof readStoredSettings>>,
    request: number,
    changing: boolean,
  ) => {
    const projects = stored ?? []
    const active = findProject(projects, activeProjectId)
    const apiKey = active?.apiKey ?? ''
    const consistent = (Boolean(active) || projects.length === 0) && apiKey === (mirroredKey ?? '')
    if (!changing && (get().activeProjectId !== activeProjectId || get().apiKey !== apiKey || !consistent)) {
      await holdCredential()
      if (request !== control.revision || control.pendingWrites > 0) {
        return
      }
    }
    set({
      activeProjectId,
      apiKey: consistent ? apiKey : '',
      isApiKeyLoading: !consistent,
      projects,
    })
  }

  const readExternal = async (changing: boolean) => {
    if (control.pendingWrites > 0) {
      return
    }
    const request = ++control.revision
    const cacheReady = changing ? holdCredential() : Promise.resolve()
    try {
      const [snapshot] = await Promise.all([readStoredSettings(), cacheReady])
      if (request !== control.revision || control.pendingWrites > 0) {
        return
      }
      await publishExternal(snapshot, request, changing)
    } catch (error) {
      console.error('Failed to read external project settings:', error)
    }
  }

  const watchExternal = () => {
    // Changes are reconciled without writes: only a matching stored id/key mirror is usable.
    control.unwatch = [
      projectsStorage.watch((projects) => {
        const nextKey = findProject(projects ?? [], get().activeProjectId)?.apiKey ?? ''
        void readExternal(nextKey !== get().apiKey)
      }),
      activeProjectIdStorage.watch((activeProjectId) => {
        void readExternal(activeProjectId !== get().activeProjectId)
      }),
      apiKeyStorage.watch((apiKey) => {
        void readExternal(apiKey !== get().apiKey)
      }),
    ]
  }

  const restore = async (request: number) => {
    const [stored, storedActiveId, legacyApiKey] = await readStoredSettings()
    if (request !== control.revision) {
      return
    }
    const projects = restoreProjects(stored, legacyApiKey)
    const active = findProject(projects, storedActiveId) ?? projects[0]
    await update(projects, active?.id ?? '')
  }

  const initialize = async () => {
    for (const stop of control.unwatch) {
      stop()
    }
    control.unwatch = []
    const request = control.revision
    try {
      await restore(request)
    } catch (error) {
      console.error('Failed to initialize settings store:', error)
      if (get().projects.length === 0) {
        set({ apiKey: '', isApiKeyLoading: false })
      }
    }
    watchExternal()
  }

  return { initialize, update }
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const { initialize, update } = createProjectPersistence(set, get)
  return {
    activeProjectId: '',
    addProject: async (apiKey: string) => {
      const { projects } = get()
      const existing = projects.find((project) => project.apiKey === apiKey)
      if (existing) {
        await get().setActiveProject(existing.id)
        return existing.id
      }
      const project = createProject(apiKey, nextLabel(projects))
      await update([...projects, project], project.id)
      return project.id
    },
    apiKey: '',
    clearProjects: () => update([], ''),
    initialize,
    isApiKeyLoading: true,
    projects: [],
    removeProject: (projectId: string) => {
      const { activeProjectId, projects } = get()
      const updated = projects.filter((project) => project.id !== projectId)
      const active = projectId === activeProjectId ? updated[0] : findProject(updated, activeProjectId)
      return update(updated, active?.id ?? '')
    },
    setActiveProject: async (projectId: string, pinOrigin?: string) => {
      const { projects } = get()
      if (!findProject(projects, projectId)) {
        return
      }
      const updated = pinOrigin ? projects.map((project) => pinOriginTo(project, projectId, pinOrigin)) : projects
      await update(updated, projectId)
    },
    updateProject: (projectId: string, changes: Partial<Omit<StatsigProject, 'id'>>) => {
      const { activeProjectId, projects } = get()
      const updated = projects.map((project) => (project.id === projectId ? applyChanges(project, changes) : project))
      return update(updated, activeProjectId)
    },
  }
})
