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
