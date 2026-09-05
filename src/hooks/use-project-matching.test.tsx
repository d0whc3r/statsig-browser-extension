import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StatsigProject } from '@/src/lib/projects'

import { renderHook, renderInAct, waitFor } from '@/src/tests/utils/TestUtils'

import { useProjectMatching } from './use-project-matching'

const { getActiveTabOriginMock, resetQueriesMock, setActiveProjectMock, setProjectMatchMock } = vi.hoisted(() => ({
  getActiveTabOriginMock: vi.fn(),
  resetQueriesMock: vi.fn(),
  setActiveProjectMock: vi.fn(),
  setProjectMatchMock: vi.fn(),
}))

const contextState: Record<string, unknown> = {}
const settingsState: Record<string, unknown> = {}

vi.mock('@/src/lib/tabs', () => ({
  getActiveTabOrigin: getActiveTabOriginMock,
}))

vi.mock('@/src/lib/query-client', () => ({
  queryClient: { resetQueries: resetQueriesMock },
}))

vi.mock('@/src/store/use-context-store', () => ({
  useContextStore: (selector: (state: unknown) => unknown) => selector(contextState),
}))

vi.mock('@/src/store/use-settings-store', () => ({
  useSettingsStore: (selector: (state: unknown) => unknown) => selector(settingsState),
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

describe('useProjectMatching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActiveTabOriginMock.mockResolvedValue('')
    resetQueriesMock.mockResolvedValue(null)
    contextState.detectedKeys = undefined
    contextState.manualProjectId = undefined
    contextState.setProjectMatch = setProjectMatchMock
    settingsState.activeProjectId = 'p1'
    settingsState.projects = []
    settingsState.setActiveProject = setActiveProjectMock
  })

  it('does nothing while no project is configured', async () => {
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-b'] }

    await renderInAct(() =>
      renderHook(() => {
        useProjectMatching()
      }),
    )

    expect(setProjectMatchMock).not.toHaveBeenCalled()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
  })

  it('activates the project owning the detected SDK key before resetting cached data', async () => {
    const activation = Promise.withResolvers<void>()
    setActiveProjectMock.mockImplementation((projectId: string) => {
      settingsState.activeProjectId = projectId
      return activation.promise
    })
    settingsState.projects = [project(), project({ clientKeys: ['client-b'], id: 'p2' })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-b'] }

    await renderInAct(() =>
      renderHook(() => {
        useProjectMatching()
      }),
    )

    expect(setProjectMatchMock).toHaveBeenCalledWith({ projectId: 'p2', reason: 'client-key' })
    expect(setActiveProjectMock).toHaveBeenCalledWith('p2')
    expect(resetQueriesMock).not.toHaveBeenCalled()

    activation.resolve()

    await waitFor(() => {
      expect(resetQueriesMock).toHaveBeenCalledTimes(1)
    })
  })

  it('keeps the active project when it already owns the detected key', async () => {
    settingsState.projects = [project({ clientKeys: ['client-a'] })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-a'] }

    await renderInAct(() =>
      renderHook(() => {
        useProjectMatching()
      }),
    )

    expect(setProjectMatchMock).toHaveBeenCalledWith({ projectId: 'p1', reason: 'client-key' })
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(resetQueriesMock).not.toHaveBeenCalled()
  })

  it('reports no match when the detected key belongs to an unconfigured project', async () => {
    settingsState.projects = [project({ clientKeys: ['client-a'] })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-unknown'] }

    await renderInAct(() =>
      renderHook(() => {
        useProjectMatching()
      }),
    )

    expect(setProjectMatchMock).toHaveBeenCalledWith(null)
    expect(setActiveProjectMock).not.toHaveBeenCalled()
  })

  it('leaves a project picked by hand alone instead of dragging the user back to the page one', async () => {
    contextState.manualProjectId = 'p1'
    settingsState.projects = [project(), project({ clientKeys: ['client-b'], id: 'p2' })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-b'] }

    await renderInAct(() =>
      renderHook(() => {
        useProjectMatching()
      }),
    )

    expect(setProjectMatchMock).not.toHaveBeenCalled()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
  })

  it('uses the origin pinned to a project when the page exposes no key', async () => {
    getActiveTabOriginMock.mockResolvedValue('https://app.example.com')
    settingsState.projects = [project(), project({ id: 'p2', origins: ['https://app.example.com'] })]

    await renderInAct(() =>
      renderHook(() => {
        useProjectMatching()
      }),
    )

    await waitFor(() => {
      expect(setActiveProjectMock).toHaveBeenCalledWith('p2')
    })
    expect(setProjectMatchMock).toHaveBeenLastCalledWith({ projectId: 'p2', reason: 'origin' })
  })
})
