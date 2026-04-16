import { beforeEach, vi, afterEach, describe, expect, it } from 'vitest'

import { getActionTypeColor, getActionTypeLabel, getDateFromAuditLog, getTagColor } from './audit-log-utils'

describe('audit-log-utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('maps action type keywords to colors', () => {
    expect(getActionTypeColor('CREATE_GATE')).toBe('default')
    expect(getActionTypeColor('delete_rule')).toBe('destructive')
    expect(getActionTypeColor('override_changed')).toBe('secondary')
  })

  it('returns outline for unknown action types', () => {
    expect(getActionTypeColor('noop')).toBe('outline')
  })

  it('formats action type label with first letter uppercase', () => {
    expect(getActionTypeLabel('created')).toBe('Created')
  })

  it('maps tag keywords to colors', () => {
    expect(getTagColor('staging-env')).toBe('secondary')
    expect(getTagColor('production')).toBe('destructive')
    expect(getTagColor('feature-preview')).toBe('default')
  })

  it('returns outline for unknown tags', () => {
    expect(getTagColor('qa')).toBe('outline')
  })

  it('parses date using "date time" format first', () => {
    const value = getDateFromAuditLog('2024-10-01', '12:34:56')
    expect(value.getFullYear()).toBe(2024)
    expect(value.getMonth()).toBe(9)
    expect(value.getDate()).toBe(1)
    expect(value.getHours()).toBe(12)
    expect(value.getMinutes()).toBe(34)
    expect(value.getSeconds()).toBe(56)
  })

  it('falls back to current date when value is invalid', () => {
    const value = getDateFromAuditLog('invalid-date', 'invalid-time')
    expect(value.toISOString()).toBe('2025-01-01T10:00:00.000Z')
  })
})
