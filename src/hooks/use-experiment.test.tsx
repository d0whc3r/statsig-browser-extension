import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useExperiment } from './use-experiment'

const { fetcherMock } = vi.hoisted(() => ({ fetcherMock: vi.fn() }))

vi.mock('@/src/lib/fetcher', () => ({
  fetcher: fetcherMock,
}))

const renderUseExperiment = (id?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useExperiment(id), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useExperiment', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('is disabled when no experimentId is provided', () => {
    const { result } = renderUseExperiment()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('fetches and returns the experiment data', async () => {
    const experiment = { id: 'exp_1', name: 'My Experiment' }
    fetcherMock.mockResolvedValue({ data: experiment })

    const { result } = renderUseExperiment('exp_1')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(experiment)
    expect(fetcherMock).toHaveBeenCalledWith('/experiments/exp_1')
  })

  it('wraps fetcher errors with handleApiError and includes cause', async () => {
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseExperiment('exp_err')

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('Boom')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
