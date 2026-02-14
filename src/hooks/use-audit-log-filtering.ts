import Fuse from 'fuse.js'
import { useMemo } from 'react'

import type { AuditLog } from '@/src/types/statsig'

export const useAuditLogFiltering = (
  auditLogs: AuditLog[],
  filterValue: string,
  actionFilter: string,
) =>
  useMemo(() => {
    let filtered = auditLogs

    // 1. Filter by Action Type
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => {
        const action = log.actionType.toLowerCase()
        if (actionFilter === 'create') {
          return action.includes('create') || action.includes('start')
        }
        if (actionFilter === 'update') {
          return (
            action.includes('update') || action.includes('edit') || action.includes('condition')
          )
        }
        if (actionFilter === 'delete') {
          return (
            action.includes('delete') || action.includes('archive') || action.includes('toggle')
          )
        }
        if (actionFilter === 'override') {
          return action.includes('override') || action.includes('environment')
        }
        return true
      })
    }

    // 2. Filter by Search
    if (filterValue) {
      const fuseInstance = new Fuse(filtered, {
        keys: ['name', 'actionType', 'changeLog', 'updatedBy', 'modifierEmail', 'tags'],
        threshold: 0.3,
      })
      filtered = fuseInstance.search(filterValue).map((result) => result.item)
    }

    return filtered
  }, [auditLogs, filterValue, actionFilter])
