import { beforeEach, describe, expect, it } from 'vitest'

import { useUIStore } from './use-ui-store'

describe(useUIStore, () => {
  beforeEach(() => {
    useUIStore.setState({
      currentAuditLogId: undefined,
      currentItemId: undefined,
      currentItemType: undefined,
      isAuditLogDetailSheetOpen: false,
      isAuditLogSheetOpen: false,
      isAuthModalOpen: false,
      isItemSheetOpen: false,
      isManageExperimentModalOpen: false,
      isManageGateOverridesModalOpen: false,
      isSettingsSheetOpen: false,
      isUserDetailsSheetOpen: false,
    })
  })

  it('should have correct initial state', () => {
    const state = useUIStore.getState()

    expect(state.currentItemId).toBeUndefined()
    expect(state.currentItemType).toBeUndefined()
    expect(state.currentAuditLogId).toBeUndefined()
    expect(state.isAuthModalOpen).toBeFalsy()
    expect(state.isItemSheetOpen).toBeFalsy()
    expect(state.isManageExperimentModalOpen).toBeFalsy()
    expect(state.isManageGateOverridesModalOpen).toBeFalsy()
    expect(state.isSettingsSheetOpen).toBeFalsy()
    expect(state.isUserDetailsSheetOpen).toBeFalsy()
    expect(state.isAuditLogSheetOpen).toBeFalsy()
    expect(state.isAuditLogDetailSheetOpen).toBeFalsy()
  })

  it('should set auth modal open state', () => {
    useUIStore.getState().setAuthModalOpen(true)
    expect(useUIStore.getState().isAuthModalOpen).toBeTruthy()

    useUIStore.getState().setAuthModalOpen(false)
    expect(useUIStore.getState().isAuthModalOpen).toBeFalsy()
  })

  it('should set current item ID and type', () => {
    useUIStore.getState().setCurrentItemId('gate_123')
    useUIStore.getState().setCurrentItemType('feature_gate')

    const state = useUIStore.getState()
    expect(state.currentItemId).toBe('gate_123')
    expect(state.currentItemType).toBe('feature_gate')
  })

  it('should set item sheet open state', () => {
    useUIStore.getState().setItemSheetOpen(true)
    expect(useUIStore.getState().isItemSheetOpen).toBeTruthy()
  })

  it('should set manage experiment modal open state', () => {
    useUIStore.getState().setManageExperimentModalOpen(true)
    expect(useUIStore.getState().isManageExperimentModalOpen).toBeTruthy()
  })

  it('should set gate overrides modal open state', () => {
    useUIStore.getState().setGateOverridesModalOpen(true)
    expect(useUIStore.getState().isManageGateOverridesModalOpen).toBeTruthy()
  })

  it('should set settings sheet open state', () => {
    useUIStore.getState().setSettingsSheetOpen(true)
    expect(useUIStore.getState().isSettingsSheetOpen).toBeTruthy()
  })

  it('should set user details sheet open state', () => {
    useUIStore.getState().setUserDetailsSheetOpen(true)
    expect(useUIStore.getState().isUserDetailsSheetOpen).toBeTruthy()
  })

  it('should set audit log sheet open state', () => {
    useUIStore.getState().setAuditLogSheetOpen(true)
    expect(useUIStore.getState().isAuditLogSheetOpen).toBeTruthy()
  })

  it('should set audit log detail sheet open state', () => {
    useUIStore.getState().setAuditLogDetailSheetOpen(true)
    expect(useUIStore.getState().isAuditLogDetailSheetOpen).toBeTruthy()
  })

  it('should set current audit log ID', () => {
    useUIStore.getState().setCurrentAuditLogId('audit_123')
    expect(useUIStore.getState().currentAuditLogId).toBe('audit_123')
  })

  it('should reset all state to initial values', () => {
    // Set some values
    useUIStore.getState().setCurrentItemId('gate_123')
    useUIStore.getState().setCurrentItemType('experiment')
    useUIStore.getState().setAuthModalOpen(true)
    useUIStore.getState().setItemSheetOpen(true)
    useUIStore.getState().setCurrentAuditLogId('audit_123')

    // Reset
    useUIStore.getState().reset()

    const state = useUIStore.getState()
    expect(state.currentItemId).toBeUndefined()
    expect(state.currentItemType).toBeUndefined()
    expect(state.currentAuditLogId).toBeUndefined()
    expect(state.isAuthModalOpen).toBeFalsy()
    expect(state.isItemSheetOpen).toBeFalsy()
    expect(state.isAuditLogSheetOpen).toBeFalsy()
    expect(state.isAuditLogDetailSheetOpen).toBeFalsy()
  })

  it('should allow setting different item types', () => {
    useUIStore.getState().setCurrentItemType('feature_gate')
    expect(useUIStore.getState().currentItemType).toBe('feature_gate')

    useUIStore.getState().setCurrentItemType('dynamic_config')
    expect(useUIStore.getState().currentItemType).toBe('dynamic_config')

    useUIStore.getState().setCurrentItemType('experiment')
    expect(useUIStore.getState().currentItemType).toBe('experiment')

    useUIStore.getState().setCurrentItemType(undefined)
    expect(useUIStore.getState().currentItemType).toBeUndefined()
  })
})
