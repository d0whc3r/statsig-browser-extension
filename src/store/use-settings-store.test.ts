import { waitFor } from '@testing-library/react'
import { beforeEach, vi, describe, expect, it } from 'vitest'

import type { StatsigProject } from '@/src/lib/projects'

import { queryClient } from '@/src/lib/query-client'
import { activeProjectIdStorage, apiKeyStorage, projectsStorage } from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

import { useSettingsStore } from './use-settings-store'

vi.mock(import('@/src/lib/storage'), async (importOriginal) => ({
  ...(await importOriginal()),
  activeProjectIdStorage: {
    getValue: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(),
  } as any,
  apiKeyStorage: {
    getValue: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(),
  } as any,
  projectsStorage: {
    getValue: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(),
  } as any,
}))

const project = (overrides: Partial<StatsigProject> = {}): StatsigProject => ({
  apiKey: 'console-a',
  clientKeys: [],
  gateHashes: [],
  id: 'p1',
  label: 'Project 1',
  origins: [],
  ...overrides,
})

const mockStorage = (projects: StatsigProject[], activeId = '', legacyKey = '') => {
  vi.mocked(projectsStorage.getValue).mockResolvedValue(projects)
  vi.mocked(activeProjectIdStorage.getValue).mockResolvedValue(activeId)
  vi.mocked(apiKeyStorage.getValue).mockResolvedValue(legacyKey)
  vi.mocked(projectsStorage.watch).mockReturnValue(vi.fn())
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectsStorage.watch).mockReset().mockReturnValue(vi.fn())
    vi.mocked(activeProjectIdStorage.watch).mockReset().mockReturnValue(vi.fn())
    vi.mocked(apiKeyStorage.watch).mockReset().mockReturnValue(vi.fn())
    useSettingsStore.setState({
      activeProjectId: '',
      apiKey: '',
      isApiKeyLoading: true,
      projects: [],
    })
  })

  it('should have correct initial state', () => {
    const state = useSettingsStore.getState()

    expect(state.projects).toStrictEqual([])
    expect(state.activeProjectId).toBe('')
    expect(state.apiKey).toBe('')
    expect(state.isApiKeyLoading).toBeTruthy()
  })

  it('should initialize with the stored active project', async () => {
    const second = project({ apiKey: 'console-b', id: 'p2', label: 'Project 2' })
    mockStorage([project(), second], 'p2')

    await useSettingsStore.getState().initialize()

    const state = useSettingsStore.getState()
    expect(state.projects).toHaveLength(2)
    expect(state.activeProjectId).toBe('p2')
    expect(state.apiKey).toBe('console-b')
    expect(state.isApiKeyLoading).toBeFalsy()
    expect(apiKeyStorage.setValue).toHaveBeenCalledWith('console-b')
  })

  it('should fall back to the first project when the stored id is unknown', async () => {
    mockStorage([project()], 'missing')

    await useSettingsStore.getState().initialize()

    expect(useSettingsStore.getState().activeProjectId).toBe('p1')
  })

  it('should migrate a legacy single API key into the first project', async () => {
    mockStorage([], '', 'console-legacy')

    await useSettingsStore.getState().initialize()

    const state = useSettingsStore.getState()
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].apiKey).toBe('console-legacy')
    expect(state.apiKey).toBe('console-legacy')
    expect(projectsStorage.setValue).toHaveBeenCalledWith(state.projects)
  })

  it('should stay empty when there is nothing stored', async () => {
    mockStorage([])

    await useSettingsStore.getState().initialize()

    const state = useSettingsStore.getState()
    expect(state.projects).toStrictEqual([])
    expect(state.apiKey).toBe('')
    expect(state.isApiKeyLoading).toBeFalsy()
  })

  it('should handle storage errors during initialization', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(projectsStorage.getValue).mockRejectedValue(new Error('Storage error'))
    vi.mocked(activeProjectIdStorage.getValue).mockResolvedValue('')
    vi.mocked(apiKeyStorage.getValue).mockResolvedValue('')
    vi.mocked(projectsStorage.watch).mockReturnValue(vi.fn())

    await useSettingsStore.getState().initialize()

    expect(useSettingsStore.getState().isApiKeyLoading).toBeFalsy()
    expect(errorSpy).toHaveBeenCalledWith('Failed to initialize settings store:', expect.any(Error))
  })

  it('should update state when the projects storage changes externally', async () => {
    mockStorage([project()], 'p1')
    await useSettingsStore.getState().initialize()
    vi.mocked(projectsStorage.getValue).mockResolvedValue([project({ apiKey: 'console-updated' })])
    vi.mocked(apiKeyStorage.getValue).mockResolvedValue('console-updated')
    vi.mocked(projectsStorage.watch).mock.calls[0][0]([project({ apiKey: 'console-updated' })], [project()])

    await waitFor(() => {
      expect(useSettingsStore.getState().apiKey).toBe('console-updated')
    })
  })

  it('preserves project editors and cache on external metadata-only changes', async () => {
    mockStorage([project()], 'p1', 'console-a')
    await useSettingsStore.getState().initialize()
    const updated = [project({ label: 'Renamed' })]
    vi.mocked(projectsStorage.getValue).mockResolvedValue(updated)
    useUIStore.setState({ currentItemId: 'selected', isItemSheetOpen: true })
    queryClient.setQueryData(['feature-gates'], 'cached')
    vi.mocked(projectsStorage.watch).mock.calls[0][0](updated, [project()])

    await waitFor(() => {
      expect(useSettingsStore.getState().projects[0].label).toBe('Renamed')
    })
    expect(useSettingsStore.getState().apiKey).toBe('console-a')
    expect(useUIStore.getState().currentItemId).toBe('selected')
    expect(queryClient.getQueryData(['feature-gates'])).toBe('cached')
    queryClient.clear()
  })

  it('waits for an external active id and key mirror to agree without writing back', async () => {
    mockStorage([project(), project({ apiKey: 'console-b', id: 'p2' })], 'p1', 'console-a')
    await useSettingsStore.getState().initialize()
    const writesBefore = vi.mocked(apiKeyStorage.setValue).mock.calls.length
    vi.mocked(activeProjectIdStorage.getValue).mockResolvedValue('p2')
    vi.mocked(activeProjectIdStorage.watch).mock.calls[0][0]('p2', 'p1')

    await waitFor(() => {
      expect(useSettingsStore.getState().isApiKeyLoading).toBeTruthy()
      expect(useSettingsStore.getState().activeProjectId).toBe('p2')
    })
    expect(useSettingsStore.getState().apiKey).toBe('')
    vi.mocked(apiKeyStorage.getValue).mockResolvedValue('console-b')
    vi.mocked(apiKeyStorage.watch).mock.calls[0][0]('console-b', 'console-a')

    await waitFor(() => {
      expect(useSettingsStore.getState().apiKey).toBe('console-b')
      expect(useSettingsStore.getState().isApiKeyLoading).toBeFalsy()
    })
    expect(vi.mocked(apiKeyStorage.setValue)).toHaveBeenCalledTimes(writesBefore)
  })

  it('should add a project, activate it and mirror its key', async () => {
    const projectId = await useSettingsStore.getState().addProject('console-new')

    const state = useSettingsStore.getState()
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].label).toBe('Project 1')
    expect(state.activeProjectId).toBe(projectId)
    expect(state.apiKey).toBe('console-new')
    expect(apiKeyStorage.setValue).toHaveBeenCalledWith('console-new')
  })

  it('should activate the existing project when the key is already configured', async () => {
    useSettingsStore.setState({ activeProjectId: '', projects: [project()] })

    const projectId = await useSettingsStore.getState().addProject('console-a')

    expect(projectId).toBe('p1')
    expect(useSettingsStore.getState().projects).toHaveLength(1)
    expect(useSettingsStore.getState().activeProjectId).toBe('p1')
  })

  it('should pin an origin to the activated project and unpin it elsewhere', async () => {
    useSettingsStore.setState({
      activeProjectId: 'p1',
      projects: [
        project({ origins: ['https://app.example.com'] }),
        project({ apiKey: 'console-b', id: 'p2', label: 'Project 2' }),
      ],
    })

    await useSettingsStore.getState().setActiveProject('p2', 'https://app.example.com')

    const [first, second] = useSettingsStore.getState().projects
    expect(first.origins).toStrictEqual([])
    expect(second.origins).toStrictEqual(['https://app.example.com'])
    expect(useSettingsStore.getState().apiKey).toBe('console-b')
  })

  it('should ignore activation of an unknown project', async () => {
    useSettingsStore.setState({ activeProjectId: 'p1', projects: [project()] })

    await useSettingsStore.getState().setActiveProject('missing')

    expect(useSettingsStore.getState().activeProjectId).toBe('p1')
  })

  it('should activate the remaining project when the active one is removed', async () => {
    useSettingsStore.setState({
      activeProjectId: 'p1',
      projects: [project(), project({ apiKey: 'console-b', id: 'p2' })],
    })

    await useSettingsStore.getState().removeProject('p1')

    const state = useSettingsStore.getState()
    expect(state.projects).toHaveLength(1)
    expect(state.activeProjectId).toBe('p2')
    expect(state.apiKey).toBe('console-b')
  })

  it('should keep the active project when another one is removed', async () => {
    useSettingsStore.setState({
      activeProjectId: 'p2',
      projects: [project(), project({ apiKey: 'console-b', id: 'p2' })],
    })

    await useSettingsStore.getState().removeProject('p1')

    expect(useSettingsStore.getState().activeProjectId).toBe('p2')
  })

  it('should store the detection data of a project', async () => {
    useSettingsStore.setState({ activeProjectId: 'p1', projects: [project()] })

    await useSettingsStore.getState().updateProject('p1', { clientKeys: ['client-1'], gateHashes: ['123'] })

    expect(useSettingsStore.getState().projects[0]).toMatchObject({
      clientKeys: ['client-1'],
      gateHashes: ['123'],
    })
    expect(projectsStorage.setValue).toHaveBeenCalled()
  })

  it('keeps the credential unavailable until the mirror write completes', async () => {
    useSettingsStore.setState({
      activeProjectId: 'p1',
      apiKey: 'console-a',
      isApiKeyLoading: false,
      projects: [project(), project({ apiKey: 'console-b', id: 'p2' })],
    })
    const mirror = Promise.withResolvers<void>()
    vi.mocked(apiKeyStorage.setValue).mockReturnValueOnce(mirror.promise)
    const switching = useSettingsStore.getState().setActiveProject('p2')

    expect(useSettingsStore.getState().apiKey).toBe('')
    expect(useSettingsStore.getState().isApiKeyLoading).toBeTruthy()
    mirror.resolve()
    await switching
    expect(useSettingsStore.getState().apiKey).toBe('console-b')
    expect(useSettingsStore.getState().isApiKeyLoading).toBeFalsy()
  })

  it('does not publish a late earlier activation over a newer choice', async () => {
    useSettingsStore.setState({
      activeProjectId: 'p1',
      apiKey: 'console-a',
      isApiKeyLoading: false,
      projects: [project(), project({ apiKey: 'console-b', id: 'p2' })],
    })
    const firstWrite = Promise.withResolvers<void>()
    vi.mocked(projectsStorage.setValue).mockReturnValueOnce(firstWrite.promise)
    const first = useSettingsStore.getState().setActiveProject('p2')
    const second = useSettingsStore.getState().setActiveProject('p1')
    firstWrite.resolve()
    await first
    expect(useSettingsStore.getState().apiKey).toBe('')
    await second
    expect(useSettingsStore.getState().apiKey).toBe('console-a')
    expect(vi.mocked(apiKeyStorage.setValue).mock.calls.at(-1)?.[0]).toBe('console-a')
  })

  it('does not expose a credential when persistence fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    useSettingsStore.setState({
      activeProjectId: 'p1',
      apiKey: 'console-a',
      isApiKeyLoading: false,
      projects: [project(), project({ apiKey: 'console-b', id: 'p2' })],
    })
    vi.mocked(apiKeyStorage.setValue).mockRejectedValueOnce(new Error('Storage failure'))

    await expect(useSettingsStore.getState().setActiveProject('p2')).rejects.toThrow('Storage failure')
    expect(useSettingsStore.getState().apiKey).toBe('')
    expect(useSettingsStore.getState().isApiKeyLoading).toBeTruthy()
  })

  it('should clear every project on logout', async () => {
    useSettingsStore.setState({ activeProjectId: 'p1', apiKey: 'console-a', projects: [project()] })

    await useSettingsStore.getState().clearProjects()

    const state = useSettingsStore.getState()
    expect(state.projects).toStrictEqual([])
    expect(state.activeProjectId).toBe('')
    expect(state.apiKey).toBe('')
    expect(apiKeyStorage.setValue).toHaveBeenCalledWith('')
  })
})
