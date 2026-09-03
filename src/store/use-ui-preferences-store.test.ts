import { beforeEach, describe, expect, it, vi } from 'vitest'
import { storage } from 'wxt/utils/storage'

import { DEFAULT_UI_PREFERENCES, UI_PREFERENCES_STORAGE_KEY, useUiPreferencesStore } from './use-ui-preferences-store'

const defaultSlice = () => ({
  activeTab: DEFAULT_UI_PREFERENCES.activeTab,
  auditLogs: structuredClone(DEFAULT_UI_PREFERENCES.auditLogs),
  tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
})

const resetStore = async () => {
  useUiPreferencesStore.setState(defaultSlice())
  await storage.removeItem(UI_PREFERENCES_STORAGE_KEY)
}

const waitForStoredPreferences = async () => {
  await vi.waitFor(async () => {
    await expect(storage.getItem(UI_PREFERENCES_STORAGE_KEY)).resolves.toBeTruthy()
  })
  return storage.getItem(UI_PREFERENCES_STORAGE_KEY)
}

describe('useUiPreferencesStore', () => {
  beforeEach(async () => {
    await resetStore()
  })

  it('starts on the Gates tab with default table prefs', () => {
    const state = useUiPreferencesStore.getState()

    expect(state.activeTab).toBe('feature_gates')
    expect(state.tables.featureGates.page).toBe(1)
    expect(state.tables.featureGates.filterValue).toBe('')
    expect(state.tables.featureGates.sorting).toStrictEqual([])
    expect(state.auditLogs.actionFilter).toBe('all')
  })

  it('persists the last tab, table page, sort, and filters across rehydrate', async () => {
    useUiPreferencesStore.getState().setActiveTab('experiments')
    useUiPreferencesStore.getState().updateTable('experiments', {
      facetFilters: { status: ['active'] },
      filterValue: 'checkout',
      page: 3,
      sorting: [{ desc: false, id: 'name' }],
    })
    useUiPreferencesStore.getState().setAuditLogs({ actionFilter: 'create', filterValue: 'gate' })

    const stored = await waitForStoredPreferences()

    useUiPreferencesStore.setState(defaultSlice())
    await storage.setItem(UI_PREFERENCES_STORAGE_KEY, stored)
    await useUiPreferencesStore.persist.rehydrate()

    const state = useUiPreferencesStore.getState()
    expect(state.activeTab).toBe('experiments')
    expect(state.tables.experiments.filterValue).toBe('checkout')
    expect(state.tables.experiments.page).toBe(3)
    expect(state.tables.experiments.sorting).toStrictEqual([{ desc: false, id: 'name' }])
    expect(state.tables.experiments.facetFilters).toStrictEqual({ status: ['active'] })
    expect(state.auditLogs).toStrictEqual({ actionFilter: 'create', filterValue: 'gate' })
    expect(state.tables.featureGates.filterValue).toBe('')
  })

  it('does not persist actions or drop default nested fields when storage is partial', async () => {
    await storage.setItem(UI_PREFERENCES_STORAGE_KEY, {
      state: { activeTab: 'audit_logs', tables: { featureGates: { filterValue: 'partial' } } },
      version: 1,
    })

    await useUiPreferencesStore.persist.rehydrate()

    const state = useUiPreferencesStore.getState()
    expect(state.activeTab).toBe('audit_logs')
    expect(state.tables.featureGates.filterValue).toBe('partial')
    expect(state.tables.featureGates.page).toBe(1)
    expect(state.tables.featureGates.visibleColumns.length).toBeGreaterThan(0)
    expect(state.setActiveTab).toBeTypeOf('function')
  })

  it('migrates legacy per-table storage keys into the single preferences blob', async () => {
    await storage.removeItem(UI_PREFERENCES_STORAGE_KEY)
    await storage.setItem('local:feature-gate-table-filter-value', 'legacy-gate')
    await storage.setItem('local:feature-gate-table-facet-filters', { tags: ['beta'] })
    await storage.setItem('local:feature-gate-table-rows-per-page', 25)
    await storage.setItem('local:audit-logs-action-filter', 'delete')

    await useUiPreferencesStore.persist.rehydrate()

    const state = useUiPreferencesStore.getState()
    expect(state.tables.featureGates.filterValue).toBe('legacy-gate')
    expect(state.tables.featureGates.facetFilters).toStrictEqual({ tags: ['beta'] })
    expect(state.tables.featureGates.rowsPerPage).toBe(25)
    expect(state.auditLogs.actionFilter).toBe('delete')
  })
})
