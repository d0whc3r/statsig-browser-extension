import { create } from 'zustand'

import { apiKeyStorage } from '@/src/lib/storage'

interface SettingsState {
  apiKey: string
  isApiKeyLoading: boolean

  // Actions
  initialize: () => void
  setApiKey: (key: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKey: '',
  initialize: async () => {
    try {
      const val = await apiKeyStorage.getValue()
      set({ apiKey: val || '', isApiKeyLoading: false })
    } catch (error) {
      console.error('Failed to initialize settings store:', error)
      set({ isApiKeyLoading: false })
    }

    // Watch for external changes
    apiKeyStorage.watch((val) => {
      set({ apiKey: val || '', isApiKeyLoading: false })
    })
  },

  isApiKeyLoading: true,

  setApiKey: async (key: string) => {
    try {
      // Persist first to ensure background script can read it
      await apiKeyStorage.setValue(key)
      // Optimistic update
      set({ apiKey: key })
    } catch (error) {
      console.error('Failed to persist API key:', error)
    }
  },
}))
