export interface StatsigUser {
  name?: string
  userID?: string
  stableID?: string
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

export interface Metric {
  name: string
  type: string
  tags?: string[]
}

export interface HealthCheck {
  description: string
  name: string
  status: 'PASSED' | 'WAITING'
}

export type ParameterValue = Record<string, boolean | number | string>

export interface Group {
  id: string
  name: string
  parameterValues: ParameterValue
  size: number
}
