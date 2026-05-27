import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFeatureGate } from './use-feature-gate'

const { fetcherMock } = vi.hoisted(() => ({ fetcherMock: vi.fn() }))

vi.mock('@/src/lib/fetcher', () => ({
  fetcher: fetcherMock,
}))

const renderUseFeatureGate = (id?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useFeatureGate(id), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useFeatureGate', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('is disabled when no gateId is provided', () => {
    const { result } = renderUseFeatureGate()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('fetches the gate by id', async () => {
    const gate = { id: 'gate_1', name: 'My Gate' }
    fetcherMock.mockResolvedValue({ data: gate })

    const { result } = renderUseFeatureGate('gate_1')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(gate)
    expect(fetcherMock).toHaveBeenCalledWith('/gates/gate_1')
  })

  it('propagates fetcher errors with cause', async () => {
    const originalError = new Error('Forbidden')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseFeatureGate('gate_x')

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('Forbidden')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
