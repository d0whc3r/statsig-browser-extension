import { beforeEach, vi, describe, expect, it } from 'vitest'

import type { ExperimentOverridesResponse } from '@/src/types/statsig'

import { deleteExperimentOverrides, updateExperimentOverrides } from './experiment-overrides'

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

describe('experiment-overrides handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateExperimentOverrides', () => {
    it('should successfully update experiment overrides', async () => {
      const mockOverrides: ExperimentOverridesResponse = {
        overrides: [{ groupID: 'Control', name: 'gate_1', type: 'gate' }],
        userIDOverrides: [{ environment: 'Production', groupID: 'Test', ids: ['user_123'], unitType: 'userID' }],
      }
      posterMock.mockResolvedValue({
        data: mockOverrides,
        message: 'Success',
      })

      const result = await updateExperimentOverrides({
        experimentId: 'exp_123',
        overrides: mockOverrides,
      })

      expect(result).toStrictEqual(mockOverrides)
      expect(posterMock).toHaveBeenCalledWith('/experiments/exp_123/overrides', mockOverrides)
    })

    it('should throw error when update fails', async () => {
      posterMock.mockRejectedValue(new Error('Forbidden'))

      await expect(
        updateExperimentOverrides({
          experimentId: 'exp_123',
          overrides: {} as ExperimentOverridesResponse,
        }),
      ).rejects.toThrow('Forbidden')
    })

    it('should include original error as cause', async () => {
      const originalError = new Error('Network Error')
      posterMock.mockRejectedValue(originalError)

      await expect(
        updateExperimentOverrides({
          experimentId: 'exp_123',
          overrides: {} as ExperimentOverridesResponse,
        }),
      ).rejects.toMatchObject({
        cause: originalError,
        message: 'Network Error',
      })
    })
  })

  describe('deleteExperimentOverrides', () => {
    it('should successfully delete experiment overrides', async () => {
      const mockOverrides: ExperimentOverridesResponse = {
        overrides: [],
        userIDOverrides: [],
      }

      const mockJsonAfterDelete = vi.fn().mockResolvedValue({
        data: mockOverrides,
        message: 'Deleted',
      })
      const mockDelete = vi.fn().mockReturnValue({ json: mockJsonAfterDelete })
      const mockJsonBeforeDelete = vi.fn().mockReturnValue({ delete: mockDelete })
      const mockUrl = vi.fn().mockReturnValue({ json: mockJsonBeforeDelete })

      apiMock.url = mockUrl
      apiMock.json = mockJsonBeforeDelete
      apiMock.delete = mockDelete

      const result = await deleteExperimentOverrides({
        experimentId: 'exp_123',
        overrides: { userIDOverrides: [] },
      })

      expect(result).toStrictEqual(mockOverrides)
      expect(mockUrl).toHaveBeenCalledWith('/experiments/exp_123/overrides')
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
        deleteExperimentOverrides({
          experimentId: 'nonexistent',
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

      await expect(
        deleteExperimentOverrides({
          experimentId: 'exp_123',
          overrides: {},
        }),
      ).rejects.toMatchObject({
        cause: originalError,
        message: 'Server Error',
      })
    })
  })
})
