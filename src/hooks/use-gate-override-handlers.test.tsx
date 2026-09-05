import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeGateOverride } from '@/src/tests/fixtures/statsig'
import { renderHookWithProviders } from '@/src/tests/utils/TestUtils'

import { useGateOverrideHandlers } from './use-gate-override-handlers'

const updateGateOverrides = vi.fn()
const deleteGateOverrides = vi.fn()

vi.mock('@/src/handlers/gate-overrides', () => ({
  deleteGateOverrides: (...args: unknown[]) => deleteGateOverrides(...args),
  updateGateOverrides: (...args: unknown[]) => updateGateOverrides(...args),
}))

describe('useGateOverrideHandlers', () => {
  beforeEach(() => {
    updateGateOverrides.mockReset().mockResolvedValue({})
    deleteGateOverrides.mockReset().mockResolvedValue({})
  })

  it('is a no-op when there is no current item', () => {
    const setView = vi.fn()
    const { result } = renderHookWithProviders(() => useGateOverrideHandlers(undefined, setView))

    act(() => {
      result.current.handleAddOverride({ type: 'pass', userId: 'u_1' })
      result.current.handleDeleteOverride({ type: 'pass', userId: 'u_1' })
    })

    expect(updateGateOverrides).not.toHaveBeenCalled()
    expect(deleteGateOverrides).not.toHaveBeenCalled()
  })

  it('adds a root passing user and switches back to the table on success', async () => {
    const setView = vi.fn()
    const { result } = renderHookWithProviders(() => useGateOverrideHandlers('gate-1', setView, makeGateOverride()))

    act(() => {
      result.current.handleAddOverride({ type: 'pass', userId: 'u_1' })
    })

    await waitFor(() => {
      expect(updateGateOverrides.mock.calls[0]?.[0]).toStrictEqual({
        gateId: 'gate-1',
        overrides: expect.objectContaining({ passingUserIDs: ['u_1'] }),
      })
    })
    await waitFor(() => {
      expect(setView).toHaveBeenCalledWith('table')
    })
  })

  it('adds a failing user and does not duplicate an existing id', async () => {
    const setView = vi.fn()
    const existing = makeGateOverride({ failingUserIDs: ['u_fail'], passingUserIDs: ['u_pass'] })
    const { result } = renderHookWithProviders(() => useGateOverrideHandlers('gate-1', setView, existing))

    act(() => {
      result.current.handleAddOverride({ type: 'fail', userId: 'u_fail' })
      result.current.handleAddOverride({ type: 'pass', userId: 'u_pass' })
    })

    await waitFor(() => {
      expect(updateGateOverrides).toHaveBeenCalled()
    })
    const payloads = updateGateOverrides.mock.calls.map(
      (call) => (call[0] as { overrides: { failingUserIDs: string[] } }).overrides,
    )
    expect(
      payloads.every((payload) => payload.failingUserIDs.filter((id) => id === 'u_fail').length === 1),
    ).toBeTruthy()
  })

  it('adds an environment override for non-userID types even without an environment', async () => {
    const setView = vi.fn()
    const { result } = renderHookWithProviders(() => useGateOverrideHandlers('gate-1', setView))

    act(() => {
      result.current.handleAddOverride({ environment: null, idType: 'stableID', type: 'pass', userId: 's_1' })
    })

    await waitFor(() => {
      expect(updateGateOverrides.mock.calls[0]?.[0]).toStrictEqual({
        gateId: 'gate-1',
        overrides: expect.objectContaining({
          environmentOverrides: [{ environment: null, failingIDs: [], passingIDs: ['s_1'], unitID: 'stableID' }],
        }),
      })
    })
  })

  it('appends to an existing environment group and creates a new group when needed', async () => {
    const setView = vi.fn()
    const existing = makeGateOverride({
      environmentOverrides: [{ environment: 'Production', failingIDs: [], passingIDs: ['already'], unitID: 'userID' }],
    })
    const { result } = renderHookWithProviders(() => useGateOverrideHandlers('gate-1', setView, existing))

    act(() => {
      result.current.handleAddOverride({ environment: 'Production', idType: 'userID', type: 'fail', userId: 'u_new' })
      result.current.handleAddOverride({ environment: 'Staging', idType: 'userID', type: 'pass', userId: 'u_stg' })
    })

    await waitFor(() => {
      expect(updateGateOverrides.mock.calls.length).toBeGreaterThan(0)
    })
  })

  it('deletes via a root payload and an environment payload', async () => {
    const setView = vi.fn()
    const { result } = renderHookWithProviders(() => useGateOverrideHandlers('gate-1', setView))

    act(() => {
      result.current.handleDeleteOverride({ type: 'pass', userId: 'u_1' })
      result.current.handleDeleteOverride({
        environment: 'Production',
        idType: 'stableID',
        type: 'fail',
        userId: 's_1',
      })
    })

    await waitFor(() => {
      expect(deleteGateOverrides).toHaveBeenCalledTimes(2)
    })
    expect(deleteGateOverrides.mock.calls.map((call) => call[0])).toStrictEqual([
      { gateId: 'gate-1', overrides: { passingUserIDs: ['u_1'] } },
      {
        gateId: 'gate-1',
        overrides: {
          environmentOverrides: [
            { environment: 'Production', failingIDs: ['s_1'], passingIDs: [], unitID: 'stableID' },
          ],
        },
      },
    ])
  })

  it('switches between form and table views', () => {
    const setView = vi.fn()
    const { result } = renderHookWithProviders(() => useGateOverrideHandlers('gate-1', setView))

    act(() => {
      result.current.handleSwitchToForm()
      result.current.handleSwitchToTable()
    })

    expect(setView).toHaveBeenCalledWith('form')
    expect(setView).toHaveBeenCalledWith('table')
  })
})
