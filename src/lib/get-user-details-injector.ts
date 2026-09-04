/* This file is one self-contained function injected into the page, so every helper has to be
 * declared inside it and the usual size and scoping rules cannot apply. */
// oxlint-disable no-inner-declarations, max-statements, max-lines-per-function, unicorn/consistent-function-scoping
import type { DetectedStatsigKeys } from '../lib/projects'
import type { StatsigInstance, WindowWithStatsig } from '../types/statsig'

/**
 * Reads the Statsig state of the page. Injected verbatim by `scripting.executeScript`, which
 * serializes this function on its own: every helper it uses has to live inside it, imports and
 * module-level values are not available in the page.
 */
export const getUserDetailsFromPage = () => {
  try {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const win = globalThis as unknown as WindowWithStatsig
    const CLIENT_KEY_PREFIX = 'client-'
    const CACHED_EVALUATIONS_PREFIX = 'statsig.cached.evaluations.'

    function isRecord(value: unknown): value is Record<string, unknown> {
      return typeof value === 'object' && value !== null
    }

    /** Statsig's DJB2 variant. Kept in sync with `src/lib/djb2.ts`, which cannot be imported here. */
    function hashName(value: string) {
      let hash = 0
      for (let index = 0; index < value.length; index++) {
        // oxlint-disable-next-line unicorn/prefer-code-point -- Statsig hashes UTF-16 code units
        hash = (hash << 5) - hash + value.charCodeAt(index)
        // oxlint-disable-next-line unicorn/prefer-math-trunc -- wraps to int32, which Math.trunc does not
        hash |= 0
      }
      return String(hash >>> 0)
    }

    function collectSdkKeys(context: Record<string, unknown> | undefined) {
      const keys = new Set<string>()

      // Every instance map is keyed by the client SDK key that created it.
      for (const instances of [
        win.__STATSIG__?.instances,
        win.__STATSIG__?.srInstances,
        win.__STATSIG__?.acInstances,
      ]) {
        for (const key of Object.keys(instances ?? {})) {
          if (key.startsWith(CLIENT_KEY_PREFIX)) {
            keys.add(key)
          }
        }
      }

      const contextKey = context?.sdkKey
      if (typeof contextKey === 'string' && contextKey.startsWith(CLIENT_KEY_PREFIX)) {
        keys.add(contextKey)
      }

      return [...keys]
    }

    /** Evaluation payloads cached by the SDK, the only source left on bootstrapped pages. */
    function readCachedPayloads() {
      const payloads: Record<string, unknown>[] = []

      try {
        for (let index = 0; index < globalThis.localStorage.length; index++) {
          const key = globalThis.localStorage.key(index)
          if (key?.startsWith(CACHED_EVALUATIONS_PREFIX)) {
            const entry: unknown = JSON.parse(globalThis.localStorage.getItem(key) ?? 'null')
            const data: unknown = isRecord(entry) && typeof entry.data === 'string' ? JSON.parse(entry.data) : undefined
            if (isRecord(data)) {
              payloads.push(data)
            }
          }
        }
      } catch {
        // Storage unavailable or malformed entry: keep whatever was collected
      }

      return payloads
    }

    function collectPayloadKeys(payloads: Record<string, unknown>[]) {
      const hashedSdkKeys = new Set<string>()
      const gateHashes = new Set<string>()

      for (const payload of payloads) {
        if (typeof payload.hashed_sdk_key_used === 'string') {
          hashedSdkKeys.add(payload.hashed_sdk_key_used)
        }

        const gates = payload.feature_gates
        const hashUsed = payload.hash_used
        // Unhashed payloads expose plain gate names, so hash them to compare against the Console API.
        if (isRecord(gates) && (hashUsed === 'djb2' || hashUsed === 'none')) {
          for (const gate of Object.keys(gates)) {
            gateHashes.add(hashUsed === 'none' ? hashName(gate) : gate)
          }
        }
      }

      return { gateHashes: [...gateHashes], hashedSdkKeys: [...hashedSdkKeys] }
    }

    function collectKeys(context: Record<string, unknown> | undefined): DetectedStatsigKeys | undefined {
      const values = isRecord(context?.values) ? context.values : undefined
      const { gateHashes, hashedSdkKeys } = collectPayloadKeys([...(values ? [values] : []), ...readCachedPayloads()])
      const sdkKeys = collectSdkKeys(context)

      if (sdkKeys.length === 0 && hashedSdkKeys.length === 0 && gateHashes.length === 0) {
        return undefined
      }

      return { gateHashes, hashedSdkKeys, sdkKeys }
    }

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
      return null
    }

    const user = getUser(instance) ?? {}
    const stableID = getStableID(instance)

    if (stableID) {
      user.stableID = stableID
    }

    const context = typeof instance.getContext === 'function' ? instance.getContext() : undefined
    const keys = collectKeys(context)

    return {
      context,
      ...(keys && { keys }),
      user,
    }
  } catch {
    // Ignore errors to prevent crashing the extension
  }

  return null
}
