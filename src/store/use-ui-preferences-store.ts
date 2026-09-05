import type { SortingState } from '@tanstack/react-table'
import type { PersistStorage, StorageValue } from 'zustand/middleware'

import { storage } from 'wxt/utils/storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { FacetSelection } from '@/src/components/tables/table-types'

export const UI_PREFERENCES_STORAGE_KEY = 'local:ui-preferences'

const MAIN_TABS = ['feature_gates', 'experiments', 'dynamic_configs', 'audit_logs', 'cleanup'] as const
type MainTab = (typeof MAIN_TABS)[number]
export type TableId = 'featureGates' | 'experiments' | 'dynamicConfigs'

interface TablePreferences {
  facetFilters: FacetSelection
  filterValue: string
  page: number
  rowsPerPage: number
  sorting: SortingState
  visibleColumns: string[]
}

interface AuditLogPreferences {
  actionFilter: string
  filterValue: string
  page: number
  rowsPerPage: number
}

interface PersistedUiPreferences {
  activeTab: MainTab
  auditLogs: AuditLogPreferences
  tables: Record<TableId, TablePreferences>
}

interface UiPreferencesState extends PersistedUiPreferences {
  setActiveTab: (tab: MainTab) => void
  setAuditLogs: (patch: Partial<AuditLogPreferences> | ((current: AuditLogPreferences) => AuditLogPreferences)) => void
  updateTable: (
    tableId: TableId,
    patch: Partial<TablePreferences> | ((current: TablePreferences) => TablePreferences),
  ) => void
}

const defaultTable = (visibleColumns: string[]): TablePreferences => ({
  facetFilters: {},
  filterValue: '',
  page: 1,
  rowsPerPage: 5,
  sorting: [],
  visibleColumns,
})

