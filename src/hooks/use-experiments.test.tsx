import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExperiments } from './use-experiments'

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

const renderUseExperiments = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useExperiments(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useExperiments', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
    useSettingsStorageMock.mockReset()
  })

  it('is disabled when no apiKey is configured', () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: '' })

    const { result } = renderUseExperiments()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('fetches the first page when an apiKey is present', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({
      data: [{ id: 'exp_1' }],
      pagination: { limit: 100, page: 1, totalItems: 1 },
    })

    const { result } = renderUseExperiments()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data?.pages[0].data).toStrictEqual([{ id: 'exp_1' }])
    expect(fetcherMock).toHaveBeenCalledWith('/experiments?limit=100&page=1')
  })

  it('exposes a next page when more items remain', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'exp_1' }],
      pagination: { limit: 100, page: 1, totalItems: 250 },
    })

    const { result } = renderUseExperiments()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.hasNextPage).toBeTruthy()

    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'exp_2' }],
      pagination: { limit: 100, page: 2, totalItems: 250 },
    })

    await act(async () => {
      await result.current.fetchNextPage()
    })

    expect(fetcherMock).toHaveBeenLastCalledWith('/experiments?limit=100&page=2')
  })

  it('reports no next page when all items have been fetched', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({
      data: [{ id: 'exp_1' }],
      pagination: { limit: 100, page: 1, totalItems: 50 },
    })

    const { result } = renderUseExperiments()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('handles pages without pagination metadata', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({ data: [{ id: 'exp_1' }] })

    const { result } = renderUseExperiments()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('propagates fetcher errors with cause', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseExperiments()

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('Boom')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
