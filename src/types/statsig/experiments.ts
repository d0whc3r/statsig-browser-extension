import type { Group, HealthCheck, Metric } from './common'

export interface Experiment {
  allocation: number
  createdTime: number
  creatorName: string
  description: string
  endTime: number
  groups: Group[]
  healthChecks: HealthCheck[]
  hypothesis: string
  id: string
  lastModifiedTime: number
  name: string
  startTime: number
  status: string
  tags: string[]
  targetingGateID?: string
  primaryMetrics?: Metric[]
  secondaryMetrics?: Metric[]
  defaultConfidenceInterval?: string
  bonferroniCorrection?: boolean
  duration?: number
  decisionReason?: string
  owner?: {
    ownerType: string
    ownerName: string
  }
  isStale?: boolean
  idType?: string
}

export interface ExperimentOverride {
  type: 'gate' | 'segment'
  name: string
  groupID: string
}

export interface UserIDOverride {
  ids: string[]
  groupID: string
  environment?: string
  unitID?: string
}

export interface ExperimentOverridesResponse {
  overrides: ExperimentOverride[]
  userIDOverrides: UserIDOverride[]
}
