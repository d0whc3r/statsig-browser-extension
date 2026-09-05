import { create } from 'zustand'

import type { DetectedStatsigKeys, ProjectMatch } from '@/src/lib/projects'

interface ContextState {
  currentLocalStorageValue?: string
  detectedUser?: Record<string, unknown> | null
  detectedContext?: Record<string, unknown> | null
  detectedKeys?: DetectedStatsigKeys | null
  projectMatch?: ProjectMatch | null
  detectionError?: string | null
  /** Project chosen by hand to work on a site it does not own. Lives in memory: it dies with the popup. */
  manualProjectId?: string

  // Setters
  setCurrentLocalStorageValue: (value: string) => void
  setDetectedUser: (user: Record<string, unknown> | null) => void
  setDetectedContext: (context: Record<string, unknown> | null) => void
  setDetectedKeys: (keys: DetectedStatsigKeys | null) => void
  setProjectMatch: (match: ProjectMatch | null) => void
  setDetectionError: (error: string | null) => void
  setManualProject: (projectId: string | undefined) => void
  reset: () => void
}

export const useContextStore = create<ContextState>((set) => ({
  currentLocalStorageValue: undefined,
  detectedContext: undefined,
  detectedKeys: undefined,
  detectedUser: undefined,
  detectionError: undefined,
  manualProjectId: undefined,
  projectMatch: undefined,

  reset: () => {
    set(() => ({
      currentLocalStorageValue: undefined,
      detectedContext: undefined,
      detectedKeys: undefined,
      detectedUser: undefined,
      detectionError: undefined,
      manualProjectId: undefined,
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
  setManualProject: (projectId) => {
    set(() => ({ manualProjectId: projectId }))
  },
  setProjectMatch: (match) => {
    set(() => ({ projectMatch: match }))
  },
}))
