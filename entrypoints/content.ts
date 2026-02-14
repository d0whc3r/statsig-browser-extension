export default defineContentScript({
  main() {
    // Inject a script to access the window.statsig object
    const script = document.createElement('script')
    script.textContent = `
      (function() {
        function checkStatsig() {
          if (window.statsig) {
            try {
              const user = window.statsig.getCurrentUser();
              window.postMessage({ type: 'STATSIG_USER_DETECTED', user }, '*');
            } catch (e) {
              window.postMessage({ type: 'STATSIG_DETECTED_BUT_ERROR', error: e.message }, '*');
            }
          } else {
            window.postMessage({ type: 'STATSIG_NOT_DETECTED' }, '*');
          }
        }
        
        // Check immediately
        checkStatsig();
        
        // Poll for a few seconds to catch async initialization
        let attempts = 0;
        const interval = setInterval(() => {
          if (window.statsig) {
            clearInterval(interval);
            checkStatsig();
          } else if (attempts > 10) {
            clearInterval(interval);
          }
          attempts++;
        }, 1000);
      })();
    `
    ;(document.head || document.documentElement).append(script)
    script.remove()

    let detectedUser = ''

    // Listen for messages from the injected script
    window.addEventListener('message', (event) => {
      if (event.source !== globalThis.window) {
        return
      }

      if (
        event.data &&
        typeof event.data === 'object' &&
        'type' in event.data &&
        event.data.type === 'STATSIG_USER_DETECTED' &&
        'user' in event.data
      ) {
        detectedUser = event.data.user
        chrome.runtime
          .sendMessage({
            type: 'STATSIG_USER_FOUND',
            user: detectedUser,
          })
          .catch(() => {
            // Ignore error if popup is not open
          })
      }
    })

    // Listen for requests from the popup
    chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
      if (
        message &&
        typeof message === 'object' &&
        'type' in message &&
        (message as { type: string }).type === 'GET_STATSIG_USER'
      ) {
        sendResponse({ user: detectedUser })
      }
    })
  },
  matches: ['<all_urls>'],
})
