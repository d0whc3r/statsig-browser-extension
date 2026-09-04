import { beforeEach, vi, describe, expect, it } from 'vitest'

import type { StatsigProject } from '@/src/lib/projects'

import { activeProjectIdStorage, apiKeyStorage, projectsStorage } from '@/src/lib/storage'

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
  vi.mocked(projectsStorage.watch).mockReturnValue({ unsubscribe: vi.fn() } as never)
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    vi.mocked(projectsStorage.watch).mockReturnValue({ unsubscribe: vi.fn() } as never)

    await useSettingsStore.getState().initialize()

    expect(useSettingsStore.getState().isApiKeyLoading).toBeFalsy()
    expect(errorSpy).toHaveBeenCalledWith('Failed to initialize settings store:', expect.any(Error))
  })

  it('should update state when the projects storage changes externally', async () => {
    mockStorage([project()], 'p1')
    vi.mocked(projectsStorage.watch).mockImplementation((callback) => {
      ;(callback as (value: StatsigProject[]) => void)([project({ apiKey: 'console-updated' })])
      return { unsubscribe: vi.fn() } as never
    })

    await useSettingsStore.getState().initialize()

    expect(useSettingsStore.getState().apiKey).toBe('console-updated')
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
