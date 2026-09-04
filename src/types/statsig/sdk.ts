export interface StatsigInstance {
  _user?: Record<string, unknown>
  identity?: {
    user: Record<string, unknown>
    stableID?: string
  }
  _stableID?: string
  getStableID?: () => string
  getContext?: () => Record<string, unknown>
  getCurrentUser?: () => Record<string, unknown>
}

interface StatsigGlobal {
  instance?: StatsigInstance
  instances?: Record<string, StatsigInstance>
}

export interface WindowWithStatsig extends Window {
  statsig?: StatsigInstance
  __STATSIG_JS_SDK__?: StatsigGlobal
  __STATSIG_SDK__?: StatsigGlobal
  __STATSIG__?: {
    instances?: Record<string, StatsigInstance>
    /** Session replay instances, also keyed by client SDK key. */
    srInstances?: Record<string, unknown>
    /** Auto capture instances, also keyed by client SDK key. */
    acInstances?: Record<string, unknown>
    instance: (key?: string) => StatsigInstance
    firstInstance?: StatsigInstance
    firstInterface?: StatsigInstance | (() => StatsigInstance)
  }
}
