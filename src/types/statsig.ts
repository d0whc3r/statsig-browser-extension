export interface StatsigUser {
  name?: string
  userID?: string
  statsigEnvironment?: {
    tier?: string
  }
  custom?: Record<string, unknown>
  privateAttributes?: Record<string, unknown>
  email?: string
  ip?: string
  userAgent?: string
  country?: string
  locale?: string
  [key: string]: unknown
}

export interface PaginatedResponse<ItemType> {
  data: ItemType[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

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
}

export interface Metric {
  name: string
  type: string
  tags?: string[]
}

export interface ExperimentOverride {
  type: 'gate' | 'segment'
  name: string
  groupID: string
}

export interface UserIDOverride {
  ids: string[]
  groupID: string
}

export interface ExperimentOverridesResponse {
  overrides: ExperimentOverride[]
  userIDOverrides: UserIDOverride[]
}

export interface DynamicConfig {
  createdTime: number
  creatorName: string
  defaultValue: Record<string, unknown> // JSON Object
  defaultValueJson5?: string
  description: string
  id: string
  isEnabled: boolean
  lastModifiedTime: number
  lastModifierName: string
  lastModifierEmail?: string | null
  name: string
  tags: string[]
  idType?: string
  lastModifierID?: string
  creatorID?: string
  creatorEmail?: string
  targetApps?: string[]
  holdoutIDs?: string[]
  team?: string
  version?: number
  rules?: DynamicConfigRule[]
  schema?: string
  schemaJson5?: string
}

export interface FeatureGate {
  id: string
  name: string
  description: string
  idType: string
  lastModifierID: string
  lastModifiedTime: number
  lastModifierName: string
  lastModifierEmail: string | null
  creatorID: string
  createdTime: number
  creatorName: string
  creatorEmail: string | null
  targetApps: string[]
  holdoutIDs: string[]
  tags: string[]
  isEnabled: boolean
  status: string
  rules: FeatureGateRule[]
  checksPerHour: number
  type: string
  typeReason: string
  team: string | null
  reviewSettings: {
    requiredReview: boolean
    allowedReviewers: string[]
  }
  measureMetricLifts: boolean
  owner: {
    ownerID: string
    ownerName: string
    ownerType: string
    ownerEmail: string
  }
  monitoringMetrics: unknown[]
  version?: number
}

export interface FeatureGateRule {
  id: string
  baseID: string
  name: string
  passPercentage: number
  conditions: {
    type: string
  }[]
  environments: string[]
}

export interface DynamicConfigRule {
  id: string
  name: string
  groupName: string
  passPercentage: number
  conditions: {
    type: string
    operator?: string
    targetValue?: unknown
    field?: string
    customID?: string
  }[]
  environments: string[]
  returnValue: Record<string, unknown>
  baseID?: string
  completedAutomatedRollouts?: unknown[]
  pendingAutomatedRollouts?: unknown[]
}

export interface DynamicConfigOverride {
  returnValue: Record<string, unknown>
  ids: string[]
  environment?: string
}

export interface GateOverride {
  passingUserIDs: string[]
  failingUserIDs: string[]
  passingCustomIDs?: string[]
  failingCustomIDs?: string[]
  environmentOverrides: {
    environment: string | null
    unitID: string | null
    passingIDs: string[]
    failingIDs: string[]
  }[]
}

export interface HealthCheck {
  description: string
  name: string
  status: 'PASSED' | 'WAITING'
}

export interface Group {
  id: string
  name: string
  parameterValues: ParameterValue
  size: number
}

type ParameterValue = Record<string, boolean | number | string>

export interface AuditLog {
  id: string
  name: string
  changeLog: string
  actionType: string
  date: string
  time: string
  updatedBy: string
  updatedByUserID: string
  modifierEmail: string
  changes?: {
    rules?: {
      new: unknown[]
      old: unknown[]
    }
  }
  tags: string[]
  targetAppIDs: string[]
}
