import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHookWithProviders } from '@/src/tests/utils/TestUtils'

import { useAuditLogs } from './use-audit-logs'
import { useDynamicConfigs } from './use-dynamic-configs'
import { useExperiments } from './use-experiments'
import { useFeatureGates } from './use-feature-gates'

const { fetcherMock, useSettingsStorageMock } = vi.hoisted(() => ({
  fetcherMock: vi.fn(),
  useSettingsStorageMock: vi.fn(),
}))

vi.mock('@/src/lib/fetcher', () => ({ fetcher: fetcherMock }))
vi.mock('@/src/hooks/use-settings-storage', () => ({ useSettingsStorage: useSettingsStorageMock }))

/**
 * The four infinite-list hooks are copies of one shape: apiKey gating plus a
 * `page * limit < totalItems` cursor. Only the endpoint and the page limit differ,
 * so the contract is asserted once per hook instead of once per file.
 */
const LIST_HOOKS = [
  { hook: useFeatureGates, limit: 100, name: 'useFeatureGates', path: '/gates' },
  { hook: useDynamicConfigs, limit: 100, name: 'useDynamicConfigs', path: '/dynamic_configs' },
  { hook: useExperiments, limit: 100, name: 'useExperiments', path: '/experiments' },
  { hook: useAuditLogs, limit: 50, name: 'useAuditLogs', path: '/audit_logs' },
] as const

describe.each(LIST_HOOKS)('$name', ({ hook, limit, path }) => {
  const pageResponse = (id: string, page: number, totalItems: number) => ({
    data: [{ id }],
    pagination: { limit, page, totalItems },
  })

  beforeEach(() => {
    fetcherMock.mockReset()
    useSettingsStorageMock.mockReset()
    useSettingsStorageMock.mockReturnValue({ apiKey: 'key' })
  })

  it('stays idle until an apiKey is configured', () => {
    useSettingsStorageMock.mockReturnValue({ apiKey: '' })

    const { result } = renderHookWithProviders(() => hook())

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('fetches the first page', async () => {
    fetcherMock.mockResolvedValue(pageResponse('item_1', 1, 1))

    const { result } = renderHookWithProviders(() => hook())
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data?.pages[0].data).toStrictEqual([{ id: 'item_1' }])
    expect(fetcherMock).toHaveBeenCalledWith(`${path}?limit=${limit}&page=1`)
  })

  it('advances to the next page while items remain', async () => {
    fetcherMock.mockResolvedValueOnce(pageResponse('item_1', 1, limit + 1))

    const { result } = renderHookWithProviders(() => hook())
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })
    expect(result.current.hasNextPage).toBeTruthy()

    fetcherMock.mockResolvedValueOnce(pageResponse('item_2', 2, limit + 1))
    await act(async () => {
      await result.current.fetchNextPage()
    })

    expect(fetcherMock).toHaveBeenLastCalledWith(`${path}?limit=${limit}&page=2`)
  })

  // Boundary: the last page fills the limit exactly, so `page * limit === totalItems`.
  it('reports no next page once totalItems is covered', async () => {
    fetcherMock.mockResolvedValue(pageResponse('item_1', 1, limit))

    const { result } = renderHookWithProviders(() => hook())
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('reports no next page when the response omits pagination metadata', async () => {
    fetcherMock.mockResolvedValue({ data: [{ id: 'item_1' }] })

    const { result } = renderHookWithProviders(() => hook())
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.hasNextPage).toBeFalsy()
  })

  it('wraps fetcher errors and keeps the original as cause', async () => {
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderHookWithProviders(() => hook())
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect(result.current.error?.message).toBe('Boom')
    expect(result.current.error?.cause).toBe(originalError)
  })
})
