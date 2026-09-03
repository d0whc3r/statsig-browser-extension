import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getUserDetailsFromPage = vi.fn()

vi.mock('wxt/utils/define-content-script', () => ({
  defineContentScript: (config: { main: () => void }) => config,
}))

vi.mock('@/src/lib/get-user-details-injector', () => ({
  getUserDetailsFromPage,
}))

const loadDetector = async () => {
  vi.resetModules()
  const mod = await import('@/entrypoints/statsig-detector')
  return mod.default as { main: () => void }
}

describe('statsig detector content script', () => {
  beforeEach(() => {
    getUserDetailsFromPage.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('posts STATSIG_USER_DETECTED and stops polling when the SDK is present immediately', async () => {
    const postMessage = vi.spyOn(globalThis.window, 'postMessage')
    getUserDetailsFromPage.mockReturnValue({ context: { sdk: 'js' }, user: { userID: 'u_1' } })

    const detector = await loadDetector()
    detector.main()

    expect(postMessage).toHaveBeenCalledWith(
      { context: { sdk: 'js' }, type: 'STATSIG_USER_DETECTED', user: { userID: 'u_1' } },
      '*',
    )

    getUserDetailsFromPage.mockClear()
    await vi.advanceTimersByTimeAsync(2000)
    expect(getUserDetailsFromPage).not.toHaveBeenCalled()
  })

  it('polls until the SDK appears, then stops', async () => {
    const postMessage = vi.spyOn(globalThis.window, 'postMessage')
    getUserDetailsFromPage.mockReturnValue(null)

    const detector = await loadDetector()
    detector.main()

    expect(postMessage).not.toHaveBeenCalled()

    getUserDetailsFromPage.mockReturnValue({ context: undefined, user: { userID: 'late' } })
    await vi.advanceTimersByTimeAsync(500)

    expect(postMessage).toHaveBeenCalledWith(
      { context: undefined, type: 'STATSIG_USER_DETECTED', user: { userID: 'late' } },
      '*',
    )

    postMessage.mockClear()
    await vi.advanceTimersByTimeAsync(2000)
    expect(postMessage).not.toHaveBeenCalled()
  })

  it('stops polling after the maximum number of attempts', async () => {
    getUserDetailsFromPage.mockReturnValue(null)
    const detector = await loadDetector()
    detector.main()

    await vi.advanceTimersByTimeAsync(500 * 21)

    const callsAfterMax = getUserDetailsFromPage.mock.calls.length
    await vi.advanceTimersByTimeAsync(2000)
    expect(getUserDetailsFromPage).toHaveBeenCalledTimes(callsAfterMax)
  })

  it('re-checks when the page asks to retry or fetch', async () => {
    getUserDetailsFromPage.mockReturnValue(null)
    const detector = await loadDetector()
    detector.main()
    const callsBefore = getUserDetailsFromPage.mock.calls.length

    globalThis.window.dispatchEvent(new MessageEvent('message', { data: { type: 'RETRY_STATSIG_DETECTION' } }))
    globalThis.window.dispatchEvent(new MessageEvent('message', { data: { type: 'FETCH_STATSIG_DATA_FROM_PAGE' } }))
    globalThis.window.dispatchEvent(new MessageEvent('message', { data: { type: 'UNRELATED' } }))
    globalThis.window.dispatchEvent(new MessageEvent('message', { data: null }))

    expect(getUserDetailsFromPage.mock.calls.length).toBeGreaterThan(callsBefore)
  })
})
