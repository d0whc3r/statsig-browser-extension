import type { StatsigUser } from '@/src/types/statsig'

import { getDetectedUserId } from './user-utils'

describe('getDetectedUserId utility', () => {
  it('returns undefined if no user is provided', () => {
    expect(getDetectedUserId()).toBeUndefined()
  })

  it('returns userID by default', () => {
    const user = { userID: 'user-123' }
    expect(getDetectedUserId(user)).toBe('user-123')
  })

  it('returns id if userID is missing and type is userID', () => {
    const user = { id: 'id-123' }
    expect(getDetectedUserId(user)).toBe('id-123')
  })

  it('checks customIDs first for non-userID types', () => {
    const user = {
      customIDs: {
        employeeID: 'emp-456',
      },
      employeeID: 'top-level-emp',
    }
    expect(getDetectedUserId(user as unknown as StatsigUser, 'employeeID')).toBe('emp-456')
  })

  it('checks top-level fields if not in customIDs', () => {
    const user = {
      stableID: 'stable-789',
    }
    expect(getDetectedUserId(user as unknown as StatsigUser, 'stableID')).toBe('stable-789')
  })

  it('checks custom field if not found elsewhere', () => {
    const user = {
      custom: {
        teamID: 'team-001',
      },
    }
    expect(getDetectedUserId(user as unknown as StatsigUser, 'teamID')).toBe('team-001')
  })

  it('prefers customIDs over custom field', () => {
    const user = {
      custom: {
        orgID: 'custom-org-id',
      },
      customIDs: {
        orgID: 'org-id-1',
      },
    }
    expect(getDetectedUserId(user as unknown as StatsigUser, 'orgID')).toBe('org-id-1')
  })

  it('returns undefined if idType is not found anywhere', () => {
    const user = {
      custom: {
        something: 'else',
      },
      userID: 'user-123',
    }
    expect(getDetectedUserId(user as unknown as StatsigUser, 'missingID')).toBe(undefined)
  })
})
