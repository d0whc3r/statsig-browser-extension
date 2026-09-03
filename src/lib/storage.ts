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
export const dynamicConfigFilterValueStorage = storage.defineItem<string>('local:dynamic-config-table-filter-value', {
  fallback: '',
})
export const dynamicConfigFacetFiltersStorage = storage.defineItem<Record<string, string[]>>(
  'local:dynamic-config-table-facet-filters',
  { fallback: {} },
)

export const experimentsRowsPerPageStorage = storage.defineItem<number>('local:experiments-table-rows-per-page', {
  fallback: 5,
})
export const experimentsVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:experiments-table-visible-columns',
  { fallback: ['name', 'status', 'allocation', 'tags', 'actions'] },
)
export const experimentsFilterValueStorage = storage.defineItem<string>('local:experiments-table-filter-value', {
  fallback: '',
})
export const experimentsFacetFiltersStorage = storage.defineItem<Record<string, string[]>>(
  'local:experiments-table-facet-filters',
  { fallback: {} },
)

export const featureGatesRowsPerPageStorage = storage.defineItem<number>('local:feature-gate-table-rows-per-page', {
  fallback: 5,
})
export const featureGatesVisibleColumnsStorage = storage.defineItem<string[]>(
  'local:feature-gate-table-visible-columns',
  { fallback: ['name', 'tags', 'status', 'isEnabled', 'actions'] },
)
export const featureGatesFilterValueStorage = storage.defineItem<string>('local:feature-gate-table-filter-value', {
  fallback: '',
})
export const featureGatesFacetFiltersStorage = storage.defineItem<Record<string, string[]>>(
  'local:feature-gate-table-facet-filters',
  { fallback: {} },
)

export const auditLogsFilterValueStorage = storage.defineItem<string>('local:audit-logs-filter-value', {
  fallback: '',
})
export const auditLogsActionFilterStorage = storage.defineItem<string>('local:audit-logs-action-filter', {
  fallback: 'all',
})
