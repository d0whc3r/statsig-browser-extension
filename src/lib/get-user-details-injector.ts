interface StatsigInstance {
  _user?: unknown
  identity: {
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

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getFromInstances = (win: WindowWithStatsig) => {
      if (!win.__STATSIG__?.instances) {
        return
      }

      const { instances } = win.__STATSIG__
      const keys = Object.keys(instances)

      if (keys.length === 1) {
        return { instance: win.__STATSIG__?.instance(), isJsMonoClient: true }
      }
      if (keys.length > 1) {
        return { instance: win.__STATSIG__?.instance(keys[0]), isJsMonoClient: true }
      }
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getStatsigInstance = (win: WindowWithStatsig) => {
      let instance = win.__STATSIG_JS_SDK__?.instance
      instance ??= win.__STATSIG_SDK__?.instance

      const fromInstances = getFromInstances(win)
      if (!instance && fromInstances) {
        return fromInstances
      }

      return { instance, isJsMonoClient: false }
    }

    const { instance, isJsMonoClient } = getStatsigInstance(theWindow)

    if (!instance) {
      return
    }

    const user = isJsMonoClient ? instance._user : instance.identity.user

    return {
      user,
    }
  } catch {
    // Ignore
  }
}
