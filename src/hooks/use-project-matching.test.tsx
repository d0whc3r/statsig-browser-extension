import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StatsigProject } from '@/src/lib/projects'

import { useProjectMatching } from './use-project-matching'

const { clearMock, getActiveTabOriginMock, setActiveProjectMock, setProjectMatchMock } = vi.hoisted(() => ({
  clearMock: vi.fn(),
  getActiveTabOriginMock: vi.fn(),
  setActiveProjectMock: vi.fn(),
  setProjectMatchMock: vi.fn(),
}))

const contextState: Record<string, unknown> = {}
const settingsState: Record<string, unknown> = {}

vi.mock('@/src/lib/tabs', () => ({
  getActiveTabOrigin: getActiveTabOriginMock,
}))

vi.mock('@/src/lib/query-client', () => ({
  queryClient: { clear: clearMock },
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
    contextState.detectedKeys = undefined
    contextState.setProjectMatch = setProjectMatchMock
    settingsState.activeProjectId = 'p1'
    settingsState.projects = []
    settingsState.setActiveProject = setActiveProjectMock
  })

  it('does nothing while no project is configured', () => {
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-b'] }

    renderHook(() => {
      useProjectMatching()
    })

    expect(setProjectMatchMock).not.toHaveBeenCalled()
    expect(setActiveProjectMock).not.toHaveBeenCalled()
  })

  it('activates the project owning the detected SDK key and drops the stale cache', () => {
    settingsState.projects = [project(), project({ clientKeys: ['client-b'], id: 'p2' })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-b'] }

    renderHook(() => {
      useProjectMatching()
    })

    expect(setProjectMatchMock).toHaveBeenCalledWith({ projectId: 'p2', reason: 'client-key' })
    expect(clearMock).toHaveBeenCalledTimes(1)
    expect(setActiveProjectMock).toHaveBeenCalledWith('p2')
  })

  it('keeps the active project when it already owns the detected key', () => {
    settingsState.projects = [project({ clientKeys: ['client-a'] })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-a'] }

    renderHook(() => {
      useProjectMatching()
    })

    expect(setProjectMatchMock).toHaveBeenCalledWith({ projectId: 'p1', reason: 'client-key' })
    expect(setActiveProjectMock).not.toHaveBeenCalled()
    expect(clearMock).not.toHaveBeenCalled()
  })

  it('reports no match when the detected key belongs to an unconfigured project', () => {
    settingsState.projects = [project({ clientKeys: ['client-a'] })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-unknown'] }

    renderHook(() => {
      useProjectMatching()
    })

    expect(setProjectMatchMock).toHaveBeenCalledWith(null)
    expect(setActiveProjectMock).not.toHaveBeenCalled()
  })

  it('uses the origin pinned to a project when the page exposes no key', async () => {
    getActiveTabOriginMock.mockResolvedValue('https://app.example.com')
    settingsState.projects = [project(), project({ id: 'p2', origins: ['https://app.example.com'] })]

    renderHook(() => {
      useProjectMatching()
    })

    await vi.waitFor(() => {
      expect(setActiveProjectMock).toHaveBeenCalledWith('p2')
    })
    expect(setProjectMatchMock).toHaveBeenLastCalledWith({ projectId: 'p2', reason: 'origin' })
  })
})
