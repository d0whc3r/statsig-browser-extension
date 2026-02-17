// oxlint-disable no-inner-declarations
// oxlint-disable max-statements
import type { StatsigInstance, WindowWithStatsig } from '../types/statsig'

export const getUserDetailsFromPage = () => {
  try {
    const win = globalThis as unknown as WindowWithStatsig

    // oxlint-disable-next-line unicorn/consistent-function-scoping
    function getUser(instance: StatsigInstance) {
      if (!instance) {
        return null
      }

      // Try getCurrentUser()
      if (typeof instance.getCurrentUser === 'function') {
        return instance.getCurrentUser()
      }

      // Try internal properties
      if (instance._user) {
        return instance._user
      }
      if (instance.identity?.user) {
        return instance.identity.user
      }

      return null
    }

    function getStableID(instance: StatsigInstance) {
      // 1. Try instance.getStableID()
      if (typeof instance.getStableID === 'function') {
        const sid = instance.getStableID()
        if (sid) {
          return sid
        }
      }

      // 2. Try instance.getContext().stableID
      if (typeof instance.getContext === 'function') {
        const ctx = instance.getContext()
        if (ctx?.stableID) {
          return ctx.stableID
        }
      }

      // 3. Fallback: window.__STATSIG__.firstInstance.getContext()
      // This is specifically requested by the user for React SDK scenarios
      if (win.__STATSIG__?.firstInstance) {
        const { firstInstance } = win.__STATSIG__
        if (typeof firstInstance.getContext === 'function') {
          const ctx = firstInstance.getContext()
          if (ctx?.stableID) {
            return ctx.stableID
          }
        }
      }

      // 4. Fallback: instance properties
      if (instance._stableID) {
        return instance._stableID
      }
      if (instance.identity?.stableID) {
        return instance.identity.stableID
      }

      return null
    }

    function getStatsigInstance() {
      // 1. Check window.statsig (JS SDK)
      if (win.statsig) {
        if (typeof win.statsig.getCurrentUser === 'function') {
          return win.statsig
        }
        // Fallback for JS SDK instance properties
        if (win.statsig._user || win.statsig.identity) {
          return win.statsig
        }
      }

      // 2. Check window.__STATSIG__ (React SDK / multiple instances)
      if (win.__STATSIG__) {
        // Check instances map
        if (win.__STATSIG__.instances) {
          const instances = Object.values(win.__STATSIG__.instances)
          if (instances.length > 0) {
            return instances[0]
          }
        }
        // Check firstInstance
        if (win.__STATSIG__.firstInstance) {
          return win.__STATSIG__.firstInstance
        }
      }

      // 3. Check window.__STATSIG_JS_SDK__
      if (win.__STATSIG_JS_SDK__?.instance) {
        return win.__STATSIG_JS_SDK__.instance
      }

      return null
    }

    const instance = getStatsigInstance()
    if (!instance) {
      return
    }

    const user = getUser(instance) || {}
    const stableID = getStableID(instance)

    if (stableID) {
      user.stableID = stableID
    }

    const context = typeof instance.getContext === 'function' ? instance.getContext() : undefined

    return {
      context,
      user,
    }
  } catch {
    // Ignore errors to prevent crashing the extension
  }
}
