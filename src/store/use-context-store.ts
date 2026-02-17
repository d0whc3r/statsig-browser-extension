import { create } from 'zustand'

interface ContextState {
  currentLocalStorageValue?: string
  detectedUser?: Record<string, unknown> | null
  detectedContext?: Record<string, unknown> | null
  detectionError?: string | null

  // Setters
  setCurrentLocalStorageValue: (value: string) => void
  setDetectedUser: (user: Record<string, unknown> | null) => void
  setDetectedContext: (context: Record<string, unknown> | null) => void
  setDetectionError: (error: string | null) => void
  reset: () => void
}

export const useContextStore = create<ContextState>((set) => ({
  currentLocalStorageValue: undefined,
  detectedContext: undefined,
  detectedUser: undefined,
  detectionError: undefined,

  reset: () =>
    set(() => ({
      currentLocalStorageValue: undefined,
      detectedContext: undefined,
      detectedUser: undefined,
      detectionError: undefined,
    })),
  setCurrentLocalStorageValue: (value) => set(() => ({ currentLocalStorageValue: value })),
  setDetectedContext: (context) => set(() => ({ detectedContext: context })),
  setDetectedUser: (user) => set(() => ({ detectedUser: user, detectionError: null })),
  setDetectionError: (error) => set(() => ({ detectionError: error })),
}))
