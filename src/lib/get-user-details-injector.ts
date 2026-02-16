interface StatsigInstance {
  _user?: Record<string, unknown>
  identity?: {
    user: Record<string, unknown>
    stableID?: string
  }
  _stableID?: string
  getStableID?: () => string
  getContext?: () => { stableID?: string }
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

const getStatsigInstance = (win: WindowWithStatsig) => {
  // Check for monorepo/multiple instance structure first
  if (win.__STATSIG__?.instances) {
    const { instances } = win.__STATSIG__
    const [firstKey] = Object.keys(instances)
    if (firstKey) {
      // Prefer the first instance found
      return { instance: instances[firstKey], isJsMonoClient: true }
    }
  }

  // Fallback to legacy single instance SDKs
  let instance = win.__STATSIG_JS_SDK__?.instance
  instance ??= win.__STATSIG_SDK__?.instance

  if (instance) {
    return { instance, isJsMonoClient: false }
  }
}

const mergeCustomParams = (
  user: Record<string, unknown>,
  instanceUser: Record<string, unknown>,
) => {
  const custom = instanceUser.custom as Record<string, unknown> | undefined
  if (custom) {
    user.custom = {
      ...(user.custom as Record<string, unknown>),
      ...custom,
    }
  }
}

const mergeTopLevelProperties = (
  user: Record<string, unknown>,
  instanceUser: Record<string, unknown>,
) => {
  for (const [key, value] of Object.entries(instanceUser)) {
    // Only add if not already present or if current value is empty/null
    if (!(key in user) || user[key] === undefined || user[key] === null) {
      user[key] = value
    }
  }
}

const enrichUserFromGlobal = (user: Record<string, unknown>, win: WindowWithStatsig) => {
  // Try to enrich with data from __STATSIG__ global if available
  if (!win.__STATSIG__?.instances) {
    return
  }

  const { instances } = win.__STATSIG__
  const [firstKey] = Object.keys(instances)
  if (!firstKey) {
    return
  }

  const instanceData = instances[firstKey]

  if (instanceData._user) {
    mergeCustomParams(user, instanceData._user)
    mergeTopLevelProperties(user, instanceData._user)
  }
}

const getStableIDFromMethod = (instance: StatsigInstance): string | undefined => {
  if (typeof instance.getStableID === 'function') {
    return instance.getStableID()
  }
}

const getStableIDFromContext = (instance: StatsigInstance): string | undefined => {
  if (typeof instance.getContext === 'function') {
    return instance.getContext()?.stableID
  }
}

const extractStableID = (instance: StatsigInstance): string | undefined => {
  const fromMethod = getStableIDFromMethod(instance)
  if (fromMethod) {
    return fromMethod
  }

  const fromContext = getStableIDFromContext(instance)
  if (fromContext) {
    return fromContext
  }

  return instance._stableID || instance.identity?.stableID
}

const getInitialUser = (instance: StatsigInstance, isJsMonoClient: boolean) => {
  if (isJsMonoClient && instance._user) {
    return { ...instance._user }
  }
  if (instance.identity?.user) {
    return { ...instance.identity.user }
  }
  return {}
}

const assembleUser = (
  instance: StatsigInstance,
  isJsMonoClient: boolean,
  win: WindowWithStatsig,
) => {
  const user = getInitialUser(instance, isJsMonoClient)
  enrichUserFromGlobal(user, win)
  const stableID = extractStableID(instance)

  if (stableID) {
    user.stableID = stableID
  }
  return user
}

export const getUserDetailsFromPage = () => {
  try {
    const theWindow = globalThis as unknown as WindowWithStatsig
    const result = getStatsigInstance(theWindow)
    if (!result?.instance) {
      return
    }

    const { instance, isJsMonoClient } = result

    return {
      user: assembleUser(instance, isJsMonoClient, theWindow),
    }
  } catch {
    // Ignore errors to prevent crashing the extension
  }
}
