import { create } from 'zustand'

import type { StatsigProject } from '@/src/lib/projects'

import { createProject, findProject } from '@/src/lib/projects'
import { activeProjectIdStorage, apiKeyStorage, projectsStorage } from '@/src/lib/storage'

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

export const useSettingsStore = create<SettingsState>((set, get) => ({
  activeProjectId: '',
  addProject: async (apiKey: string) => {
    const { projects } = get()
    const existing = projects.find((project) => project.apiKey === apiKey)
    if (existing) {
      await get().setActiveProject(existing.id)
      return existing.id
    }

    const project = createProject(apiKey, nextLabel(projects))
    const updated = [...projects, project]
    set({ activeProjectId: project.id, apiKey: project.apiKey, projects: updated })
    await persist(updated, project.id)
    return project.id
  },

  apiKey: '',

  clearProjects: async () => {
    set({ activeProjectId: '', apiKey: '', projects: [] })
    await persist([], '')
  },

  initialize: async () => {
    try {
      const [stored, storedActiveId, legacyApiKey] = await Promise.all([
        projectsStorage.getValue(),
        activeProjectIdStorage.getValue(),
        apiKeyStorage.getValue(),
      ])

      const projects = restoreProjects(stored, legacyApiKey)
      const active = findProject(projects, storedActiveId) ?? projects[0]

      set({
        activeProjectId: active?.id ?? '',
        apiKey: active?.apiKey ?? '',
        isApiKeyLoading: false,
        projects,
      })
      await persist(projects, active?.id ?? '')
    } catch (error) {
      console.error('Failed to initialize settings store:', error)
      set({ isApiKeyLoading: false })
    }

    // Watch for external changes (other extension pages)
    projectsStorage.watch((projects) => {
      const updated = projects ?? []
      const active = findProject(updated, get().activeProjectId) ?? updated[0]
      set({
        activeProjectId: active?.id ?? '',
        apiKey: active?.apiKey ?? '',
        isApiKeyLoading: false,
        projects: updated,
      })
    })
  },

  isApiKeyLoading: true,

  projects: [],

  removeProject: async (projectId: string) => {
    const { activeProjectId, projects } = get()
    const updated = projects.filter((project) => project.id !== projectId)
    const active = projectId === activeProjectId ? updated[0] : findProject(updated, activeProjectId)

    set({ activeProjectId: active?.id ?? '', apiKey: active?.apiKey ?? '', projects: updated })
    await persist(updated, active?.id ?? '')
  },

  setActiveProject: async (projectId: string, pinOrigin?: string) => {
    const { projects } = get()
    const target = findProject(projects, projectId)
    if (!target) {
      return
    }

    const updated = pinOrigin ? projects.map((project) => pinOriginTo(project, projectId, pinOrigin)) : projects

    set({ activeProjectId: projectId, apiKey: target.apiKey, projects: updated })
    await persist(updated, projectId)
  },

  updateProject: async (projectId: string, changes: Partial<Omit<StatsigProject, 'id'>>) => {
    const { activeProjectId, projects } = get()
    const updated = projects.map((project) => (project.id === projectId ? applyChanges(project, changes) : project))

    set({ apiKey: findProject(updated, activeProjectId)?.apiKey ?? '', projects: updated })
    await persist(updated, activeProjectId)
  },
}))
