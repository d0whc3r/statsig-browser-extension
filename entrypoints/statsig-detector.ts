import { getUserDetailsFromPage } from '@/src/lib/get-user-details-injector'

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const getMessageType = (value: unknown) => {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return null
  }

  return value.type
}

// oxlint-disable-next-line import/no-default-export
export default defineContentScript({
  main() {
    const MAX_ATTEMPTS = 20

    function checkStatsig() {
      const result = getUserDetailsFromPage()

      if (result) {
        window.postMessage({ context: result.context, type: 'STATSIG_USER_DETECTED', user: result.user }, '*')
        return true
      }
      return false
    }

    // Check immediately
    if (checkStatsig()) {
      return
    }

    // Poll for a few seconds to catch async initialization
    const POLL_INTERVAL_MS = 500
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (checkStatsig() || attempts > MAX_ATTEMPTS) {
        clearInterval(interval)
      }
    }, POLL_INTERVAL_MS)

    // Listen for retry request
    window.addEventListener('message', (event) => {
      const type = getMessageType(event.data)
      if (type === 'RETRY_STATSIG_DETECTION' || type === 'FETCH_STATSIG_DATA_FROM_PAGE') {
        checkStatsig()
      }
    })
  },
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  world: 'MAIN',
})
