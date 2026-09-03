import type { DynamicConfig, Experiment, FeatureGate } from '@/src/types/statsig'

import type { Facet } from './table-types'

export const experimentColumns = [
  { name: 'NAME', sortable: true, uid: 'name', width: 'w-[26%]' },
  { name: 'HYPOTHESIS', sortable: true, uid: 'hypothesis', width: 'w-[20%]' },
  { name: 'ALLOCATION', sortable: true, uid: 'allocation', width: 'w-[12%]' },
  { name: 'TAGS', sortable: true, uid: 'tags', width: 'w-[18%]' },
  { name: 'STATUS', sortable: true, uid: 'status', width: 'w-[14%]' },
  { name: 'ACTIONS', sortable: false, uid: 'actions', width: 'w-[10%]' },
] as const

export const dynamicConfigColumns = [
  { name: 'NAME', sortable: true, uid: 'name', width: 'w-[42%]' },
  { name: 'TAGS', sortable: true, uid: 'tags', width: 'w-[28%]' },
  { name: 'ENABLED', sortable: true, uid: 'isEnabled', width: 'w-[18%]' },
  { name: 'ACTIONS', sortable: false, uid: 'actions', width: 'w-[12%]' },
] as const

export const featureGateColumns = [
  { name: 'NAME', sortable: true, uid: 'name', width: 'w-[34%]' },
  { name: 'TAGS', sortable: true, uid: 'tags', width: 'w-[24%]' },
  { name: 'STATUS', sortable: true, uid: 'status', width: 'w-[15%]' },
  { name: 'ENABLED', sortable: true, uid: 'isEnabled', width: 'w-[14%]' },
  { name: 'ACTIONS', sortable: false, uid: 'actions', width: 'w-[13%]' },
] as const

export type ExperimentColumnKey = (typeof experimentColumns)[number]['uid']

export const experimentStatusLabels: Record<string, string> = {
  abandoned: 'Abandoned',
  active: 'In Progress',
  archived: 'Archived',
  decision_made: 'Decision Made',
  setup: 'Setup',
}

const tagsFacet = <T extends { tags?: string[] }>(): Facet<T> => ({
  getValues: (item) => item.tags ?? [],
  key: 'tags',
  label: 'Tags',
})

const enabledFacet = <T extends { isEnabled: boolean }>(): Facet<T> => ({
  getValues: (item) => [item.isEnabled ? 'Enabled' : 'Disabled'],
  key: 'isEnabled',
  label: 'Enabled',
})

export const featureGateFacets: readonly Facet<FeatureGate>[] = [
  { getValues: (gate) => (gate.status ? [gate.status] : []), key: 'status', label: 'Status' },
  enabledFacet<FeatureGate>(),
  tagsFacet<FeatureGate>(),
]

export const experimentFacets: readonly Facet<Experiment>[] = [
  {
    format: (value) => experimentStatusLabels[value] ?? value,
    getValues: (experiment) => (experiment.status ? [experiment.status] : []),
    key: 'status',
    label: 'Status',
  },
  tagsFacet<Experiment>(),
]

export const dynamicConfigFacets: readonly Facet<DynamicConfig>[] = [
  enabledFacet<DynamicConfig>(),
  tagsFacet<DynamicConfig>(),
]
