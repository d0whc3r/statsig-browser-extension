import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGateOverrides } from './use-gate-overrides'

const { fetcherMock } = vi.hoisted(() => ({ fetcherMock: vi.fn() }))

vi.mock('@/src/lib/fetcher', () => ({
  fetcher: fetcherMock,
}))

const renderUseGateOverrides = (id?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useGateOverrides(id), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useGateOverrides', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('is disabled when no gateId is provided', () => {
    const { result } = renderUseGateOverrides()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('returns the gate overrides data', async () => {
    const override = {
      failingUserIDs: ['u2'],
      passingUserIDs: ['u1'],
    }
    fetcherMock.mockResolvedValue({ data: override })

    const { result } = renderUseGateOverrides('gate_1')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(override)
    expect(fetcherMock).toHaveBeenCalledWith('/gates/gate_1/overrides')
  })

  it('propagates fetcher errors with cause', async () => {
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseGateOverrides('gate_err')

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('Boom')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
