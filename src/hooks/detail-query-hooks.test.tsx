import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHookWithProviders } from '@/src/tests/utils/TestUtils'

import { useDynamicConfig } from './use-dynamic-config'
import { useDynamicConfigRules } from './use-dynamic-config-rules'
import { useExperiment } from './use-experiment'
import { useFeatureGate } from './use-feature-gate'
import { useFeatureGateRules } from './use-feature-gate-rules'
import { useGateOverrides } from './use-gate-overrides'
import { useOverrides } from './use-overrides'

const { fetcherMock } = vi.hoisted(() => ({ fetcherMock: vi.fn() }))

vi.mock('@/src/lib/fetcher', () => ({ fetcher: fetcherMock }))

const ID = 'entity_1'

/** Single-entity hooks: id gating, `{ data }` envelope unwrapping, error wrapping. */
const ENTITY_HOOKS = [
  { hook: useFeatureGate, name: 'useFeatureGate', path: `/gates/${ID}` },
  { hook: useDynamicConfig, name: 'useDynamicConfig', path: `/dynamic_configs/${ID}` },
  { hook: useExperiment, name: 'useExperiment', path: `/experiments/${ID}` },
  { hook: useGateOverrides, name: 'useGateOverrides', path: `/gates/${ID}/overrides` },
] as const

describe.each(ENTITY_HOOKS)('$name', ({ hook, path }) => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('stays idle when no id is provided', () => {
    const { result } = renderHookWithProviders(() => hook())

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('unwraps the entity from the response envelope', async () => {
    const entity = { id: ID, name: 'Entity One' }
    fetcherMock.mockResolvedValue({ data: entity })

    const { result } = renderHookWithProviders(() => hook(ID))
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(entity)
    expect(fetcherMock).toHaveBeenCalledWith(path)
  })

  it('wraps fetcher errors and keeps the original as cause', async () => {
    const originalError = new Error('Forbidden')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderHookWithProviders(() => hook(ID))
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect(result.current.error?.message).toBe('Forbidden')
    expect(result.current.error?.cause).toBe(originalError)
  })
})

/**
 * Rules hooks: same shape, but the payload is `{ data: [{ rules }] }` and every
 * missing branch has to collapse to an empty array rather than undefined.
 */
const RULES_HOOKS = [
  { hook: useFeatureGateRules, name: 'useFeatureGateRules', path: `/gates/${ID}/rules` },
  { hook: useDynamicConfigRules, name: 'useDynamicConfigRules', path: `/dynamic_configs/${ID}/rules` },
] as const

const EMPTY_RESPONSES: [string, unknown][] = [
  ['the data array is empty', { data: [], message: 'ok' }],
  ['the response carries no data key', { message: 'no data' }],
]

describe.each(RULES_HOOKS)('$name', ({ hook, path }) => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('stays idle when no id is provided', () => {
    const { result } = renderHookWithProviders(() => hook(''))

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetcherMock).not.toHaveBeenCalled()
  })

  it('returns the rules of the first data entry', async () => {
    const rules = [{ id: 'rule_1', name: 'Rule 1' }]
    fetcherMock.mockResolvedValue({ data: [{ rules }], message: 'ok' })

    const { result } = renderHookWithProviders(() => hook(ID))
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual(rules)
    expect(fetcherMock).toHaveBeenCalledWith(path)
  })

  it.each(EMPTY_RESPONSES)('returns an empty array when %s', async (_label, response) => {
    fetcherMock.mockResolvedValue(response)

    const { result } = renderHookWithProviders(() => hook(ID))
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual([])
  })

  it('wraps fetcher errors and keeps the original as cause', async () => {
    const originalError = new Error('Boom')
    fetcherMock.mockRejectedValue(originalError)

    const { result } = renderHookWithProviders(() => hook(ID))
    await waitFor(() => {
      expect(result.current.isError).toBeTruthy()
    })

    expect(result.current.error?.message).toBe('Boom')
    expect(result.current.error?.cause).toBe(originalError)
  })
})

/**
 * `useOverrides` shares the envelope shape above but reshapes the payload, so only the
 * transform is asserted here.
 */
describe('useOverrides', () => {
  beforeEach(() => {
    fetcherMock.mockReset()
  })

  it('drops userID overrides that carry no ids', async () => {
    const gateOverride = { groupID: 'A', name: 'gate_a', type: 'gate' }
    const withIds = { environment: 'Production', groupID: 'Test', ids: ['u1'], unitType: 'userID' }
    fetcherMock.mockResolvedValue({
      data: {
        overrides: [gateOverride],
        userIDOverrides: [withIds, { environment: 'Staging', groupID: 'Control', ids: [], unitType: 'userID' }],
      },
    })

    const { result } = renderHookWithProviders(() => useOverrides(ID))
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy()
    })

    expect(result.current.data).toStrictEqual({ overrides: [gateOverride], userIDOverrides: [withIds] })
    expect(fetcherMock).toHaveBeenCalledWith(`/experiments/${ID}/overrides`)
  })
})
