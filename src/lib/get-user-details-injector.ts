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

const getFromInstances = (theWindow: WindowWithStatsig) => {
  if (!theWindow.__STATSIG__?.instances) {
    return
  }

  const { instances } = theWindow.__STATSIG__
  const keys = Object.keys(instances)

  if (keys.length === 1) {
    return { instance: theWindow.__STATSIG__?.instance(), isJsMonoClient: true }
  }
  if (keys.length > 1) {
    return { instance: theWindow.__STATSIG__?.instance(keys[0]), isJsMonoClient: true }
  }
}

const getStatsigInstance = (theWindow: WindowWithStatsig) => {
  let instance = theWindow.__STATSIG_JS_SDK__?.instance
  if (!instance) {
    instance = theWindow.__STATSIG_SDK__?.instance
  }

  const fromInstances = getFromInstances(theWindow)
  if (!instance && fromInstances) {
    return fromInstances
  }

  return { instance, isJsMonoClient: false }
}

export const getUserDetailsFromPage = () => {
  const theWindow = globalThis as unknown as WindowWithStatsig
  const { instance, isJsMonoClient } = getStatsigInstance(theWindow)

  if (!instance) {
    return
  }

  const user = isJsMonoClient ? instance._user : instance.identity.user

  return {
    user,
  }
}
