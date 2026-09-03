import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const addRuntimeListener = vi.fn()
const sendMessage = vi.fn().mockResolvedValue(null)

vi.mock('wxt/utils/define-content-script', () => ({
  defineContentScript: (config: { main: () => void }) => config,
}))

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      onMessage: {
        addListener: addRuntimeListener,
      },
      sendMessage,
    },
  },
}))

type RuntimeListener = (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean

const loadContent = async () => {
  addRuntimeListener.mockClear()
  sendMessage.mockClear()
  vi.resetModules()
  const mod = await import('@/entrypoints/content')
  const definition = mod.default as { main: () => void }
  definition.main()
  const listener = addRuntimeListener.mock.calls[0]?.[0] as RuntimeListener | undefined
  if (!listener) {
    throw new Error('content script did not register a runtime listener')
  }
  return listener
}

const windowMessage = (
  data: unknown,
  source: Window | null = globalThis.window,
  origin: string = globalThis.window.location.origin,
) => new MessageEvent('message', { data, origin, source })

describe('content script statsig detection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('answers PING and RETRY_DETECTION immediately', async () => {
    const postMessage = vi.spyOn(globalThis.window, 'postMessage')
    const listener = await loadContent()
    const sendResponse = vi.fn()

    expect(listener({ type: 'PING' }, {}, sendResponse)).toBeTruthy()
    expect(sendResponse).toHaveBeenCalledWith({ success: true })

    sendResponse.mockClear()
    expect(listener({ type: 'RETRY_DETECTION' }, {}, sendResponse)).toBeTruthy()
    expect(sendResponse).toHaveBeenCalledWith({ success: true })
    expect(postMessage).toHaveBeenCalledWith({ type: 'RETRY_STATSIG_DETECTION' }, globalThis.window.location.origin)
  })

  it('returns cached user on GET_STATSIG_USER after a window detection event', async () => {
    const listener = await loadContent()

    globalThis.window.dispatchEvent(
      windowMessage({ context: { sdk: 'js' }, type: 'STATSIG_USER_DETECTED', user: { userID: 'u_1' } }),
    )

    expect(sendMessage).toHaveBeenCalledWith({
      context: { sdk: 'js' },
      type: 'STATSIG_USER_FOUND',
      user: { userID: 'u_1' },
    })

    const sendResponse = vi.fn()
    expect(listener({ type: 'GET_STATSIG_USER' }, {}, sendResponse)).toBeTruthy()
    expect(sendResponse).toHaveBeenCalledWith({
      context: { sdk: 'js' },
      error: null,
      user: { userID: 'u_1' },
    })
  })

  it('forwards detection errors from the page and serves them from cache', async () => {
    const listener = await loadContent()

    globalThis.window.dispatchEvent(windowMessage({ error: 'sdk missing', type: 'STATSIG_DETECTED_BUT_ERROR' }))

    expect(sendMessage).toHaveBeenCalledWith({
      error: 'sdk missing',
      type: 'STATSIG_DETECTED_BUT_ERROR',
    })

    const sendResponse = vi.fn()
    listener({ type: 'GET_STATSIG_USER' }, {}, sendResponse)
    expect(sendResponse).toHaveBeenCalledWith({
      context: null,
      error: 'sdk missing',
      user: null,
    })
  })

  it('uses a generic error when the page error payload has no message', async () => {
    await loadContent()
    globalThis.window.dispatchEvent(windowMessage({ type: 'STATSIG_DETECTED_BUT_ERROR' }))
    expect(sendMessage).toHaveBeenCalledWith({
      error: 'Unknown error',
      type: 'STATSIG_DETECTED_BUT_ERROR',
    })
  })

  it('times out GET_STATSIG_USER when the page never replies', async () => {
    const listener = await loadContent()
    const sendResponse = vi.fn()

    expect(listener({ type: 'GET_STATSIG_USER' }, {}, sendResponse)).toBeTruthy()
    expect(sendResponse).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)

    expect(sendResponse).toHaveBeenCalledWith({ context: null, error: null, user: null })
  })

  it('resolves GET_STATSIG_USER from a page message before the timeout', async () => {
    const listener = await loadContent()
    const sendResponse = vi.fn()

    listener({ type: 'GET_STATSIG_USER' }, {}, sendResponse)
    globalThis.window.dispatchEvent(
      windowMessage({ context: { env: 'prod' }, type: 'STATSIG_USER_DETECTED', user: { userID: 'u_live' } }),
    )

    expect(sendResponse).toHaveBeenCalledWith({
      context: { env: 'prod' },
      error: null,
      user: { userID: 'u_live' },
    })
  })

  it('treats STATSIG_NOT_DETECTED as an empty user during an in-flight request', async () => {
    const listener = await loadContent()
    const sendResponse = vi.fn()

    listener({ type: 'GET_STATSIG_USER' }, {}, sendResponse)
    globalThis.window.dispatchEvent(windowMessage({ type: 'STATSIG_NOT_DETECTED' }))

    expect(sendResponse).toHaveBeenCalledWith({ context: null, error: null, user: null })
  })

  it('ignores invalid runtime messages and window events from other sources', async () => {
    const listener = await loadContent()
    const sendResponse = vi.fn()

    expect(listener(null, {}, sendResponse)).toBeTruthy()
    expect(listener({ type: 'UNKNOWN' }, {}, sendResponse)).toBeTruthy()
    expect(sendResponse).not.toHaveBeenCalled()

    globalThis.window.dispatchEvent(windowMessage({ type: 'STATSIG_USER_DETECTED', user: { userID: 'nope' } }, null))
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('ignores window events from other origins even when sent by the same window', async () => {
    await loadContent()

    globalThis.window.dispatchEvent(
      windowMessage(
        { type: 'STATSIG_USER_DETECTED', user: { userID: 'spoofed' } },
        globalThis.window,
        'https://evil.example',
      ),
    )

    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('swallows runtime sendMessage failures when the popup is closed', async () => {
    sendMessage.mockRejectedValueOnce(new Error('no receiving end'))
    await loadContent()

    expect(() => {
      globalThis.window.dispatchEvent(windowMessage({ type: 'STATSIG_USER_DETECTED', user: { userID: 'u_1' } }))
    }).not.toThrow()
  })
})
