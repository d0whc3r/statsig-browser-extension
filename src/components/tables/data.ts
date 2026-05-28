export const experimentColumns = [
  { name: 'NAME', sortable: false, uid: 'name' },
  { name: 'HYPOTHESIS', sortable: false, uid: 'hypothesis' },
  { name: 'ALLOCATION', sortable: false, uid: 'allocation' },
  { name: 'TAGS', sortable: false, uid: 'tags' },
  { name: 'STATUS', sortable: false, uid: 'status' },
  { name: 'ACTIONS', uid: 'actions' },
] as const

export const dynamicConfigColumns = [
  { name: 'NAME', sortable: false, uid: 'name' },
  { name: 'TAGS', sortable: false, uid: 'tags' },
  { name: 'ENABLED', sortable: false, uid: 'isEnabled' },
  { name: 'ACTIONS', uid: 'actions' },
] as const

export const featureGateColumns = [
  { name: 'NAME', sortable: false, uid: 'name' },
  { name: 'TAGS', sortable: false, uid: 'tags' },
  { name: 'STATUS', sortable: false, uid: 'status' },
  { name: 'ENABLED', sortable: false, uid: 'isEnabled' },
  { name: 'ACTIONS', uid: 'actions' },
] as const

export type ExperimentColumnKey = (typeof experimentColumns)[number]['uid']

export const experimentStatusOptions = [
  { name: 'Active', uid: 'active' },
  { name: 'Abandoned', uid: 'abandoned' },
  { name: 'Setup', uid: 'setup' },
] as const
