import { create } from 'zustand'

import type { DetectedStatsigKeys, ProjectMatch } from '@/src/lib/projects'

interface ContextState {
  currentLocalStorageValue?: string
  detectedUser?: Record<string, unknown> | null
  detectedContext?: Record<string, unknown> | null
  detectedKeys?: DetectedStatsigKeys | null
  projectMatch?: ProjectMatch | null
  detectionError?: string | null

  // Setters
  setCurrentLocalStorageValue: (value: string) => void
  setDetectedUser: (user: Record<string, unknown> | null) => void
  setDetectedContext: (context: Record<string, unknown> | null) => void
  setDetectedKeys: (keys: DetectedStatsigKeys | null) => void
  setProjectMatch: (match: ProjectMatch | null) => void
  setDetectionError: (error: string | null) => void
  reset: () => void
}

export const useContextStore = create<ContextState>((set) => ({
  currentLocalStorageValue: undefined,
  detectedContext: undefined,
  detectedKeys: undefined,
  detectedUser: undefined,
  detectionError: undefined,
  projectMatch: undefined,

  reset: () => {
    set(() => ({
      currentLocalStorageValue: undefined,
      detectedContext: undefined,
      detectedKeys: undefined,
      detectedUser: undefined,
      detectionError: undefined,
      projectMatch: undefined,
    }))
  },
  setCurrentLocalStorageValue: (value) => {
    set(() => ({ currentLocalStorageValue: value }))
  },
  setDetectedContext: (context) => {
    set(() => ({ detectedContext: context }))
  },
  setDetectedKeys: (keys) => {
    set(() => ({ detectedKeys: keys }))
  },
  setDetectedUser: (user) => {
    set(() => ({ detectedUser: user, detectionError: null }))
  },
  setDetectionError: (error) => {
    set(() => ({ detectionError: error }))
  },
  setProjectMatch: (match) => {
    set(() => ({ projectMatch: match }))
  },
}))
