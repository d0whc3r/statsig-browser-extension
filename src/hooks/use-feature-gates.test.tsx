import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFeatureGates } from './use-feature-gates'

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

const renderUseFeatureGates = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useFeatureGates(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useFeatureGates', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
    useSettingsStorageMock.mockReset()
  })

  it('is disabled when no apiKey is configured', () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: '' })

    const { result } = renderUseFeatureGates()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('fetches the first page', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({
      data: [{ id: 'gate_1' }],
      pagination: { limit: 100, page: 1, totalItems: 1 },
    })

    const { result } = renderUseFeatureGates()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data?.pages[0].data).toStrictEqual([{ id: 'gate_1' }])
    expect(fetcherMock).toHaveBeenCalledWith('/gates?limit=100&page=1')
  })

  it('paginates while items remain', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'gate_1' }],
      pagination: { limit: 100, page: 1, totalItems: 250 },
    })

    const { result } = renderUseFeatureGates()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeTruthy()

    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'gate_2' }],
      pagination: { limit: 100, page: 2, totalItems: 250 },
    })
    await act(async () => {
      await result.current.fetchNextPage()
    })
    expect(fetcherMock).toHaveBeenLastCalledWith('/gates?limit=100&page=2')
  })

  it('stops paginating when totalItems is reached', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({
      data: [{ id: 'gate_1' }],
      pagination: { limit: 100, page: 1, totalItems: 10 },
    })

    const { result } = renderUseFeatureGates()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('handles missing pagination metadata', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({ data: [{ id: 'gate_1' }] })

    const { result } = renderUseFeatureGates()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('propagates fetcher errors with cause', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseFeatureGates()
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })
    expect((result.current.error as Error).message).toBe('Boom')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
