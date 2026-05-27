import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useOverrides } from './use-overrides'

const { fetcherMock } = vi.hoisted(() => ({ fetcherMock: vi.fn() }))

vi.mock('@/src/lib/fetcher', () => ({
  fetcher: fetcherMock,
}))

const renderUseOverrides = (id?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useOverrides(id), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useOverrides', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('is disabled when no experimentId is provided', () => {
    const { result } = renderUseOverrides()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('transforms the API response, dropping empty userID overrides', async () => {
    fetcherMock.mockResolvedValue({
      data: {
        overrides: [{ groupID: 'A', name: 'gate_a', type: 'gate' }],
        userIDOverrides: [
          { environment: 'Production', groupID: 'Test', ids: ['u1'], unitType: 'userID' },
          { environment: 'Staging', groupID: 'Control', ids: [], unitType: 'userID' },
        ],
      },
    })

    const { result } = renderUseOverrides('exp_1')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual({
      overrides: [{ groupID: 'A', name: 'gate_a', type: 'gate' }],
      userIDOverrides: [{ environment: 'Production', groupID: 'Test', ids: ['u1'], unitType: 'userID' }],
    })
    expect(fetcherMock).toHaveBeenCalledWith('/experiments/exp_1/overrides')
  })

  it('propagates fetcher errors with cause', async () => {
    const originalError = new Error('Forbidden')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseOverrides('exp_err')

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('Forbidden')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
