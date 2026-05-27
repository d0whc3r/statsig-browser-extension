import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDynamicConfig } from './use-dynamic-config'

const { fetcherMock } = vi.hoisted(() => ({ fetcherMock: vi.fn() }))

vi.mock('@/src/lib/fetcher', () => ({
  fetcher: fetcherMock,
}))

const renderUseDynamicConfig = (id?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useDynamicConfig(id), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useDynamicConfig', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('is disabled when no configId is provided', () => {
    const { result } = renderUseDynamicConfig()
    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('fetches the config by id', async () => {
    const config = { id: 'config_1', name: 'My Config' }
    fetcherMock.mockResolvedValue({ data: config })

    const { result } = renderUseDynamicConfig('config_1')

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(config)
    expect(fetcherMock).toHaveBeenCalledWith('/dynamic_configs/config_1')
  })

  it('propagates fetcher errors with cause', async () => {
    const originalError = new Error('Not Found')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderUseDynamicConfig('config_x')

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('Not Found')
    expect((result.current.error as Error).cause).toBe(originalError)
  })
})
