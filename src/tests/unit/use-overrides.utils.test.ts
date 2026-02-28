import type { ExperimentOverridesResponse } from '@/src/types/statsig'

import { transformOverridesResponse } from '../../hooks/use-overrides.utils'

describe('transformOverridesResponse logic', () => {
  it('should return empty arrays if response fields are missing', () => {
    const mockResponse: any = {}
    const transformed = transformOverridesResponse(mockResponse)

    expect(transformed.overrides).toEqual([])
    expect(transformed.userIDOverrides).toEqual([])
  })

  it('should filter out userIDOverrides with empty ids list', () => {
    const mockResponse: ExperimentOverridesResponse = {
      overrides: [],
      userIDOverrides: [
        {
          environment: 'production',
          groupID: 'group_a',
          ids: ['user_1'],
          unitType: 'userID',
        },
        {
          environment: 'production',
          groupID: 'group_b',
          ids: [], // Should be filtered out
          unitType: 'userID',
        },
      ],
    }

    const transformed = transformOverridesResponse(mockResponse)
    expect(transformed.userIDOverrides).toHaveLength(1)
    expect(transformed.userIDOverrides[0].ids).toEqual(['user_1'])
  })

  it('should preserve overrides list', () => {
    const mockResponse: ExperimentOverridesResponse = {
      overrides: [
        {
          groupID: 'group_1',
          name: 'gate_1',
          type: 'gate',
        },
      ],
      userIDOverrides: [],
    }

    const transformed = transformOverridesResponse(mockResponse)
    expect(transformed.overrides).toHaveLength(1)
    expect(transformed.overrides[0].name).toBe('gate_1')
  })
})
