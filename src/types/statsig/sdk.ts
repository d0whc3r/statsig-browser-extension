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

export interface StatsigGlobal {
  instance?: StatsigInstance
  instances?: Record<string, StatsigInstance>
}

export interface WindowWithStatsig extends Window {
  statsig?: StatsigInstance
  __STATSIG_JS_SDK__?: StatsigGlobal
  __STATSIG_SDK__?: StatsigGlobal
  __STATSIG__?: {
    instances?: Record<string, StatsigInstance>
    instance: (key?: string) => StatsigInstance
    firstInstance?: StatsigInstance
    firstInterface?: StatsigInstance | (() => StatsigInstance)
  }
}
