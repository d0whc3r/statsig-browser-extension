import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHookWithProviders } from '@/src/tests/utils/TestUtils'

import { useExperimentMutations } from './use-experiment-mutations'

const { deleteMock, updateMock } = vi.hoisted(() => ({
  deleteMock: vi.fn(),
  updateMock: vi.fn(),
}))

vi.mock('@/src/handlers/experiment-overrides', () => ({
  deleteExperimentOverrides: deleteMock,
  updateExperimentOverrides: updateMock,
}))

const renderUseMutations = (props: Parameters<typeof useExperimentMutations>[0]) => {
  const rendered = renderHookWithProviders(() => useExperimentMutations(props))

  return { ...rendered, invalidateSpy: vi.spyOn(rendered.queryClient, 'invalidateQueries') }
}

describe('useExperimentMutations', () => {
  beforeEach(() => {
    deleteMock.mockReset()
    updateMock.mockReset()
  })

  it('invalidates the overrides query and calls onAddSuccess after update', async () => {
    updateMock.mockResolvedValue({ overrides: [], userIDOverrides: [] })
    const onAddSuccess = vi.fn()
    const { invalidateSpy, result } = renderUseMutations({
      currentItemId: 'exp_1',
      onAddSuccess,
    })

    act(() => {
      result.current.updateMutation({ experimentId: 'exp_1', overrides: { overrides: [], userIDOverrides: [] } })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy()
    })

    expect(updateMock).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['overrides', 'exp_1'] })
    expect(onAddSuccess).toHaveBeenCalled()
  })

  it('invalidates the overrides query and calls onDeleteSuccess after delete', async () => {
    deleteMock.mockResolvedValue({ overrides: [], userIDOverrides: [] })
    const onDeleteSuccess = vi.fn()
    const { invalidateSpy, result } = renderUseMutations({
      currentItemId: 'exp_2',
      onDeleteSuccess,
    })

    act(() => {
      result.current.deleteMutation({ experimentId: 'exp_2', overrides: {} })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy()
    })

    expect(deleteMock).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['overrides', 'exp_2'] })
    expect(onDeleteSuccess).toHaveBeenCalled()
  })

  it('skips invalidation when no currentItemId is provided', async () => {
    updateMock.mockResolvedValue({ overrides: [], userIDOverrides: [] })
    const { invalidateSpy, result } = renderUseMutations({ currentItemId: undefined })

    act(() => {
      result.current.updateMutation({ experimentId: 'exp_x', overrides: { overrides: [], userIDOverrides: [] } })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy()
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('does not throw when no success callback is provided', async () => {
    updateMock.mockResolvedValue({ overrides: [], userIDOverrides: [] })
    deleteMock.mockResolvedValue({ overrides: [], userIDOverrides: [] })
    const { result } = renderUseMutations({ currentItemId: 'exp_3' })

    act(() => {
      result.current.updateMutation({ experimentId: 'exp_3', overrides: { overrides: [], userIDOverrides: [] } })
    })
    act(() => {
      result.current.deleteMutation({ experimentId: 'exp_3', overrides: {} })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBeFalsy()
    })

    expect(updateMock).toHaveBeenCalled()
    expect(deleteMock).toHaveBeenCalled()
  })
})
