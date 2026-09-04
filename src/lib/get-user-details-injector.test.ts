import { afterEach, describe, expect, it, vi } from 'vitest'

import { djb2 } from './djb2'
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
      keys: { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-1'] },
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

describe('getUserDetailsFromPage key detection', () => {
  afterEach(() => {
    cleanup()
    globalThis.localStorage.clear()
  })

  it('collects the client SDK key from every instance map and from the context', () => {
    win.__STATSIG__ = {
      acInstances: { 'client-autocapture': {} },
      instance: () => ({}),
      instances: {
        'client-main': {
          _user: { userID: 'u_1' },
          getContext: () => ({ sdkKey: 'client-context', values: {} }),
        },
      },
      srInstances: { 'client-replay': {} },
    }

    expect(getUserDetailsFromPage()?.keys).toStrictEqual({
      gateHashes: [],
      hashedSdkKeys: [],
      sdkKeys: ['client-main', 'client-replay', 'client-autocapture', 'client-context'],
    })
  })

  it('ignores instance keys that are not client SDK keys', () => {
    win.__STATSIG__ = {
      instance: () => ({}),
      instances: { 'not-a-key': { _user: { userID: 'u_1' } } },
    }

    expect(getUserDetailsFromPage()?.keys).toBeUndefined()
  })

  it('reads the hashed SDK key and the gate hashes from the evaluation payload', () => {
    win.statsig = {
      _user: { userID: 'u_1' },
      getContext: () => ({
        sdkKey: 'client-main',
        values: {
          feature_gates: { '111': {}, '222': {} },
          hash_used: 'djb2',
          hashed_sdk_key_used: '2447027979',
        },
      }),
    }

    expect(getUserDetailsFromPage()?.keys).toStrictEqual({
      gateHashes: ['111', '222'],
      hashedSdkKeys: ['2447027979'],
      sdkKeys: ['client-main'],
    })
  })

  it('hashes plain gate names when the payload is not hashed', () => {
    win.statsig = {
      _user: { userID: 'u_1' },
      getContext: () => ({
        values: { feature_gates: { a_gate: {} }, hash_used: 'none' },
      }),
    }

    expect(getUserDetailsFromPage()?.keys?.gateHashes).toStrictEqual([djb2('a_gate')])
  })

  it('skips gate hashes the Console API cannot reproduce', () => {
    win.statsig = {
      _user: { userID: 'u_1' },
      getContext: () => ({
        values: { feature_gates: { abc: {} }, hash_used: 'sha256', hashed_sdk_key_used: '123' },
      }),
    }

    expect(getUserDetailsFromPage()?.keys).toStrictEqual({
      gateHashes: [],
      hashedSdkKeys: ['123'],
      sdkKeys: [],
    })
  })

  it('falls back to the cached evaluations of a bootstrapped page', () => {
    globalThis.localStorage.setItem(
      'statsig.cached.evaluations.123',
      JSON.stringify({
        data: JSON.stringify({ feature_gates: { '999': {} }, hash_used: 'djb2', hashed_sdk_key_used: '2414204405' }),
      }),
    )
    win.statsig = { _user: { userID: 'u_1' } }

    expect(getUserDetailsFromPage()?.keys).toStrictEqual({
      gateHashes: ['999'],
      hashedSdkKeys: ['2414204405'],
      sdkKeys: [],
    })
  })

  it('ignores unrelated or malformed storage entries', () => {
    globalThis.localStorage.setItem('unrelated', 'value')
    globalThis.localStorage.setItem('statsig.cached.evaluations.1', 'not json')
    globalThis.localStorage.setItem('statsig.cached.evaluations.2', JSON.stringify({ data: 42 }))
    win.statsig = { _user: { userID: 'u_1' } }

    expect(getUserDetailsFromPage()?.keys).toBeUndefined()
  })
})
