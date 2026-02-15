import { create } from 'zustand'

interface UIState {
  currentItemId?: string
  currentItemType?: 'feature_gate' | 'dynamic_config' | 'experiment'
  currentAuditLogId?: string
  isAuthModalOpen: boolean
  isItemSheetOpen: boolean
  isManageExperimentModalOpen: boolean
  isManageGateOverridesModalOpen: boolean
  isSettingsSheetOpen: boolean
  isUserDetailsSheetOpen: boolean
  isAuditLogSheetOpen: boolean
  isAuditLogDetailSheetOpen: boolean

  // Setters
  setAuthModalOpen: (isOpen: boolean) => void
  setCurrentItemId: (id: string | undefined) => void
  setCurrentItemType: (type: 'feature_gate' | 'dynamic_config' | 'experiment' | undefined) => void
  setCurrentAuditLogId: (id: string | undefined) => void
  setItemSheetOpen: (isOpen: boolean) => void
  setManageExperimentModalOpen: (isOpen: boolean) => void
  setGateOverridesModalOpen: (isOpen: boolean) => void
  setSettingsSheetOpen: (isOpen: boolean) => void
  setUserDetailsSheetOpen: (isOpen: boolean) => void
  setAuditLogSheetOpen: (isOpen: boolean) => void
  setAuditLogDetailSheetOpen: (isOpen: boolean) => void
  reset: () => void
}

export const useUIStore = create<UIState>((set) => ({
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

  reset: () =>
    set(() => ({
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
    })),
  setAuditLogDetailSheetOpen: (isOpen) => set(() => ({ isAuditLogDetailSheetOpen: isOpen })),
  setAuditLogSheetOpen: (isOpen) => set(() => ({ isAuditLogSheetOpen: isOpen })),
  setAuthModalOpen: (isOpen) => set(() => ({ isAuthModalOpen: isOpen })),
  setCurrentAuditLogId: (id) => set(() => ({ currentAuditLogId: id })),
  setCurrentItemId: (id) => set(() => ({ currentItemId: id })),
  setCurrentItemType: (type) => set(() => ({ currentItemType: type })),
  setGateOverridesModalOpen: (isOpen) => set(() => ({ isManageGateOverridesModalOpen: isOpen })),
  setItemSheetOpen: (isOpen) => set(() => ({ isItemSheetOpen: isOpen })),
  setManageExperimentModalOpen: (isOpen) => set(() => ({ isManageExperimentModalOpen: isOpen })),
  setSettingsSheetOpen: (isOpen) => set(() => ({ isSettingsSheetOpen: isOpen })),
  setUserDetailsSheetOpen: (isOpen) => set(() => ({ isUserDetailsSheetOpen: isOpen })),
}))
