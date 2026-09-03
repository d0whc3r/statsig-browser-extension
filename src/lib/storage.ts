import { storage } from 'wxt/utils/storage'

export const apiKeyStorage = storage.defineItem<string>('local:statsig-console-api-key', {
  fallback: '',
})

export const localStorageKeyStorage = storage.defineItem<string>('local:statsig-local-storage-key', {
  fallback: 'statsig_user',
})

export const storageTypeStorage = storage.defineItem<'localStorage' | 'cookie'>('local:storage_type', {
  fallback: 'localStorage',
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
