import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { AuditLog } from '@/src/types/statsig'

import { useAuditLogFiltering } from './use-audit-log-filtering'

const makeLog = (overrides: Partial<AuditLog>): AuditLog =>
  ({
    actionType: 'created_gate',
    changeLog: '',
    modifierEmail: 'someone@example.com',
    name: 'My Gate',
    tags: [],
    updatedBy: 'someone',
    ...overrides,
  }) as AuditLog

describe('useAuditLogFiltering', () => {
  const logs: AuditLog[] = [
    makeLog({ actionType: 'created_gate', name: 'Gate Alpha' }),
    makeLog({ actionType: 'updated_condition', name: 'Gate Beta' }),
    makeLog({ actionType: 'deleted_experiment', name: 'Gamma Experiment' }),
    makeLog({ actionType: 'override_added', name: 'Override Item' }),
    makeLog({ actionType: 'started_rollout', name: 'Rollout Delta' }),
    makeLog({ actionType: 'edited_metric', name: 'Edited Metric' }),
    makeLog({ actionType: 'archived_old', name: 'Archive Thing' }),
    makeLog({ actionType: 'environment_added', name: 'Env Change' }),
    makeLog({ actionType: 'toggled_off', name: 'Toggled Off Gate' }),
  ]

  it('returns all logs when actionFilter is "all" and no filterValue', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, '', 'all'))
    expect(result.current).toHaveLength(logs.length)
  })

  it('matches "create" with create and start actions', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, '', 'create'))
    const names = result.current.map((log) => log.name)
    expect(names).toContain('Gate Alpha')
    expect(names).toContain('Rollout Delta')
    expect(names).not.toContain('Gate Beta')
  })

  it('matches "update" with update, edit, condition actions', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, '', 'update'))
    const names = result.current.map((log) => log.name)
    expect(names).toContain('Gate Beta')
    expect(names).toContain('Edited Metric')
  })

  it('matches "delete" with delete, archive, toggle actions', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, '', 'delete'))
    const names = result.current.map((log) => log.name)
    expect(names).toContain('Gamma Experiment')
    expect(names).toContain('Archive Thing')
    expect(names).toContain('Toggled Off Gate')
  })

  it('matches "override" with override and environment actions', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, '', 'override'))
    const names = result.current.map((log) => log.name)
    expect(names).toContain('Override Item')
    expect(names).toContain('Env Change')
  })

  it('falls through to all logs for an unknown filter', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, '', 'unknown-filter'))
    expect(result.current).toHaveLength(logs.length)
  })

  it('fuzzy-searches by name when filterValue is provided', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, 'Alpha', 'all'))
    expect(result.current.some((log) => log.name === 'Gate Alpha')).toBeTruthy()
  })

  it('combines action filter with text search', () => {
    const { result } = renderHook(() => useAuditLogFiltering(logs, 'Delta', 'create'))
    expect(result.current.map((log) => log.name)).toContain('Rollout Delta')
  })
})
