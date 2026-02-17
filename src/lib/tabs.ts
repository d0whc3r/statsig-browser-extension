import { browser } from 'wxt/browser'

/**
 * Retrieves the active tab in a robust way, handling potential issues with popup window focus.
 * First tries to find the active tab in the current window.
 * If that fails (e.g. because the popup is considered the current window but has no tabs),
 * falls back to finding any active tab (which, with activeTab permission, will be the correct one).
 */
export async function getActiveTab() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0) {
      return tabs[0]
    }

    // Fallback: try finding active tab without currentWindow constraint
    // This is safe with 'activeTab' permission as it only returns the tab we have access to
    const fallbackTabs = await browser.tabs.query({ active: true })
    if (fallbackTabs.length > 0) {
      return fallbackTabs[0]
    }
  } catch (error) {
    console.error('[Statsig Extension] Failed to get active tab:', error)
  }
}
