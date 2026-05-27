import type {
  AuditLog,
  DynamicConfig,
  Experiment,
  ExperimentOverride,
  ExperimentOverridesResponse,
  FeatureGate,
  GateOverride,
  UserIDOverride,
} from '@/src/types/statsig'

const NOW = 1_700_000_000_000

export const makeFeatureGate = (overrides: Partial<FeatureGate> = {}): FeatureGate => ({
  checksPerHour: 0,
  createdTime: NOW,
  creatorEmail: 'creator@example.com',
  creatorID: 'creator-1',
  creatorName: 'Creator One',
  description: '',
  holdoutIDs: [],
  id: 'gate-1',
  idType: 'userID',
  isEnabled: true,
  lastModifiedTime: NOW,
  lastModifierEmail: 'creator@example.com',
  lastModifierID: 'creator-1',
  lastModifierName: 'Creator One',
  measureMetricLifts: false,
  monitoringMetrics: [],
  name: 'gate_1',
  owner: {
    ownerEmail: 'creator@example.com',
    ownerID: 'creator-1',
    ownerName: 'Creator One',
    ownerType: 'USER',
  },
  reviewSettings: { allowedReviewers: [], requiredReview: false },
  rules: [],
  status: 'In Progress',
  tags: [],
  targetApps: [],
  team: null,
  type: 'PERMANENT',
  typeReason: 'NONE',
  ...overrides,
})

export const makeExperiment = (overrides: Partial<Experiment> = {}): Experiment => ({
  allocation: 100,
  createdTime: NOW,
  creatorName: 'Creator One',
  description: '',
  endTime: 0,
  groups: [],
  healthChecks: [],
  hypothesis: '',
  id: 'exp-1',
  lastModifiedTime: NOW,
  name: 'experiment_1',
  startTime: NOW,
  status: 'active',
  tags: [],
  ...overrides,
})

export const makeDynamicConfig = (overrides: Partial<DynamicConfig> = {}): DynamicConfig => ({
  createdTime: NOW,
  creatorName: 'Creator One',
  defaultValue: {},
  description: '',
  id: 'config-1',
  isEnabled: true,
  lastModifiedTime: NOW,
  lastModifierName: 'Creator One',
  name: 'config_1',
  tags: [],
  ...overrides,
})

export const makeAuditLog = (overrides: Partial<AuditLog> = {}): AuditLog => ({
  actionType: 'gate::created',
  changeLog: '',
  date: '2024-01-15',
  id: 'log-1',
  modifierEmail: 'creator@example.com',
  name: 'gate_1',
  tags: [],
  targetAppIDs: [],
  time: '10:30',
  updatedBy: 'Creator One',
  updatedByUserID: 'creator-1',
  ...overrides,
})

export const makeGateOverride = (overrides: Partial<GateOverride> = {}): GateOverride => ({
  environmentOverrides: [],
  failingCustomIDs: [],
  failingUserIDs: [],
  passingCustomIDs: [],
  passingUserIDs: [],
  ...overrides,
})

export const makeExperimentOverride = (overrides: Partial<ExperimentOverride> = {}): ExperimentOverride => ({
  groupID: 'Control',
  name: 'gate_1',
  type: 'gate',
  ...overrides,
})

export const makeUserIDOverride = (overrides: Partial<UserIDOverride> = {}): UserIDOverride => ({
  environment: 'Production',
  groupID: 'Control',
  ids: [],
  unitType: 'userID',
  ...overrides,
})

export const makeExperimentOverridesResponse = (
  overrides: Partial<ExperimentOverridesResponse> = {},
): ExperimentOverridesResponse => ({
  overrides: [],
  userIDOverrides: [],
  ...overrides,
})

export const paginated = <T>(data: T[]) => ({
  data,
  pagination: { limit: 100, page: 1, totalItems: data.length },
})

export const single = <T>(data: T) => ({ data })

export const emptyGateOverride: GateOverride = makeGateOverride()

export const mockFeatureGates: FeatureGate[] = [
  makeFeatureGate({
    description: 'Enables the brand-new shiny checkout experience for selected users.',
    id: 'gate-checkout',
    name: 'new_checkout_flow',
    tags: ['checkout', 'frontend'],
  }),
  makeFeatureGate({
    description: 'Dark theme rollout for users in the beta channel.',
    id: 'gate-dark-theme',
    isEnabled: false,
    name: 'dark_theme_enabled',
    status: 'Disabled',
    tags: ['ui'],
    type: 'TEMPORARY',
  }),
]

export const mockExperiments: Experiment[] = [
  makeExperiment({
    description: 'Test reorder of homepage hero blocks.',
    groups: [
      { id: 'control', name: 'Control', parameterValues: {}, size: 50 },
      { id: 'variant', name: 'Variant', parameterValues: { showHero: true }, size: 50 },
    ],
    hypothesis: 'Reordering hero blocks improves CTR.',
    id: 'exp-homepage',
    name: 'homepage_hero_reorder',
    tags: ['homepage'],
  }),
]

export const mockDynamicConfigs: DynamicConfig[] = [
  makeDynamicConfig({
    defaultValue: { greeting: 'Hello' },
    description: 'Configuration for homepage banner copy.',
    id: 'config-banner',
    name: 'homepage_banner_config',
    tags: ['homepage'],
  }),
]

export const mockAuditLogs: AuditLog[] = [
  makeAuditLog({
    changeLog: 'Created new feature gate',
    name: 'new_checkout_flow',
    tags: ['checkout'],
  }),
]
