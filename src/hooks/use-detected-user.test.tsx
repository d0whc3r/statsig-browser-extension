import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDetectedUser } from './use-detected-user'

type MessageListener = (message: unknown) => void

const { browserMock, getActiveTabMock, setDetectedContextMock, setDetectedUserMock, setDetectionErrorMock, listeners } =
  vi.hoisted(() => {
    const listenersArray: MessageListener[] = []
    return {
      browserMock: {
        runtime: {
          onMessage: {
            addListener: vi.fn((cb: MessageListener) => {
              listenersArray.push(cb)
            }),
            removeListener: vi.fn((cb: MessageListener) => {
              const i = listenersArray.indexOf(cb)
              if (i !== -1) {
                listenersArray.splice(i, 1)
              }
            }),
          },
        },
        tabs: {
          sendMessage: vi.fn(),
        },
      },
      getActiveTabMock: vi.fn(),
      listeners: listenersArray,
      setDetectedContextMock: vi.fn(),
      setDetectedUserMock: vi.fn(),
      setDetectionErrorMock: vi.fn(),
    }
  })

vi.mock('wxt/browser', () => ({
  browser: browserMock,
}))

vi.mock('@/src/lib/tabs', () => ({
  getActiveTab: getActiveTabMock,
}))

vi.mock('@/src/store/use-context-store', () => ({
  useContextStore: (selector: (state: unknown) => unknown) =>
    selector({
      setDetectedContext: setDetectedContextMock,
      setDetectedUser: setDetectedUserMock,
      setDetectionError: setDetectionErrorMock,
    }),
}))

describe('useDetectedUser', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setDetectedUserMock.mockReset()
    setDetectedContextMock.mockReset()
    setDetectionErrorMock.mockReset()
    getActiveTabMock.mockReset()
    browserMock.tabs.sendMessage.mockReset()
    browserMock.runtime.onMessage.addListener.mockClear()
    browserMock.runtime.onMessage.removeListener.mockClear()
    listeners.length = 0
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('writes user and context to the store after fetching from the active tab', async () => {
    getActiveTabMock.mockResolvedValue({ id: 5 })
    browserMock.tabs.sendMessage.mockResolvedValue({ context: { app: 'web' }, user: { userID: 'u1' } })

    renderHook(() => useDetectedUser())

    await vi.waitFor(() => {
      expect(setDetectedUserMock).toHaveBeenCalledWith({ userID: 'u1' })
    })
    expect(setDetectedContextMock).toHaveBeenCalledWith({ app: 'web' })
    expect(setDetectionErrorMock).toHaveBeenCalledWith(null)
  })

  it('does not call setDetectedUser when there is no active tab', async () => {
    getActiveTabMock.mockResolvedValue(null)
    renderHook(() => useDetectedUser())

    await vi.waitFor(() => {
      expect(getActiveTabMock).toHaveBeenCalledWith()
    })
    expect(browserMock.tabs.sendMessage).not.toHaveBeenCalled()
    expect(setDetectedUserMock).not.toHaveBeenCalled()
  })

  it('handles STATSIG_USER_FOUND runtime messages', async () => {
    getActiveTabMock.mockResolvedValue({ id: 1 })
    browserMock.tabs.sendMessage.mockResolvedValue({})

    renderHook(() => useDetectedUser())

    await vi.waitFor(() => {
      expect(listeners.length).toBeGreaterThan(0)
    })

    act(() => {
      listeners[0]({
        context: { stableID: 's1' },
        type: 'STATSIG_USER_FOUND',
        user: { userID: 'u_msg' },
      })
    })

    expect(setDetectedUserMock).toHaveBeenCalledWith({ userID: 'u_msg' })
    expect(setDetectedContextMock).toHaveBeenCalledWith({ stableID: 's1' })
    expect(setDetectionErrorMock).toHaveBeenLastCalledWith(null)
  })

  it('handles STATSIG_DETECTED_BUT_ERROR runtime messages', async () => {
    getActiveTabMock.mockResolvedValue({ id: 1 })
    browserMock.tabs.sendMessage.mockResolvedValue({})

    renderHook(() => useDetectedUser())

    await vi.waitFor(() => {
      expect(listeners.length).toBeGreaterThan(0)
    })

    act(() => {
      listeners[0]({ error: 'page broken', type: 'STATSIG_DETECTED_BUT_ERROR' })
    })

    expect(setDetectionErrorMock).toHaveBeenCalledWith('page broken')
    expect(setDetectedUserMock).not.toHaveBeenCalled()
  })

  it('ignores malformed runtime messages', async () => {
    getActiveTabMock.mockResolvedValue({ id: 1 })
    browserMock.tabs.sendMessage.mockResolvedValue({})

    renderHook(() => useDetectedUser())

    await vi.waitFor(() => {
      expect(listeners.length).toBeGreaterThan(0)
    })

    act(() => {
      listeners[0]('not an object')
      listeners[0]({ no_type: true })
    })

    expect(setDetectedUserMock).not.toHaveBeenCalled()
    expect(setDetectionErrorMock).not.toHaveBeenCalledWith(expect.any(String))
  })

  it('removes the message listener on unmount', async () => {
    getActiveTabMock.mockResolvedValue({ id: 1 })
    browserMock.tabs.sendMessage.mockResolvedValue({})

    const { unmount } = renderHook(() => useDetectedUser())

    await vi.waitFor(() => {
      expect(listeners).toHaveLength(1)
    })

    unmount()
    expect(listeners).toHaveLength(0)
  })

  it('retryDetection sends a message and writes detected user on success', async () => {
    getActiveTabMock.mockResolvedValue({ id: 3 })
    browserMock.tabs.sendMessage.mockResolvedValueOnce({}).mockResolvedValueOnce({ user: { userID: 'retry_u' } })

    const { result } = renderHook(() => useDetectedUser())

    await vi.waitFor(() => {
      expect(getActiveTabMock).toHaveBeenCalledWith()
    })

    await act(async () => {
      await result.current.retryDetection()
    })

    expect(setDetectedUserMock).toHaveBeenCalledWith({ userID: 'retry_u' })
    expect(setDetectionErrorMock).toHaveBeenCalledWith(null)
  })

  it('retryDetection writes a detection error if sending the message fails', async () => {
    getActiveTabMock.mockResolvedValueOnce({ id: 3 }).mockResolvedValueOnce({ id: 3 })
    browserMock.tabs.sendMessage.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('disconnected'))

    const { result } = renderHook(() => useDetectedUser())

    await act(async () => {
      await result.current.retryDetection()
    })

    expect(setDetectionErrorMock).toHaveBeenCalledWith('Connection failed. Please refresh the page.')
  })
})
