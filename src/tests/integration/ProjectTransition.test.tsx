import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, waitFor } from '@testing-library/react'
import { useLayoutEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { updateGateOverrides } from '@/src/handlers/gate-overrides'
import { useFeatureGates } from '@/src/hooks/use-feature-gates'
import { usePageProject } from '@/src/hooks/use-page-project'
import { useSwitchProject } from '@/src/hooks/use-projects'
import { queryClient } from '@/src/lib/query-client'
import { useContextStore } from '@/src/store/use-context-store'
import { useSettingsStore } from '@/src/store/use-settings-store'
import { useUIStore } from '@/src/store/use-ui-store'

const { state, projectsWrite } = vi.hoisted(() => ({
  projectsWrite: vi.fn(() => Promise.resolve()),
  state: {
    apiKey: 'console-a',
    listener: undefined as
      | undefined
      | ((message: unknown, sender: unknown, callback: (response: unknown) => void) => boolean),
    messageGate: Promise.resolve(),
  },
}))
vi.mock('wxt/utils/define-background', () => ({
  defineBackground: (start: () => void) => {
    start()
    return start
  },
}))
vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      onMessage: {
        addListener: (listener: typeof state.listener) => {
          state.listener = listener
        },
      },
      sendMessage: async (message: unknown) => {
        await state.messageGate
        return new Promise((resolve) => {
          state.listener!(message, {}, resolve)
        })
      },
    },
    tabs: { query: () => Promise.resolve([{ id: 1, url: 'https://example.com' }]) },
  },
}))
vi.mock('@/src/lib/storage', () => ({
  activeProjectIdStorage: { setValue: async () => {} },
  apiKeyStorage: {
    getValue: () => Promise.resolve(state.apiKey),
    setValue: (key: string) => {
      state.apiKey = key
      return Promise.resolve()
    },
  },
  projectsStorage: { setValue: projectsWrite },
}))
vi.mock('@/src/hooks/use-settings-storage', () => ({
  useSettingsStorage: () => ({ apiKey: useSettingsStore((settings) => settings.apiKey) }),
}))
const project = (id: string) => ({
  apiKey: `console-${id}`,
  clientKeys: [`client-${id}`],
  gateHashes: [],
  id,
  label: id,
  origins: [],
})
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
const probe: {
  gates?: ReturnType<typeof useFeatureGates>
  page?: ReturnType<typeof usePageProject>
  switchProject?: ReturnType<typeof useSwitchProject>
} = {}
function GatesProbe() {
  const current = useFeatureGates()
  useLayoutEffect(() => {
    probe.gates = current
  })
  return null
}
function PopupProbe() {
  const currentPage = usePageProject()
  const currentSwitch = useSwitchProject()
  useLayoutEffect(() => {
    probe.page = currentPage
    probe.switchProject = currentSwitch
  })
  return currentPage.status === 'matched' ? <GatesProbe /> : null
}
const fetchMock = vi.fn((_url: string, init: RequestInit) =>
  Promise.resolve(
    Response.json({
      data: [{ id: (init.headers as Record<string, string>)['STATSIG-API-KEY'] }],
      pagination: { itemsPerPage: 100, nextPage: null, pageNumber: 1, previousPage: null, totalItems: 1 },
    }),
  ),
)

