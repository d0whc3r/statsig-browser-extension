import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUnitIDTypes } from './use-unit-id-types'

const getUnitIDTypes = vi.fn()

vi.mock('@/src/handlers/get-unit-id-types', () => ({
  getUnitIDTypes: () => getUnitIDTypes(),
}))

const renderUseUnitIDTypes = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderHook(() => useUnitIDTypes(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useUnitIDTypes', () => {
  beforeEach(() => {
    getUnitIDTypes.mockReset()
  })

  it('returns the unit id types from the handler', async () => {
    getUnitIDTypes.mockResolvedValue(['userID', 'stableID', 'companyID'])
    const { result } = renderUseUnitIDTypes()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(['userID', 'stableID', 'companyID'])
  })
})
