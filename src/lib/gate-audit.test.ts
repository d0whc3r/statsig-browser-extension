import { describe, expect, it } from 'vitest'

import type { FeatureGate, FeatureGateRule } from '@/src/types/statsig'

import { makeFeatureGate } from '@/src/tests/fixtures/statsig'

import type { GateIssueKey } from './gate-audit'

import { auditGates, countIssues } from './gate-audit'

const DAY_MS = 86_400_000

const daysAgo = (days: number) => Date.now() - days * DAY_MS

const makeRule = (overrides: Partial<FeatureGateRule> = {}): FeatureGateRule => ({
  baseID: 'base-1',
  conditions: [{ type: 'public' }],
  environments: ['production'],
  id: 'rule-1',
  name: 'Everyone',
  passPercentage: 50,
  ...overrides,
})

/** A gate that trips no check, so each test only turns on the signal it is about. */
const healthyGate = (overrides: Partial<FeatureGate> = {}): FeatureGate =>
  makeFeatureGate({
    checksPerHour: 100,
    createdTime: daysAgo(1),
    description: 'A healthy gate',
    lastModifiedTime: daysAgo(1),
    rules: [makeRule()],
    tags: ['core'],
    ...overrides,
  })

const issuesOf = (gates: FeatureGate[], thresholdDays = 7, gateId = 'gate-1'): GateIssueKey[] =>
  auditGates(gates, thresholdDays)
    .find((finding) => finding.gate.id === gateId)
    ?.issues.map((issue) => issue.key) ?? []

describe('auditGates', () => {
  it('reports nothing for a healthy gate', () => {
    expect(auditGates([healthyGate()], 7)).toStrictEqual([])
  })

  it('flags a gate that passes everyone at 100% in every environment', () => {
    const gate = healthyGate({ rules: [makeRule({ environments: [], passPercentage: 100 })] })

    expect(issuesOf([gate])).toContain('always_on')
  })

  it('does not flag always_on when the 100% rule misses an environment used elsewhere', () => {
    const gate = healthyGate({ rules: [makeRule({ environments: ['production'], passPercentage: 100 })] })
    const other = healthyGate({ id: 'gate-2', rules: [makeRule({ environments: ['development'] })] })

    expect(issuesOf([gate, other])).not.toContain('always_on')
  })

  it('does not flag always_on when the rule has real conditions', () => {
    const rule = makeRule({ conditions: [{ type: 'email' }], environments: [], passPercentage: 100 })

    expect(issuesOf([healthyGate({ rules: [rule] })])).not.toContain('always_on')
  })

  it('flags disabled gates, ruleless gates and all-zero gates as always_off', () => {
    const disabled = healthyGate({ isEnabled: false })
    const ruleless = healthyGate({ rules: [] })
    const allZero = healthyGate({ rules: [makeRule({ passPercentage: 0 })] })

    expect(issuesOf([disabled])).toContain('always_off')
    expect(issuesOf([ruleless])).toContain('always_off')
    expect(issuesOf([allZero])).toContain('always_off')
  })

  it('flags gates without traffic', () => {
    expect(issuesOf([healthyGate({ checksPerHour: 0 })])).toContain('no_traffic')
  })

  it('flags gates older than the threshold and respects the threshold', () => {
    const gate = healthyGate({ lastModifiedTime: daysAgo(10) })

    expect(issuesOf([gate], 7)).toContain('frozen')
    expect(issuesOf([gate], 30)).not.toContain('frozen')
  })

  it('flags temporary gates that outlived the threshold', () => {
    const createdTime = daysAgo(60)
    const gate = healthyGate({ createdTime, type: 'TEMPORARY' })
    const permanent = healthyGate({ createdTime })

    expect(issuesOf([gate], 30)).toContain('aging_temporary')
    expect(issuesOf([permanent], 30)).not.toContain('aging_temporary')
  })

  it('flags gates whose rules never target production', () => {
    const gate = healthyGate({ rules: [makeRule({ environments: ['development'] })] })
    const production = healthyGate({ id: 'gate-2' })

    expect(issuesOf([gate, production])).toContain('dev_only')
  })

  it('does not flag dev_only when the project has no production environment', () => {
    const gate = healthyGate({ rules: [makeRule({ environments: ['development'] })] })

    expect(issuesOf([gate])).not.toContain('dev_only')
  })

  it('flags two gates that share the exact same rules', () => {
    const gates = [healthyGate(), healthyGate({ id: 'gate-2', name: 'gate_2' })]
    const finding = auditGates(gates, 7).find((item) => item.gate.id === 'gate-1')

    expect(finding?.issues.find((issue) => issue.key === 'twin_gates')?.detail).toBe('Same rules as gate_2')
  })

  it('flags repeated rules inside one gate', () => {
    const gate = healthyGate({ rules: [makeRule(), makeRule({ id: 'rule-2', name: 'Everyone again' })] })

    expect(issuesOf([gate])).toContain('duplicate_rules')
  })

  it('flags gates with no owner and no team, and gates with no description or tags', () => {
    const orphan = healthyGate({ owner: undefined as never, team: null })
    const bare = healthyGate({ description: '   ', tags: [] })

    expect(issuesOf([orphan])).toContain('orphan')
    expect(issuesOf([bare])).toContain('no_metadata')
  })

  it('sorts the gate with the most issues first', () => {
    const worst = healthyGate({ checksPerHour: 0, id: 'gate-worst', lastModifiedTime: daysAgo(90), tags: [] })
    const findings = auditGates([healthyGate({ checksPerHour: 0 }), worst], 7)

    expect(findings[0]?.gate.id).toBe('gate-worst')
  })
})

describe('countIssues', () => {
  it('counts each issue across every finding', () => {
    const gate = healthyGate({ checksPerHour: 0, lastModifiedTime: daysAgo(90) })
    const counts = countIssues(auditGates([gate], 7))

    expect(counts.no_traffic).toBe(1)
    expect(counts.frozen).toBe(1)
    expect(counts.always_on).toBe(0)
  })
})
