import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserDetails } from './use-user-details'

const { getActiveTabMock, getUserDetailsMock } = vi.hoisted(() => ({
  getActiveTabMock: vi.fn(),
  getUserDetailsMock: vi.fn(),
}))

vi.mock('@/src/lib/tabs', () => ({
  getActiveTab: getActiveTabMock,
}))

vi.mock('../handlers/get-user-details', () => ({
  getUserDetails: getUserDetailsMock,
}))

const renderUseUserDetails = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return renderHook(() => useUserDetails(), {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

describe('useUserDetails', () => {
  beforeEach(() => {
    getActiveTabMock.mockReset()
    getUserDetailsMock.mockReset()
  })

  it('returns the user from the active tab', async () => {
    const user = { userID: 'user-1' }
    getActiveTabMock.mockResolvedValue({ id: 42 })
    getUserDetailsMock.mockResolvedValue({ user })

    const { result } = renderUseUserDetails()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(user)
    expect(getUserDetailsMock).toHaveBeenCalledWith(42)
  })

  it('returns an empty object when handler returns undefined', async () => {
    getActiveTabMock.mockResolvedValue({ id: 7 })
    // oxlint-disable-next-line unicorn/no-useless-undefined
    getUserDetailsMock.mockResolvedValue(undefined)

    const { result } = renderUseUserDetails()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual({})
  })

  it('returns an empty object when handler returns no user', async () => {
    getActiveTabMock.mockResolvedValue({ id: 9 })
    getUserDetailsMock.mockResolvedValue({})

    const { result } = renderUseUserDetails()

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual({})
  })

  it('fails when no active tab is found', async () => {
    getActiveTabMock.mockResolvedValue(null)

    const { result } = renderUseUserDetails()

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toBe('No active tab found')
    expect(getUserDetailsMock).not.toHaveBeenCalled()
  })

  it('fails when active tab has no id', async () => {
    getActiveTabMock.mockResolvedValue({})

    const { result } = renderUseUserDetails()

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect((result.current.error as Error).message).toBe('No active tab found')
  })
})
