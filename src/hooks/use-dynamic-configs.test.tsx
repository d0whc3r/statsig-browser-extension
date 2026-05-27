import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDynamicConfigs } from './use-dynamic-configs'

const { fetcherMock, useSettingsStorageMock } = vi.hoisted(() => ({
  fetcherMock: vi.fn(),
  useSettingsStorageMock: vi.fn(),
}))

vi.mock('@/src/lib/fetcher', () => ({
  fetcher: fetcherMock,
}))

vi.mock('@/src/hooks/use-settings-storage', () => ({
  useSettingsStorage: useSettingsStorageMock,
}))

const renderUseDynamicConfigs = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useDynamicConfigs(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useDynamicConfigs', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
    useSettingsStorageMock.mockReset()
  })

  it('is disabled when no apiKey is configured', () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: '' })
    const { result } = renderUseDynamicConfigs()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('fetches the first page', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({
      data: [{ id: 'config_1' }],
      pagination: { limit: 100, page: 1, totalItems: 1 },
    })

    const { result } = renderUseDynamicConfigs()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.data?.pages[0].data).toStrictEqual([{ id: 'config_1' }])
    expect(fetcherMock).toHaveBeenCalledWith('/dynamic_configs?limit=100&page=1')
  })

  it('paginates while items remain', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'config_1' }],
      pagination: { limit: 100, page: 1, totalItems: 250 },
    })

    const { result } = renderUseDynamicConfigs()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeTruthy()

    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'config_2' }],
      pagination: { limit: 100, page: 2, totalItems: 250 },
    })
    await act(async () => {
      await result.current.fetchNextPage()
    })
    expect(fetcherMock).toHaveBeenLastCalledWith('/dynamic_configs?limit=100&page=2')
  })

  it('stops paginating when totalItems is reached', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({
      data: [{ id: 'config_1' }],
      pagination: { limit: 100, page: 1, totalItems: 10 },
    })

    const { result } = renderUseDynamicConfigs()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('handles missing pagination metadata', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({ data: [{ id: 'config_1' }] })

    const { result } = renderUseDynamicConfigs()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('propagates fetcher errors with cause', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseDynamicConfigs()
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })
    expect((result.current.error as Error).message).toBe('Boom')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
