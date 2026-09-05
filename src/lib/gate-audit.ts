import type { FeatureGate, FeatureGateRule } from '@/src/types/statsig'

/** Ordered by how strongly the signal suggests the gate can be removed. */
export const GATE_ISSUE_KEYS = [
  'always_on',
  'always_off',
  'no_traffic',
  'frozen',
  'aging_temporary',
  'dev_only',
  'twin_gates',
  'duplicate_rules',
  'orphan',
  'no_metadata',
] as const

export type GateIssueKey = (typeof GATE_ISSUE_KEYS)[number]

interface GateIssue {
  detail: string
  key: GateIssueKey
}

export interface GateFinding {
  gate: FeatureGate
  issues: GateIssue[]
}

export const GATE_ISSUE_LABELS: Record<GateIssueKey, string> = {
  aging_temporary: 'Aging temporary',
  always_off: 'Always off',
  always_on: 'Always on',
  dev_only: 'Never left dev',
  duplicate_rules: 'Duplicate rules',
  frozen: 'Frozen',
  no_metadata: 'No metadata',
  no_traffic: 'No traffic',
  orphan: 'Orphan',
  twin_gates: 'Twin gate',
}

export const GATE_ISSUE_DESCRIPTIONS: Record<GateIssueKey, string> = {
  aging_temporary: 'Marked as a temporary gate but has been around for a long time.',
  always_off: 'Nothing can pass this gate, so every caller takes the same branch.',
  always_on: 'Everyone passes in every environment, so the gate no longer branches anything.',
  dev_only: 'No rule targets production, so the gate never shipped.',
  duplicate_rules: 'The same conditions appear in more than one rule of this gate.',
  frozen: 'Nobody has touched this gate in a long time.',
  no_metadata: 'No description and no tags, so nobody can tell what it is for.',
  no_traffic: 'Statsig reports zero checks per hour for this gate.',
  orphan: 'No owner and no team, so nobody is accountable for it.',
  twin_gates: 'Another gate evaluates exactly the same rules.',
}

const DAY_MS = 86_400_000
const FULL_PASS = 100
const PRODUCTION_PATTERN = /^prod/iu

interface AuditContext {
  environments: string[]
  hasProductionEnvironment: boolean
  now: number
  thresholdDays: number
  twinsByGateId: Map<string, string[]>
}

const gateRules = (gate: FeatureGate): FeatureGateRule[] => gate.rules ?? []

const ruleEnvironments = (rule: FeatureGateRule): string[] => rule.environments ?? []

/** An empty `environments` array means "every environment" in the Statsig console. */
const coversAllEnvironments = (rule: FeatureGateRule, environments: readonly string[]): boolean => {
  const targeted = ruleEnvironments(rule)
  return targeted.length === 0 || environments.every((environment) => targeted.includes(environment))
}

const isUnconditional = (rule: FeatureGateRule): boolean =>
  rule.conditions.length === 0 || rule.conditions.every((condition) => condition.type === 'public')

const ageInDays = (timestamp: number, now: number): number => Math.floor((now - timestamp) / DAY_MS)

const conditionFingerprint = (condition: FeatureGateRule['conditions'][number]): string =>
  [
    condition.type,
    condition.operator ?? '',
    condition.field ?? '',
    condition.customID ?? '',
    JSON.stringify(condition.targetValue ?? null),
  ].join('|')

const ruleFingerprint = (rule: FeatureGateRule): string =>
  JSON.stringify([
    rule.passPercentage,
    ruleEnvironments(rule).toSorted(),
    rule.conditions.map((condition) => conditionFingerprint(condition)).toSorted(),
  ])

const gateFingerprint = (gate: FeatureGate): string =>
  JSON.stringify(
    gateRules(gate)
      .map((rule) => ruleFingerprint(rule))
      .toSorted(),
  )

const groupByFingerprint = (gates: readonly FeatureGate[]): Map<string, FeatureGate[]> => {
  const groups = new Map<string, FeatureGate[]>()
  for (const gate of gates.filter((candidate) => gateRules(candidate).length > 0)) {
    const fingerprint = gateFingerprint(gate)
    groups.set(fingerprint, [...(groups.get(fingerprint) ?? []), gate])
  }

  return groups
}

/** Maps every gate that shares its exact rule set with another gate to those other gates' names. */
const buildTwins = (gates: readonly FeatureGate[]): Map<string, string[]> => {
  const twins = new Map<string, string[]>()
  for (const group of groupByFingerprint(gates).values()) {
    for (const gate of group.length > 1 ? group : []) {
      twins.set(
        gate.id,
        group.filter((other) => other.id !== gate.id).map((other) => other.name),
      )
    }
  }

  return twins
}

const buildContext = (gates: readonly FeatureGate[], thresholdDays: number): AuditContext => {
  const environments = [...new Set(gates.flatMap((gate) => gateRules(gate).flatMap((rule) => ruleEnvironments(rule))))]

  return {
    environments,
    hasProductionEnvironment: environments.some((environment) => PRODUCTION_PATTERN.test(environment)),
    now: Date.now(),
    thresholdDays,
    twinsByGateId: buildTwins(gates),
  }
}

type IssueCheck = (gate: FeatureGate, context: AuditContext) => GateIssue | null

