import { storage } from 'wxt/utils/storage'

export const apiKeyStorage = storage.defineItem<string>('local:statsig-console-api-key', {
  fallback: '',
})

export const localStorageKeyStorage = storage.defineItem<string>('local:statsig-local-storage-key', {
  fallback: 'statsig_user',
})

export const storageTypeStorage = storage.defineItem<'localStorage' | 'cookie'>('local:storage_type', {
  fallback: 'localStorage',
})

export const apiKeyTypeStorage = storage.defineItem<'write-key' | 'read-key'>('local:api_key_type', {
  fallback: 'write-key',
})

export const currentOverridesStorage = storage.defineItem<{ name: string }[]>('local:statsig-current-overrides', {
  fallback: [],
})

export const themeStorage = storage.defineItem<'light' | 'dark' | 'system'>('local:theme', {
  fallback: 'system',
})

// Table State Storage
export const dynamicConfigRowsPerPageStorage = storage.defineItem<number>('local:dynamic-config-table-rows-per-page', {
  fallback: 5,
})
export const dynamicConfigVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:dynamic-config-table-visible-columns',
  { fallback: ['name', 'tags', 'isEnabled', 'actions'] },
)

export const experimentsRowsPerPageStorage = storage.defineItem<number>('local:experiments-table-rows-per-page', {
  fallback: 5,
})
export const experimentsVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:experiments-table-visible-columns',
  { fallback: ['name', 'status', 'allocation', 'tags', 'actions'] },
)

export const featureGatesRowsPerPageStorage = storage.defineItem<number>('local:feature-gate-table-rows-per-page', {
  fallback: 5,
})
export const featureGatesVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:feature-gate-table-visible-columns',
  { fallback: ['name', 'tags', 'status', 'isEnabled', 'actions'] },
)
