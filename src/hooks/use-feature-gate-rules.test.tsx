import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFeatureGateRules } from './use-feature-gate-rules'

const { fetcherMock } = vi.hoisted(() => ({ fetcherMock: vi.fn() }))

vi.mock('@/src/lib/fetcher', () => ({
  fetcher: fetcherMock,
}))

const renderHookWithClient = (id: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useFeatureGateRules(id), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useFeatureGateRules', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('is disabled when no gateId is provided', () => {
    const { result } = renderHookWithClient('')
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('returns the rules from the first data entry', async () => {
    const rules = [{ id: 'rule_1', name: 'Rule 1' }]
    fetcherMock.mockResolvedValue({ data: [{ rules }], message: 'ok' })

    const { result } = renderHookWithClient('gate_1')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(rules)
    expect(fetcherMock).toHaveBeenCalledWith('/gates/gate_1/rules')
  })

  it('returns an empty array when no rules entry exists', async () => {
    fetcherMock.mockResolvedValue({ data: [], message: 'ok' })

    const { result } = renderHookWithClient('gate_empty')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual([])
  })

  it('returns an empty array when data is undefined', async () => {
    fetcherMock.mockResolvedValue({ message: 'no data' })

    const { result } = renderHookWithClient('gate_nodata')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual([])
  })

  it('propagates fetcher errors with cause', async () => {
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderHookWithClient('gate_err')

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('Boom')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