const alwaysOn: IssueCheck = (gate, context) => {
  if (!gate.isEnabled) {
    return null
  }
  const rule = gateRules(gate).find(
    (candidate) =>
      candidate.passPercentage === FULL_PASS &&
      isUnconditional(candidate) &&
      coversAllEnvironments(candidate, context.environments),
  )

  return rule ? { detail: `Rule "${rule.name}" passes everyone at 100% in every environment`, key: 'always_on' } : null
}

const alwaysOff: IssueCheck = (gate) => {
  if (!gate.isEnabled) {
    return { detail: 'Disabled, so it always evaluates to false', key: 'always_off' }
  }
  const rules = gateRules(gate)
  if (rules.length === 0) {
    return { detail: 'Enabled but has no rules, so it always evaluates to false', key: 'always_off' }
  }

  return rules.every((rule) => rule.passPercentage === 0)
    ? { detail: 'Every rule passes 0% of users', key: 'always_off' }
    : null
}

const noTraffic: IssueCheck = (gate) =>
  gate.checksPerHour === 0 ? { detail: 'Statsig reports 0 checks per hour', key: 'no_traffic' } : null

const frozen: IssueCheck = (gate, context) => {
  const days = ageInDays(gate.lastModifiedTime, context.now)
  return days >= context.thresholdDays ? { detail: `Not modified in ${days} days`, key: 'frozen' } : null
}

const agingTemporary: IssueCheck = (gate, context) => {
  if (gate.type !== 'TEMPORARY') {
    return null
  }
  const days = ageInDays(gate.createdTime, context.now)

  return days >= context.thresholdDays
    ? { detail: `Temporary gate created ${days} days ago`, key: 'aging_temporary' }
    : null
}

const devOnly: IssueCheck = (gate, context) => {
  const rules = gateRules(gate)
  // Without a production environment in the project there is nothing to compare against.
  if (!context.hasProductionEnvironment || rules.length === 0) {
    return null
  }
  // A rule with no environments applies everywhere, which includes production.
  if (rules.some((rule) => ruleEnvironments(rule).length === 0)) {
    return null
  }
  const targeted = [...new Set(rules.flatMap((rule) => ruleEnvironments(rule)))]

  return targeted.some((environment) => PRODUCTION_PATTERN.test(environment))
    ? null
    : { detail: `Rules only target ${targeted.join(', ')}`, key: 'dev_only' }
}

const twinGates: IssueCheck = (gate, context) => {
  const twins = context.twinsByGateId.get(gate.id)
  return twins?.length ? { detail: `Same rules as ${twins.join(', ')}`, key: 'twin_gates' } : null
}

const duplicateRules: IssueCheck = (gate) => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const rule of gateRules(gate)) {
    const fingerprint = ruleFingerprint(rule)
    if (seen.has(fingerprint)) {
      duplicates.add(rule.name)
    }
    seen.add(fingerprint)
  }

  return duplicates.size > 0
    ? { detail: `Repeated conditions in: ${[...duplicates].join(', ')}`, key: 'duplicate_rules' }
    : null
}

const orphan: IssueCheck = (gate) =>
  gate.owner?.ownerName || gate.owner?.ownerEmail || gate.team
    ? null
    : { detail: 'No owner and no team assigned', key: 'orphan' }

const noMetadata: IssueCheck = (gate) =>
  gate.description?.trim() || gate.tags?.length ? null : { detail: 'No description and no tags', key: 'no_metadata' }

const CHECKS: readonly IssueCheck[] = [
  alwaysOn,
  alwaysOff,
  noTraffic,
  frozen,
  agingTemporary,
  devOnly,
  twinGates,
  duplicateRules,
  orphan,
  noMetadata,
]

const severity = (issues: readonly GateIssue[]): number =>
  Math.min(...issues.map((issue) => GATE_ISSUE_KEYS.indexOf(issue.key)))

const compareFindings = (left: GateFinding, right: GateFinding): number =>
  right.issues.length - left.issues.length ||
  severity(left.issues) - severity(right.issues) ||
  left.gate.name.localeCompare(right.gate.name)

/**
 * Flags feature gates that look redundant: always-on/always-off, untouched, unused, duplicated, unowned.
 *
 * @param gates - Every gate loaded for the project. A partial list yields partial (and for twins, wrong) results.
 * @param thresholdDays - Age in days after which a gate counts as frozen or as an aged temporary gate.
 * @returns One finding per gate with at least one issue, most suspicious first.
 */
export const auditGates = (gates: readonly FeatureGate[], thresholdDays: number): GateFinding[] => {
  const context = buildContext(gates, thresholdDays)

  return gates
    .map((gate) => ({
      gate,
      issues: CHECKS.map((check) => check(gate, context)).filter((issue) => issue !== null),
    }))
    .filter((finding) => finding.issues.length > 0)
    .toSorted((left, right) => compareFindings(left, right))
}

export const countIssues = (findings: readonly GateFinding[]): Record<GateIssueKey, number> => {
  const counts: Record<GateIssueKey, number> = {
    aging_temporary: 0,
    always_off: 0,
    always_on: 0,
    dev_only: 0,
    duplicate_rules: 0,
    frozen: 0,
    no_metadata: 0,
    no_traffic: 0,
    orphan: 0,
    twin_gates: 0,
  }
  for (const finding of findings) {
    for (const issue of finding.issues) {
      counts[issue.key] += 1
    }
  }

  return counts
}
