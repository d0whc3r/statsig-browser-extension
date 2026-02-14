import { create } from 'zustand'

interface ContextState {
  currentLocalStorageValue?: string
  detectedUser?: Record<string, unknown> | null

  // Setters
  setCurrentLocalStorageValue: (value: string) => void
  setDetectedUser: (user: Record<string, unknown> | null) => void
}

export const useContextStore = create<ContextState>((set) => ({
  currentLocalStorageValue: undefined,
  detectedUser: undefined,

  setCurrentLocalStorageValue: (value) => set(() => ({ currentLocalStorageValue: value })),
  setDetectedUser: (user) => set(() => ({ detectedUser: user })),
}))
