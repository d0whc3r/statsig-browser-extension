import { storage } from 'wxt/utils/storage'

export const apiKeyStorage = storage.defineItem<string>('local:statsig-console-api-key', {
  defaultValue: '',
})

export const localStorageKeyStorage = storage.defineItem<string>(
  'local:statsig-local-storage-key',
  {
    defaultValue: 'statsig_user',
  },
)

export const storageTypeStorage = storage.defineItem<'localStorage' | 'cookie'>(
  'local:storage_type',
  {
    defaultValue: 'localStorage',
  },
)

export const apiKeyTypeStorage = storage.defineItem<'write-key' | 'read-key'>(
  'local:api_key_type',
  {
    defaultValue: 'write-key',
  },
)

export const currentOverridesStorage = storage.defineItem<{ name: string }[]>(
  'local:statsig-current-overrides',
  {
    defaultValue: [],
  },
)

// Table State Storage
export const dynamicConfigRowsPerPageStorage = storage.defineItem<number>(
  'local:dynamic-config-table-rows-per-page',
  { defaultValue: 5 },
)
export const dynamicConfigVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:dynamic-config-table-visible-columns',
  { defaultValue: ['name', 'tags', 'isEnabled', 'actions'] },
)

export const experimentsRowsPerPageStorage = storage.defineItem<number>(
  'local:experiments-table-rows-per-page',
  { defaultValue: 5 },
)
export const experimentsVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:experiments-table-visible-columns',
  { defaultValue: ['name', 'status', 'allocation', 'tags', 'actions'] },
)

export const featureGatesRowsPerPageStorage = storage.defineItem<number>(
  'local:feature-gate-table-rows-per-page',
  { defaultValue: 5 },
)
export const featureGatesVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:feature-gate-table-visible-columns',
  { defaultValue: ['name', 'tags', 'status', 'isEnabled', 'actions'] },
)
