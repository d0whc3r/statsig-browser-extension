import type { Runtime } from 'webextension-polyfill'

import { browser } from 'wxt/browser'

interface StatsigUserMessage {
  type: string
  user?: unknown
  context?: unknown
  error?: string
}

const RESPONSE_TIMEOUT_MS = 1000

// State variables at module scope
let detectedUser: unknown = null
let detectedContext: unknown = null
let detectedError: string | null = null

const updateDetectedState = (user: unknown, context: unknown, error: string | null) => {
  detectedUser = user
  detectedContext = context
  detectedError = error
}

const sendToRuntime = (message: unknown) => {
  browser.runtime.sendMessage(message).catch(() => {
    // Ignore error if popup is not open
  })
}

const handleUserDetected = (
  data: StatsigUserMessage,
  sendResponse: (response: unknown) => void,
  cleanup: () => void,
) => {
  updateDetectedState(data.user, data.context, null)
  sendResponse({ context: detectedContext, error: null, user: detectedUser })
  cleanup()
}

const handleErrorDetected = (
  data: StatsigUserMessage,
  sendResponse: (response: unknown) => void,
  cleanup: () => void,
) => {
  const error = data.error ?? 'Unknown error'
  updateDetectedState(null, null, error)
  sendResponse({ context: null, error, user: null })
  cleanup()
}

const handleNotDetected = (sendResponse: (response: unknown) => void, cleanup: () => void) => {
  sendResponse({ context: null, error: null, user: null })
  cleanup()
}

const isValidMessage = (event: MessageEvent): StatsigUserMessage | null => {
  if (event.source !== globalThis.window) {
    return null
  }
  const data = event.data as StatsigUserMessage | undefined
  if (!data?.type) {
    return null
  }
  return data
}

const createMessageHandler = (sendResponse: (response: unknown) => void) => {
  const handler = (event: MessageEvent) => {
    const data = isValidMessage(event)
    if (!data) {
      return
    }

    const cleanup = () => {
      globalThis.window.removeEventListener('message', handler)
    }

    if (data.type === 'STATSIG_USER_DETECTED') {
      handleUserDetected(data, sendResponse, cleanup)
    } else if (data.type === 'STATSIG_DETECTED_BUT_ERROR') {
      handleErrorDetected(data, sendResponse, cleanup)
    } else if (data.type === 'STATSIG_NOT_DETECTED') {
      handleNotDetected(sendResponse, cleanup)
    }
  }
  return handler
}

const handleGetStatsigUser = (sendResponse: (response: unknown) => void) => {
  if (detectedUser || detectedError) {
    sendResponse({
      context: detectedContext,
      error: detectedError,
      user: detectedUser,
    })
    return true
  }

  const timeout: { id: ReturnType<typeof setTimeout> | undefined } = { id: undefined }

  const wrappedSendResponse = (response: unknown) => {
    clearTimeout(timeout.id)
    sendResponse(response)
  }

  const handler = createMessageHandler(wrappedSendResponse)

  globalThis.window.addEventListener('message', handler)
  globalThis.window.postMessage({ type: 'FETCH_STATSIG_DATA_FROM_PAGE' }, '*')

  timeout.id = setTimeout(() => {
    globalThis.window.removeEventListener('message', handler)
    wrappedSendResponse({ context: null, error: null, user: null })
  }, RESPONSE_TIMEOUT_MS)

  return true
}

const handlePing = (sendResponse: (response: unknown) => void) => {
  sendResponse({ success: true })
  return true
}

const handleRetryDetection = (sendResponse: (response: unknown) => void) => {
  globalThis.window.postMessage({ type: 'RETRY_STATSIG_DETECTION' }, '*')
  sendResponse({ success: true })
  return true
}

const handleRuntimeMessage = (
  message: unknown,
  _sender: Runtime.MessageSender,
  sendResponse: (response: unknown) => void,
) => {
  const msg = message as { type: string } | undefined
  if (!msg?.type) {
    return true
  }

  switch (msg.type) {
    case 'PING': {
      return handlePing(sendResponse)
    }
    case 'RETRY_DETECTION': {
      return handleRetryDetection(sendResponse)
    }
    case 'GET_STATSIG_USER': {
      return handleGetStatsigUser(sendResponse)
    }
    default: {
      return true
    }
  }
}

const handleWindowUserDetected = (data: StatsigUserMessage) => {
  updateDetectedState(data.user, data.context, null)
  sendToRuntime({
    context: detectedContext,
    type: 'STATSIG_USER_FOUND',
    user: detectedUser,
  })
}

const handleWindowErrorDetected = (data: StatsigUserMessage) => {
  const error = data.error ?? 'Unknown error'
  updateDetectedState(null, null, error)
  sendToRuntime({
    error: detectedError,
    type: 'STATSIG_DETECTED_BUT_ERROR',
  })
}

const handleWindowMessage = (event: MessageEvent) => {
  const data = isValidMessage(event)
  if (!data) {
    return
  }

  if (data.type === 'STATSIG_USER_DETECTED') {
    handleWindowUserDetected(data)
  } else if (data.type === 'STATSIG_DETECTED_BUT_ERROR') {
    handleWindowErrorDetected(data)
  }
}

export default defineContentScript({
  main() {
    console.log('[Statsig Extension] Content script started (ISOLATED)')
    globalThis.window.addEventListener('message', handleWindowMessage)
    browser.runtime.onMessage.addListener(handleRuntimeMessage)
  },
  matches: ['<all_urls>'],
  runAt: 'document_start',
})
