import { create } from 'zustand'

interface FieldState {
  currentItemId?: string
  currentLocalStorageValue?: string
  currentAuditLogId?: string
  detectedUser?: Record<string, unknown> | null
  isAuthModalOpen: boolean
  isItemSheetOpen: boolean
  isManageExperimentModalOpen: boolean
  isManageGateOverridesModalOpen: boolean
  isSettingsSheetOpen: boolean
  isUserDetailsSheetOpen: boolean
  isAuditLogSheetOpen: boolean
  isAuditLogDetailSheetOpen: boolean
  setAuthModalOpen: (isAuthModalOpen: boolean) => void
  setCurrentItemId: (currentItemId: string | undefined) => void
  setCurrentLocalStorageValue: (currentLocalStorageValue: string) => void
  setCurrentAuditLogId: (currentAuditLogId: string | undefined) => void
  setDetectedUser: (detectedUser: Record<string, unknown> | null) => void
  setItemSheetOpen: (isItemSheetOpen: boolean) => void
  setManageExperimentModalOpen: (isManageExperimentModalOpen: boolean) => void
  setGateOverridesModalOpen: (isManageGateOverridesModalOpen: boolean) => void
  setSettingsSheetOpen: (isSettingsModalOpen: boolean) => void
  setUserDetailsSheetOpen: (isUserDetailsSheetOpen: boolean) => void
  setAuditLogSheetOpen: (isAuditLogSheetOpen: boolean) => void
  setAuditLogDetailSheetOpen: (isAuditLogDetailSheetOpen: boolean) => void
}

export const useStore = create<FieldState>((set) => ({
  currentAuditLogId: undefined,
  currentItemId: undefined,
  currentLocalStorageValue: undefined,
  detectedUser: undefined,
  isAuditLogDetailSheetOpen: false,
  isAuditLogSheetOpen: false,
  isAuthModalOpen: false,
  isItemSheetOpen: false,
  isManageExperimentModalOpen: false,
  isManageGateOverridesModalOpen: false,
  isSettingsSheetOpen: false,
  isUserDetailsSheetOpen: false,
  setAuditLogDetailSheetOpen: (isAuditLogDetailSheetOpen) =>
    set(() => ({ isAuditLogDetailSheetOpen })),
  setAuditLogSheetOpen: (isAuditLogSheetOpen) => set(() => ({ isAuditLogSheetOpen })),
  setAuthModalOpen: (isAuthModalOpen) => set(() => ({ isAuthModalOpen })),
  setCurrentAuditLogId: (currentAuditLogId) => set(() => ({ currentAuditLogId })),
  setCurrentItemId: (currentItemId) => set(() => ({ currentItemId })),
  setCurrentLocalStorageValue: (currentLocalStorageValue) =>
    set(() => ({ currentLocalStorageValue })),
  setDetectedUser: (detectedUser) => set(() => ({ detectedUser })),
  setGateOverridesModalOpen: (isManageGateOverridesModalOpen) =>
    set(() => ({ isManageGateOverridesModalOpen })),
  setItemSheetOpen: (isItemSheetOpen) => set(() => ({ isItemSheetOpen })),
  setManageExperimentModalOpen: (isManageExperimentModalOpen) =>
    set(() => ({ isManageExperimentModalOpen })),
  setSettingsSheetOpen: (isSettingsModalOpen) =>
    set(() => ({ isSettingsSheetOpen: isSettingsModalOpen })),
  setUserDetailsSheetOpen: (isUserDetailsSheetOpen) => set(() => ({ isUserDetailsSheetOpen })),
}))
