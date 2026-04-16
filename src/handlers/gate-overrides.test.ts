import { beforeEach, vi, describe, expect, it } from 'vitest'

import type { GateOverride } from '@/src/types/statsig'

import { deleteGateOverrides, updateGateOverrides } from './gate-overrides'

const { apiMock, posterMock } = vi.hoisted(() => ({
  apiMock: {
    delete: vi.fn(),
    json: vi.fn(),
    url: vi.fn(),
  },
  posterMock: vi.fn(),
}))

vi.mock('@/src/lib/fetcher', () => ({
  api: apiMock,
  poster: posterMock,
}))

describe('gate-overrides handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe(updateGateOverrides, () => {
    it('should successfully update gate overrides', async () => {
      const mockOverride: GateOverride = {
        environmentOverrides: [],
        failingUserIDs: [],
        passingUserIDs: ['user_123'],
      }
      posterMock.mockResolvedValue({
        data: mockOverride,
        message: 'Success',
      })

      const result = await updateGateOverrides({
        gateId: 'gate_123',
        overrides: mockOverride,
      })

      expect(result).toEqual(mockOverride)
      expect(posterMock).toHaveBeenCalledWith('/gates/gate_123/overrides', mockOverride)
    })

    it('should throw error when update fails', async () => {
      posterMock.mockRejectedValue(new Error('Forbidden'))

      await expect(
        updateGateOverrides({
          gateId: 'gate_123',
          overrides: {} as GateOverride,
        }),
      ).rejects.toThrow('Forbidden')
    })

    it('should include original error as cause', async () => {
      const originalError = new Error('Network Error')
      posterMock.mockRejectedValue(originalError)

      try {
        await updateGateOverrides({
          gateId: 'gate_123',
          overrides: {} as GateOverride,
        })
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network Error')
        expect((error as Error).cause).toBe(originalError)
      }
    })
  })

  describe(deleteGateOverrides, () => {
    it('should successfully delete gate overrides', async () => {
      const mockOverride: GateOverride = {
        environmentOverrides: [],
        failingUserIDs: ['user_456'],
        passingUserIDs: [],
      }

      const mockJsonAfterDelete = vi.fn().mockResolvedValue({
        data: mockOverride,
        message: 'Deleted',
      })
      const mockDelete = vi.fn().mockReturnValue({ json: mockJsonAfterDelete })
      const mockJsonBeforeDelete = vi.fn().mockReturnValue({ delete: mockDelete })
      const mockUrl = vi.fn().mockReturnValue({ json: mockJsonBeforeDelete })

      apiMock.url = mockUrl
      apiMock.json = mockJsonBeforeDelete
      apiMock.delete = mockDelete

      const overrideToDelete = {
        passingUserIDs: ['user_456'],
      }

      const result = await deleteGateOverrides({
        gateId: 'gate_123',
        overrides: overrideToDelete,
      })

      expect(result).toEqual(mockOverride)
      expect(mockUrl).toHaveBeenCalledWith('/gates/gate_123/overrides')
    })

    it('should throw error when delete fails', async () => {
      const mockJsonAfterDelete = vi.fn().mockRejectedValue(new Error('Not Found'))
      const mockDelete = vi.fn().mockReturnValue({ json: mockJsonAfterDelete })
      const mockJsonBeforeDelete = vi.fn().mockReturnValue({ delete: mockDelete })
      const mockUrl = vi.fn().mockReturnValue({ json: mockJsonBeforeDelete })

      apiMock.url = mockUrl
      apiMock.json = mockJsonBeforeDelete
      apiMock.delete = mockDelete

      await expect(
        deleteGateOverrides({
          gateId: 'nonexistent',
          overrides: {},
        }),
      ).rejects.toThrow('Not Found')
    })

    it('should include original error as cause on delete failure', async () => {
      const originalError = new Error('Server Error')
      const mockJsonAfterDelete = vi.fn().mockRejectedValue(originalError)
      const mockDelete = vi.fn().mockReturnValue({ json: mockJsonAfterDelete })
      const mockJsonBeforeDelete = vi.fn().mockReturnValue({ delete: mockDelete })
      const mockUrl = vi.fn().mockReturnValue({ json: mockJsonBeforeDelete })

      apiMock.url = mockUrl
      apiMock.json = mockJsonBeforeDelete
      apiMock.delete = mockDelete

      try {
        await deleteGateOverrides({
          gateId: 'gate_123',
          overrides: {},
        })
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Server Error')
        expect((error as Error).cause).toBe(originalError)
      }
    })
  })
})
