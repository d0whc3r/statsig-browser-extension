import { beforeEach, describe, expect, it } from 'vitest'

import { useContextStore } from './use-context-store'

describe('useContextStore', () => {
  beforeEach(() => {
    useContextStore.getState().reset()
  })

  it('should have correct initial state', () => {
    const state = useContextStore.getState()

    expect(state.detectedUser).toBeUndefined()
    expect(state.detectedContext).toBeUndefined()
    expect(state.currentLocalStorageValue).toBeUndefined()
    expect(state.detectionError).toBeUndefined()
  })

  it('should set detected user', () => {
    const mockUser = { email: 'test@example.com', userID: 'user_123' }
    useContextStore.getState().setDetectedUser(mockUser)

    const state = useContextStore.getState()
    expect(state.detectedUser).toStrictEqual(mockUser)
    expect(state.detectionError).toBeNull()
  })

  it('should set detected context', () => {
    const mockContext = { app: 'dashboard', page: 'home' }
    useContextStore.getState().setDetectedContext(mockContext)

    expect(useContextStore.getState().detectedContext).toStrictEqual(mockContext)
  })

  it('should set current local storage value', () => {
    useContextStore.getState().setCurrentLocalStorageValue('statsig_user_custom')

    expect(useContextStore.getState().currentLocalStorageValue).toBe('statsig_user_custom')
  })

  it('should set detection error', () => {
    useContextStore.getState().setDetectionError('Failed to detect Statsig')

    const state = useContextStore.getState()
    expect(state.detectionError).toBe('Failed to detect Statsig')
  })

  it('should clear detection error when setting user', () => {
    // Set an error first
    useContextStore.getState().setDetectionError('Some error')
    expect(useContextStore.getState().detectionError).toBe('Some error')

    // Then set user - should clear error
    useContextStore.getState().setDetectedUser({ userID: 'user_123' })
    expect(useContextStore.getState().detectionError).toBeNull()
  })

  it('should reset all state to initial values', () => {
    // Set some values
    useContextStore.getState().setDetectedUser({ userID: 'user_123' })
    useContextStore.getState().setDetectedContext({ app: 'test' })
    useContextStore.getState().setCurrentLocalStorageValue('test_value')
    useContextStore.getState().setDetectionError('error')

    // Reset
    useContextStore.getState().reset()

    const state = useContextStore.getState()
    expect(state.detectedUser).toBeUndefined()
    expect(state.detectedContext).toBeUndefined()
    expect(state.currentLocalStorageValue).toBeUndefined()
    expect(state.detectionError).toBeUndefined()
  })

  it('should allow setting null for detected user', () => {
    useContextStore.getState().setDetectedUser(null)
    expect(useContextStore.getState().detectedUser).toBeNull()
  })

  it('should allow setting null for detected context', () => {
    useContextStore.getState().setDetectedContext(null)
    expect(useContextStore.getState().detectedContext).toBeNull()
  })

  it('should allow setting null for detection error', () => {
    useContextStore.getState().setDetectionError(null)
    expect(useContextStore.getState().detectionError).toBeNull()
  })
})
