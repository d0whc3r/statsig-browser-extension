interface StatsigInstance {
  _user?: unknown
  identity?: {
    user: unknown
  }
}

interface StatsigGlobal {
  instance?: StatsigInstance
  instances?: Record<string, StatsigInstance>
}

interface WindowWithStatsig {
  __STATSIG_JS_SDK__?: StatsigGlobal
  __STATSIG_SDK__?: StatsigGlobal
  __STATSIG__?: {
    instances?: Record<string, StatsigInstance>
    instance: (key?: string) => StatsigInstance
  }
}

export const getUserDetailsFromPage = () => {
  try {
    const theWindow = globalThis as unknown as WindowWithStatsig

    const getStatsigInstance = (win: WindowWithStatsig) => {
      // Check for monorepo/multiple instance structure first
      if (win.__STATSIG__?.instances) {
        const { instances } = win.__STATSIG__
        const keys = Object.keys(instances)
        if (keys.length > 0) {
          // Prefer the first instance found
          return { instance: instances[keys[0]], isJsMonoClient: true }
        }
      }

      // Fallback to legacy single instance SDKs
      let instance = win.__STATSIG_JS_SDK__?.instance
      instance ??= win.__STATSIG_SDK__?.instance

      if (instance) {
        return { instance, isJsMonoClient: false }
      }
    }

    const result = getStatsigInstance(theWindow)
    if (!result?.instance) {
      return
    }

    const { instance, isJsMonoClient } = result

    // Extract user object safely
    let user: Record<string, unknown> = {}

    if (isJsMonoClient && instance._user) {
      user = { ...(instance._user as Record<string, unknown>) }
    } else if (instance.identity?.user) {
      user = { ...(instance.identity.user as Record<string, unknown>) }
    }

    // Try to enrich with data from __STATSIG__ global if available
    // This is useful because sometimes the instance._user might be incomplete
    // Or we want to capture the exact config passed to initialize
    if (theWindow.__STATSIG__?.instances) {
      const { instances } = theWindow.__STATSIG__
      const firstKey = Object.keys(instances)[0]
      if (firstKey) {
        const instanceData = instances[firstKey] as { _user?: Record<string, unknown> }

        if (instanceData._user) {
          // 1. Merge custom params deeply
          if (instanceData._user.custom) {
            user.custom = {
              ...(user.custom as Record<string, unknown>),
              ...(instanceData._user.custom as Record<string, unknown>),
            }
          }

          // 2. Merge other top-level properties
          for (const [key, value] of Object.entries(instanceData._user)) {
            // Only add if not already present or if current value is empty/null
            if (!(key in user) || user[key] === undefined || user[key] === null) {
              user[key] = value
            }
          }
        }
      }
    }

    // Attempt to extract stableID
    let stableID: string | undefined

    // 1. Try getStableID() method (legacy)
    if (typeof (instance as any).getStableID === 'function') {
      stableID = (instance as any).getStableID()
    }

    // 2. Try getContext().stableID (newer SDKs)
    if (!stableID && typeof (instance as any).getContext === 'function') {
      const context = (instance as any).getContext()
      if (context?.stableID) {
        ;({ stableID } = context)
      }
    }

    // 3. Try internal properties
    if (!stableID) {
      stableID = (instance as any)._stableID || (instance as any).identity?.stableID
    }

    if (stableID) {
      user.stableID = stableID
    }

    return {
      user,
    }
  } catch {
    // Ignore errors to prevent crashing the extension
  }
}
