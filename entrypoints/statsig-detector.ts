import { getUserDetailsFromPage } from '@/src/lib/get-user-details-injector'

// oxlint-disable-next-line import/no-default-export
export default defineContentScript({
  main() {
    const MAX_ATTEMPTS = 20
    console.log('[Statsig Extension] Main world script started')

    function checkStatsig() {
      const result = getUserDetailsFromPage()

      if (result) {
        console.log('[Statsig Extension] User detected:', result.user)
        window.postMessage(
          { context: result.context, type: 'STATSIG_USER_DETECTED', user: result.user },
          '*',
        )
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
      if (
        event.data?.type === 'RETRY_STATSIG_DETECTION' ||
        event.data?.type === 'FETCH_STATSIG_DATA_FROM_PAGE'
      ) {
        checkStatsig()
      }
    })
  },
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  world: 'MAIN',
})
