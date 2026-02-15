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
