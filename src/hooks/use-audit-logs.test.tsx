import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuditLogs } from './use-audit-logs'

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

const renderUseAuditLogs = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useAuditLogs(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useAuditLogs', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
    useSettingsStorageMock.mockReset()
  })

  it('is disabled when no apiKey is configured', () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: '' })
    const { result } = renderUseAuditLogs()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('paginates while more items remain', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'log_1' }],
      pagination: { limit: 50, page: 1, totalItems: 150 },
    })

    const { result } = renderUseAuditLogs()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeTruthy()
    expect(fetcherMock).toHaveBeenCalledWith('/audit_logs?limit=50&page=1')

    fetcherMock.mockResolvedValueOnce({
      data: [{ id: 'log_2' }],
      pagination: { limit: 50, page: 2, totalItems: 150 },
    })
    await act(async () => {
      await result.current.fetchNextPage()
    })
    expect(fetcherMock).toHaveBeenLastCalledWith('/audit_logs?limit=50&page=2')
  })

  it('stops paginating after the last page', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({
      data: [{ id: 'log_1' }],
      pagination: { limit: 50, page: 1, totalItems: 5 },
    })

    const { result } = renderUseAuditLogs()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('handles pages without pagination metadata', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    fetcherMock.mockResolvedValue({ data: [{ id: 'log_1' }] })

    const { result } = renderUseAuditLogs()
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('propagates fetcher errors with cause', async () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseAuditLogs()
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })
    expect((result.current.error as Error).message).toBe('Boom')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
