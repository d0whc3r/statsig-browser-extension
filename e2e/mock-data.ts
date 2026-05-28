import {
  mockAuditLogs,
  mockDynamicConfigs,
  mockExperiments,
  mockFeatureGates,
  paginated,
} from '@/src/tests/fixtures/statsig'

import type { MockRoute } from './mocks'

export {
  emptyGateOverride as emptyOverrides,
  mockAuditLogs,
  mockDynamicConfigs,
  mockExperiments,
  mockFeatureGates,
  paginated,
  single,
} from '@/src/tests/fixtures/statsig'

export const defaultRoutes = (): MockRoute[] => [
  { data: paginated(mockFeatureGates), urlPattern: String.raw`/gates(\?|$)` },
  { data: paginated(mockExperiments), urlPattern: String.raw`/experiments(\?|$)` },
  { data: paginated(mockDynamicConfigs), urlPattern: String.raw`/dynamic_configs(\?|$)` },
  { data: paginated(mockAuditLogs), urlPattern: String.raw`/audit_logs(\?|$)` },
]
