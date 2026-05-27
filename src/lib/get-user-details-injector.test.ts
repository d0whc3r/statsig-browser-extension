import { afterEach, describe, expect, it, vi } from 'vitest'

import { getUserDetailsFromPage } from './get-user-details-injector'

interface StatsigGlobals {
  statsig?: unknown
  __STATSIG__?: unknown
  __STATSIG_JS_SDK__?: unknown
}

const win = globalThis as unknown as StatsigGlobals

const cleanup = () => {
  delete win.statsig
  delete win.__STATSIG__
  delete win.__STATSIG_JS_SDK__
}

describe('getUserDetailsFromPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('returns null when no statsig instance exists on the page', () => {
    expect(getUserDetailsFromPage()).toBeNull()
  })

  it('reads user via getCurrentUser when present on window.statsig', () => {
    const user = { email: 'a@b.com', userID: 'u_1' }
    win.statsig = {
      getCurrentUser: () => user,
      getStableID: () => 'stable_42',
    }

    const result = getUserDetailsFromPage()
    expect(result).toStrictEqual({
      context: undefined,
      user: { ...user, stableID: 'stable_42' },
    })
  })

  it('falls back to _user when getCurrentUser is missing', () => {
    win.statsig = {
      _user: { userID: 'u_2' },
    }

    expect(getUserDetailsFromPage()).toStrictEqual({
      context: undefined,
      user: { userID: 'u_2' },
    })
  })

  it('falls back to identity.user and identity.stableID', () => {
    win.statsig = {
      identity: { stableID: 'stable_identity', user: { userID: 'u_3' } },
    }

    expect(getUserDetailsFromPage()).toStrictEqual({
      context: undefined,
      user: { stableID: 'stable_identity', userID: 'u_3' },
    })
  })

  it('reads stableID via getContext when getStableID returns empty', () => {
    win.statsig = {
      getContext: () => ({ stableID: 'ctx_stable' }),
      getCurrentUser: () => ({ userID: 'u_4' }),
      getStableID: () => '',
    }

    const result = getUserDetailsFromPage()
    expect(result?.user).toStrictEqual({ stableID: 'ctx_stable', userID: 'u_4' })
    expect(result?.context).toStrictEqual({ stableID: 'ctx_stable' })
  })

  it('uses __STATSIG__.firstInstance context as stableID fallback', () => {
    win.statsig = {
      // No stableID anywhere on this instance.
      getCurrentUser: () => ({ userID: 'u_5' }),
    }
    win.__STATSIG__ = {
      firstInstance: {
        getContext: () => ({ stableID: 'first_instance_stable' }),
      },
      instance: () => ({}),
    }

    const result = getUserDetailsFromPage()
    expect(result?.user).toStrictEqual({ stableID: 'first_instance_stable', userID: 'u_5' })
  })

  it('prefers __STATSIG__ instances when window.statsig is absent', () => {
    win.__STATSIG__ = {
      instance: () => ({}),
      instances: {
        'client-1': {
          _stableID: 'react_stable',
          _user: { userID: 'u_react' },
        },
      },
    }

    expect(getUserDetailsFromPage()).toStrictEqual({
      context: undefined,
      user: { stableID: 'react_stable', userID: 'u_react' },
    })
  })

  it('falls back to __STATSIG__.firstInstance when instances map is empty', () => {
    win.__STATSIG__ = {
      firstInstance: {
        _user: { userID: 'u_first' },
      },
      instance: () => ({}),
      instances: {},
    }

    expect(getUserDetailsFromPage()?.user).toStrictEqual({ userID: 'u_first' })
  })

  it('reads from __STATSIG_JS_SDK__ when other globals are missing', () => {
    win.__STATSIG_JS_SDK__ = {
      instance: {
        _user: { userID: 'u_js' },
      },
    }

    expect(getUserDetailsFromPage()?.user).toStrictEqual({ userID: 'u_js' })
  })

  it('returns an empty user object when getCurrentUser yields null but identity exists', () => {
    win.statsig = {
      _stableID: 'only_stable',
      identity: { user: {} },
    }

    expect(getUserDetailsFromPage()).toStrictEqual({
      context: undefined,
      user: { stableID: 'only_stable' },
    })
  })

  it('ignores window.statsig that lacks recognizable user fields', () => {
    win.statsig = {
      _stableID: 'unused',
    }

    expect(getUserDetailsFromPage()).toBeNull()
  })

  it('returns null when an exception is thrown during detection', () => {
    win.statsig = {
      get getCurrentUser() {
        throw new Error('boom')
      },
    }

    // Silence the catch — function swallows errors.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(getUserDetailsFromPage()).toBeNull()
    spy.mockRestore()
  })
})
