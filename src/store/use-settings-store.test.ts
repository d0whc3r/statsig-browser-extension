import { beforeEach, vi, describe, expect, it } from 'vitest'

import { apiKeyStorage } from '@/src/lib/storage'

import { useSettingsStore } from './use-settings-store'

vi.mock(import('@/src/lib/storage'), async (importOriginal) => ({
  ...(await importOriginal()),
  apiKeyStorage: {
    getValue: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(),
  } as any,
}))

describe('useSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSettingsStore.setState({
      apiKey: '',
      isApiKeyLoading: true,
    })
  })

  it('should have correct initial state', () => {
    const state = useSettingsStore.getState()

    expect(state.apiKey).toBe('')
    expect(state.isApiKeyLoading).toBeTruthy()
  })

  it('should initialize with API key from storage', async () => {
    vi.mocked(apiKeyStorage.getValue).mockResolvedValue('console-test-key-123')
    vi.mocked(apiKeyStorage.watch).mockReturnValue({
      unsubscribe: vi.fn(),
    } as never)

    await useSettingsStore.getState().initialize()

    const state = useSettingsStore.getState()
    expect(state.apiKey).toBe('console-test-key-123')
    expect(state.isApiKeyLoading).toBeFalsy()
    expect(apiKeyStorage.getValue).toHaveBeenCalledTimes(1)
    expect(apiKeyStorage.watch).toHaveBeenCalledTimes(1)
  })

  it('should set empty string when storage returns null/undefined', async () => {
    vi.mocked(apiKeyStorage.getValue).mockResolvedValue(null as unknown as string)
    vi.mocked(apiKeyStorage.watch).mockReturnValue({
      unsubscribe: vi.fn(),
    } as never)

    await useSettingsStore.getState().initialize()

    expect(useSettingsStore.getState().apiKey).toBe('')
    expect(useSettingsStore.getState().isApiKeyLoading).toBeFalsy()
  })

  it('should handle storage errors during initialization', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(apiKeyStorage.getValue).mockRejectedValue(new Error('Storage error'))

    await useSettingsStore.getState().initialize()

    expect(useSettingsStore.getState().isApiKeyLoading).toBeFalsy()
    expect(errorSpy).toHaveBeenCalledWith('Failed to initialize settings store:', expect.any(Error))
  })

  it('should set API key and persist to storage', async () => {
    vi.mocked(apiKeyStorage.setValue).mockResolvedValue()

    await useSettingsStore.getState().setApiKey('console-new-key')

    const state = useSettingsStore.getState()
    expect(state.apiKey).toBe('console-new-key')
    expect(apiKeyStorage.setValue).toHaveBeenCalledWith('console-new-key')
  })

  it('should handle storage errors when setting API key', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(apiKeyStorage.setValue).mockRejectedValue(new Error('Storage write error'))

    await useSettingsStore.getState().setApiKey('console-test-key')

    expect(errorSpy).toHaveBeenCalledWith('Failed to persist API key:', expect.any(Error))
  })

  it('should update API key when storage watch callback is triggered', async () => {
    vi.mocked(apiKeyStorage.getValue).mockResolvedValue('initial-key')
    vi.mocked(apiKeyStorage.watch).mockImplementation((callback) => {
      // Simulate immediate callback
      ;(callback as (value: string) => void)('console-updated-key')
      return { unsubscribe: vi.fn() } as never
    })

    await useSettingsStore.getState().initialize()

    const state = useSettingsStore.getState()
    expect(state.apiKey).toBe('console-updated-key')
    expect(state.isApiKeyLoading).toBeFalsy()
  })

  it('should handle null value from storage watch callback', async () => {
    vi.mocked(apiKeyStorage.getValue).mockResolvedValue('initial-key')
    vi.mocked(apiKeyStorage.watch).mockImplementation((callback) => {
      // Simulate immediate callback with null
      ;(callback as (value: string | null) => void)(null)
      return { unsubscribe: vi.fn() } as never
    })

    await useSettingsStore.getState().initialize()

    expect(useSettingsStore.getState().apiKey).toBe('')
  })
})
