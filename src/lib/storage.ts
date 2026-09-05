import { storage } from 'wxt/utils/storage'

import type { StatsigProject } from '@/src/lib/projects'

/**
 * Console API key of the active project. Derived from {@link projectsStorage} plus
 * {@link activeProjectIdStorage}; the background script reads it to authorize API requests.
 */
export const apiKeyStorage = storage.defineItem<string>('local:statsig-console-api-key', {
  fallback: '',
})

export const projectsStorage = storage.defineItem<StatsigProject[]>('local:statsig-projects', {
  fallback: [],
})

export const activeProjectIdStorage = storage.defineItem<string>('local:statsig-active-project-id', {
  fallback: '',
})

export const localStorageKeyStorage = storage.defineItem<string>('local:statsig-local-storage-key', {
  fallback: 'statsig_user',
})

export const apiKeyTypeStorage = storage.defineItem<'write-key' | 'read-key'>('local:api_key_type', {
  fallback: 'write-key',
})

export const currentOverridesStorage = storage.defineItem<{ name: string }[]>('local:statsig-current-overrides', {
  fallback: [],
})

export const themeStorage = storage.defineItem<'light' | 'dark' | 'system'>('local:theme', {
  fallback: 'system',
})