export const DEFAULT_UI_PREFERENCES: PersistedUiPreferences = {
  activeTab: 'feature_gates',
  auditLogs: { actionFilter: 'all', filterValue: '', page: 1, rowsPerPage: 10 },
  tables: {
    dynamicConfigs: defaultTable(['name', 'tags', 'isEnabled', 'actions']),
    experiments: defaultTable(['name', 'status', 'allocation', 'tags', 'actions']),
    featureGates: defaultTable(['name', 'tags', 'status', 'isEnabled', 'actions']),
  },
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isMainTab = (value: unknown): value is MainTab =>
  typeof value === 'string' && (MAIN_TABS as readonly string[]).includes(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isFacetSelection = (value: unknown): value is FacetSelection =>
  isRecord(value) && Object.values(value).every((item) => isStringArray(item))

const isSortingState = (value: unknown): value is SortingState =>
  Array.isArray(value) &&
  value.every((item) => isRecord(item) && typeof item.id === 'string' && typeof item.desc === 'boolean')

const mergeTable = (value: unknown, fallback: TablePreferences): TablePreferences => {
  if (!isRecord(value)) {
    return fallback
  }

  return {
    facetFilters: isFacetSelection(value.facetFilters) ? value.facetFilters : fallback.facetFilters,
    filterValue: typeof value.filterValue === 'string' ? value.filterValue : fallback.filterValue,
    page: typeof value.page === 'number' && value.page > 0 ? value.page : fallback.page,
    rowsPerPage:
      typeof value.rowsPerPage === 'number' && value.rowsPerPage > 0 ? value.rowsPerPage : fallback.rowsPerPage,
    sorting: isSortingState(value.sorting) ? value.sorting : fallback.sorting,
    visibleColumns: isStringArray(value.visibleColumns) ? value.visibleColumns : fallback.visibleColumns,
  }
}

const mergePersisted = (persistedState: unknown, current: PersistedUiPreferences): PersistedUiPreferences => {
  if (!isRecord(persistedState)) {
    return current
  }

  const tables = isRecord(persistedState.tables) ? persistedState.tables : {}
  const auditLogs = isRecord(persistedState.auditLogs) ? persistedState.auditLogs : {}

  return {
    activeTab: isMainTab(persistedState.activeTab) ? persistedState.activeTab : current.activeTab,
    auditLogs: {
      actionFilter:
        typeof auditLogs.actionFilter === 'string' ? auditLogs.actionFilter : current.auditLogs.actionFilter,
      filterValue: typeof auditLogs.filterValue === 'string' ? auditLogs.filterValue : current.auditLogs.filterValue,
      page: typeof auditLogs.page === 'number' && auditLogs.page > 0 ? auditLogs.page : current.auditLogs.page,
      rowsPerPage:
        typeof auditLogs.rowsPerPage === 'number' && auditLogs.rowsPerPage > 0
          ? auditLogs.rowsPerPage
          : current.auditLogs.rowsPerPage,
    },
    tables: {
      dynamicConfigs: mergeTable(tables.dynamicConfigs, current.tables.dynamicConfigs),
      experiments: mergeTable(tables.experiments, current.tables.experiments),
      featureGates: mergeTable(tables.featureGates, current.tables.featureGates),
    },
  }
}

const mergePreferences = (persistedState: unknown, currentState: UiPreferencesState): UiPreferencesState => ({
  ...currentState,
  ...mergePersisted(persistedState, currentState),
})

const LEGACY_KEYS = {
  auditLogs: {
    actionFilter: 'local:audit-logs-action-filter',
    filterValue: 'local:audit-logs-filter-value',
  },
  tables: {
    dynamicConfigs: {
      facetFilters: 'local:dynamic-config-table-facet-filters',
      filterValue: 'local:dynamic-config-table-filter-value',
      rowsPerPage: 'local:dynamic-config-table-rows-per-page',
      visibleColumns: 'local:dynamic-config-table-visible-columns',
    },
    experiments: {
      facetFilters: 'local:experiments-table-facet-filters',
      filterValue: 'local:experiments-table-filter-value',
      rowsPerPage: 'local:experiments-table-rows-per-page',
      visibleColumns: 'local:experiments-table-visible-columns',
    },
    featureGates: {
      facetFilters: 'local:feature-gate-table-facet-filters',
      filterValue: 'local:feature-gate-table-filter-value',
      rowsPerPage: 'local:feature-gate-table-rows-per-page',
      visibleColumns: 'local:feature-gate-table-visible-columns',
    },
  },
} as const

const readLegacyTable = async (tableId: TableId): Promise<{ found: boolean; table: TablePreferences }> => {
  const keys = LEGACY_KEYS.tables[tableId]
  const fallback = DEFAULT_UI_PREFERENCES.tables[tableId]
  const [facetFilters, filterValue, rowsPerPage, visibleColumns] = await Promise.all([
    storage.getItem<FacetSelection>(keys.facetFilters),
    storage.getItem<string>(keys.filterValue),
    storage.getItem<number>(keys.rowsPerPage),
    storage.getItem<string[]>(keys.visibleColumns),
  ])

  return {
    found: facetFilters !== null || filterValue !== null || rowsPerPage !== null || visibleColumns !== null,
    table: mergeTable({ facetFilters, filterValue, rowsPerPage, visibleColumns }, fallback),
  }
}

const migrateLegacyPreferences = async (): Promise<PersistedUiPreferences | null> => {
  const [featureGates, experiments, dynamicConfigs, actionFilter, filterValue] = await Promise.all([
    readLegacyTable('featureGates'),
    readLegacyTable('experiments'),
    readLegacyTable('dynamicConfigs'),
    storage.getItem<string>(LEGACY_KEYS.auditLogs.actionFilter),
    storage.getItem<string>(LEGACY_KEYS.auditLogs.filterValue),
  ])

  const found =
    featureGates.found || experiments.found || dynamicConfigs.found || actionFilter !== null || filterValue !== null
  if (!found) {
    return null
  }

  return {
    activeTab: DEFAULT_UI_PREFERENCES.activeTab,
    auditLogs: {
      ...DEFAULT_UI_PREFERENCES.auditLogs,
      actionFilter: actionFilter ?? DEFAULT_UI_PREFERENCES.auditLogs.actionFilter,
      filterValue: filterValue ?? DEFAULT_UI_PREFERENCES.auditLogs.filterValue,
    },
    tables: {
      dynamicConfigs: dynamicConfigs.table,
      experiments: experiments.table,
      featureGates: featureGates.table,
    },
  }
}

const toStorageValue = (raw: unknown): StorageValue<PersistedUiPreferences> | null => {
  if (!isRecord(raw)) {
    return null
  }

  const inner = isRecord(raw.state) ? raw.state : raw
  return {
    state: mergePersisted(inner, DEFAULT_UI_PREFERENCES),
    version: typeof raw.version === 'number' ? raw.version : 1,
  }
}

const wxtPersistStorage: PersistStorage<PersistedUiPreferences> = {
  getItem: async () => {
    const stored = toStorageValue(await storage.getItem<unknown>(UI_PREFERENCES_STORAGE_KEY))
    if (stored) {
      return stored
    }

    const migrated = await migrateLegacyPreferences()
    if (!migrated) {
      return null
    }

    const payload = { state: migrated, version: 1 }
    await storage.setItem(UI_PREFERENCES_STORAGE_KEY, payload)
    return payload
  },
  removeItem: async () => {
    await storage.removeItem(UI_PREFERENCES_STORAGE_KEY)
  },
  setItem: async (_name, value) => {
    await storage.setItem(UI_PREFERENCES_STORAGE_KEY, value)
  },
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      ...structuredClone(DEFAULT_UI_PREFERENCES),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setAuditLogs: (patch) =>
        set((state) => ({
          auditLogs: typeof patch === 'function' ? patch(state.auditLogs) : { ...state.auditLogs, ...patch },
        })),
      updateTable: (tableId, patch) =>
        set((state) => {
          const current = state.tables[tableId]
          const next = typeof patch === 'function' ? patch(current) : { ...current, ...patch }
          return { tables: { ...state.tables, [tableId]: next } }
        }),
    }),
    {
      merge: mergePreferences,
      name: 'ui-preferences',
      partialize: (state) => ({
        activeTab: state.activeTab,
        auditLogs: state.auditLogs,
        tables: state.tables,
      }),
      storage: wxtPersistStorage,
      version: 1,
    },
  ),
)