describe('correct project isolation during activation', () => {
  beforeEach(async () => {
    queryClient.clear()
    useUIStore.getState().reset()
    probe.gates = undefined
    projectsWrite.mockReset()
    fetchMock.mockClear()
    vi.stubGlobal('fetch', fetchMock)
    await import('@/entrypoints/background')
    state.apiKey = 'console-a'
    state.messageGate = Promise.resolve()
    useSettingsStore.setState({
      activeProjectId: 'a',
      apiKey: 'console-a',
      isApiKeyLoading: false,
      projects: [project('a'), project('b')],
    })
    useContextStore.setState({ detectedKeys: null, manualProjectId: 'a', projectMatch: null })
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('does not expose the previous project cached gates under the newly matched project label', async () => {
    render(<PopupProbe />, { wrapper })
    await waitFor(() => {
      expect(probe.gates?.isSuccess).toBeTruthy()
    })
    const barrier = Promise.withResolvers<void>()
    projectsWrite.mockReturnValue(barrier.promise)
    useUIStore.setState({
      currentItemId: 'shared_gate',
      isManageGateOverridesModalOpen: true,
      isSettingsSheetOpen: true,
    })
    let switching = Promise.resolve()
    act(() => {
      useContextStore.getState().setManualProject('b')
      switching = probe.switchProject!('b')
    })
    try {
      expect(probe.page?.activeLabel).toBe('b')
      expect(probe.page?.status).toBe('pending')
      expect(useSettingsStore.getState().apiKey).toBe('')
      expect(useUIStore.getState().isSettingsSheetOpen).toBeTruthy()
    } finally {
      await act(async () => {
        barrier.resolve()
        await switching
      })
    }
  })

  it('authorizes an override submitted while B is shown with B credentials', async () => {
    render(<PopupProbe />, { wrapper })
    await waitFor(() => {
      expect(probe.gates?.isSuccess).toBeTruthy()
    })
    const barrier = Promise.withResolvers<void>()
    projectsWrite.mockReturnValue(barrier.promise)
    useUIStore.setState({
      currentItemId: 'shared_gate',
      isManageGateOverridesModalOpen: true,
      isSettingsSheetOpen: true,
    })
    let switching = Promise.resolve()
    act(() => {
      useContextStore.getState().setManualProject('b')
      switching = probe.switchProject!('b')
    })
    try {
      expect(probe.page?.status).toBe('pending')
      expect(useUIStore.getState().currentItemId).toBeUndefined()
      expect(useUIStore.getState().isManageGateOverridesModalOpen).toBeFalsy()
      await act(async () => {
        barrier.resolve()
        await switching
      })
      await waitFor(() => {
        expect(probe.page?.status).toBe('matched')
      })
      await act(async () => {
        await updateGateOverrides({
          gateId: 'shared_gate',
          overrides: { environmentOverrides: [], failingUserIDs: [], passingUserIDs: ['user-b'] },
        })
      })
      const overrideRequest = fetchMock.mock.calls.find(([url]) => url.endsWith('/gates/shared_gate/overrides'))
      expect(overrideRequest?.[1].headers).toMatchObject({ 'STATSIG-API-KEY': 'console-b' })
    } finally {
      await act(async () => {
        barrier.resolve()
        await switching
      })
    }
  })

  it('replaces B cached gates after deleting B when the page belongs to fallback A', async () => {
    state.apiKey = 'console-b'
    useSettingsStore.setState({ activeProjectId: 'b', apiKey: 'console-b' })
    useContextStore.setState({ manualProjectId: 'b', projectMatch: { projectId: 'a', reason: 'client-key' } })
    render(<PopupProbe />, { wrapper })
    await waitFor(() => {
      expect(probe.gates?.isSuccess).toBeTruthy()
    })
    await act(async () => {
      await useSettingsStore.getState().removeProject('b')
    })
    expect(probe.page?.activeLabel).toBe('a')
    expect(probe.page?.status).toBe('matched')
    await waitFor(() => {
      expect(probe.gates?.data?.pages[0].data[0].id).toBe('console-a')
    })
  })

  it('does not authorize a removed projectMatch id through an invalid manual selection', () => {
    useSettingsStore.setState({
      activeProjectId: 'a',
      apiKey: 'console-a',
      isApiKeyLoading: false,
      projects: [project('a')],
    })
    useContextStore.setState({
      detectedKeys: { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-b'] },
      manualProjectId: 'b',
      projectMatch: { projectId: 'b', reason: 'client-key' },
    })
    const { result } = renderHook(() => usePageProject())
    expect(result.current.status).not.toBe('matched')
  })

  it('keeps an already-submitted A override bound to A after delayed background transport', async () => {
    const delivery = Promise.withResolvers<void>()
    state.messageGate = delivery.promise
    const updating = updateGateOverrides({
      gateId: 'shared_gate',
      overrides: { environmentOverrides: [], failingUserIDs: [], passingUserIDs: ['user-a'] },
    })
    await useSettingsStore.getState().setActiveProject('b')
    expect(useSettingsStore.getState().apiKey).toBe('console-b')
    delivery.resolve()
    await updating
    const overrideRequest = fetchMock.mock.calls.find(([url]) => url.endsWith('/gates/shared_gate/overrides'))
    expect(overrideRequest?.[1].headers).toMatchObject({ 'STATSIG-API-KEY': 'console-a' })
  })
})
