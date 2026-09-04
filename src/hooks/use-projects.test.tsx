import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAddProject, useBackfillProjectFingerprints, useRefreshProject, useSwitchProject } from './use-projects'

const {
  addProjectMock,
  fetchProjectFingerprintMock,
  getActiveTabOriginMock,
  resetQueriesMock,
  setActiveProjectMock,
  updateProjectMock,
} = vi.hoisted(() => ({
  addProjectMock: vi.fn(),
  fetchProjectFingerprintMock: vi.fn(),
  getActiveTabOriginMock: vi.fn(),
  resetQueriesMock: vi.fn(),
  setActiveProjectMock: vi.fn(),
  updateProjectMock: vi.fn(),
}))

vi.mock('@/src/handlers/project-fingerprint', () => ({
  fetchProjectFingerprint: fetchProjectFingerprintMock,
}))

vi.mock('@/src/lib/query-client', () => ({
  queryClient: { resetQueries: resetQueriesMock },
}))

vi.mock('@/src/lib/tabs', () => ({
  getActiveTabOrigin: getActiveTabOriginMock,
}))

const settingsState: Record<string, unknown> = {}

vi.mock('@/src/store/use-settings-store', () => ({
  useSettingsStore: (selector: (state: unknown) => unknown) => selector(settingsState),
}))

const project = (overrides: Record<string, unknown> = {}) => ({
  apiKey: 'console-a',
  clientKeys: [],
  gateHashes: [],
  id: 'p1',
  label: 'Project 1',
  origins: [],
  ...overrides,
})

describe('project hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getActiveTabOriginMock.mockResolvedValue('https://app.example.com')
    addProjectMock.mockResolvedValue('p1')
    resetQueriesMock.mockResolvedValue(null)
    updateProjectMock.mockImplementation(async () => {})
    setActiveProjectMock.mockImplementation(async () => {})
    fetchProjectFingerprintMock.mockResolvedValue({ clientKeys: ['client-a'], gateHashes: [] })
    settingsState.addProject = addProjectMock
    settingsState.projects = []
    settingsState.setActiveProject = setActiveProjectMock
    settingsState.updateProject = updateProjectMock
  })

  it('stores the detection data of a newly added project', async () => {
    const { result } = renderHook(() => useAddProject())

    await expect(result.current('console-a')).resolves.toBe('p1')

    expect(addProjectMock).toHaveBeenCalledWith('console-a')
    expect(fetchProjectFingerprintMock).toHaveBeenCalledWith('console-a')
    expect(updateProjectMock).toHaveBeenCalledWith('p1', { clientKeys: ['client-a'], gateHashes: [] })
  })

  it('re-reads the detection data of an existing project', async () => {
    const { result } = renderHook(() => useRefreshProject())

    await result.current('p2', 'console-b')

    expect(fetchProjectFingerprintMock).toHaveBeenCalledWith('console-b')
    expect(updateProjectMock).toHaveBeenCalledWith('p2', { clientKeys: ['client-a'], gateHashes: [] })
  })

  it('pins the current origin when the project is picked manually', async () => {
    const activation = Promise.withResolvers<void>()
    setActiveProjectMock.mockReturnValue(activation.promise)
    const { result } = renderHook(() => useSwitchProject())

    // Let the active tab origin resolve before the manual switch pins it
    await act(async () => {
      await Promise.resolve()
    })
    const switching = result.current('p2', true)

    expect(setActiveProjectMock).toHaveBeenCalledWith('p2', 'https://app.example.com')
    expect(resetQueriesMock).not.toHaveBeenCalled()

    activation.resolve()
    await switching

    expect(resetQueriesMock).toHaveBeenCalledTimes(1)
  })

  it('does not pin the origin when the switch is automatic', async () => {
    const { result } = renderHook(() => useSwitchProject())

    await result.current('p2')

    expect(setActiveProjectMock).toHaveBeenCalledWith('p2', undefined)
  })
})

describe('useBackfillProjectFingerprints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchProjectFingerprintMock.mockResolvedValue({ clientKeys: ['client-a'], gateHashes: [] })
    settingsState.projects = []
    settingsState.updateProject = updateProjectMock
  })

  it('looks up the identifiers of projects that have none', async () => {
    settingsState.projects = [project()]

    renderHook(() => {
      useBackfillProjectFingerprints()
    })

    await vi.waitFor(() => {
      expect(updateProjectMock).toHaveBeenCalledWith('p1', { clientKeys: ['client-a'], gateHashes: [] })
    })
    expect(fetchProjectFingerprintMock).toHaveBeenCalledWith('console-a')
  })

  it('leaves projects that already know their identifiers alone', () => {
    settingsState.projects = [project({ clientKeys: ['client-a'] }), project({ gateHashes: ['1'], id: 'p2' })]

    renderHook(() => {
      useBackfillProjectFingerprints()
    })

    expect(fetchProjectFingerprintMock).not.toHaveBeenCalled()
  })

  it('does not store an empty lookup and does not retry it in the same session', async () => {
    fetchProjectFingerprintMock.mockResolvedValue({ clientKeys: [], gateHashes: [] })
    settingsState.projects = [project()]

    const { rerender } = renderHook(() => {
      useBackfillProjectFingerprints()
    })

    await vi.waitFor(() => {
      expect(fetchProjectFingerprintMock).toHaveBeenCalledTimes(1)
    })
    rerender()

    expect(updateProjectMock).not.toHaveBeenCalled()
    expect(fetchProjectFingerprintMock).toHaveBeenCalledTimes(1)
  })
})
