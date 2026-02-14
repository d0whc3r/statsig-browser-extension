import React, { useCallback, useState } from 'react'

import type { Group } from '@/src/types/statsig'

import { UpdateGroupSection } from '@/src/components/modals/manage-experiment/UpdateGroupSection'
import { GroupsTable } from '@/src/components/tables/GroupsTable'

type View = 'form' | 'table'

export const GroupsSection = () => {
  const [view, setView] = useState<View>('table')
  const [currentGroup, setCurrentGroup] = useState<Group | undefined>()

  const changeView = useCallback(() => {
    setView((state) => (state === 'table' ? 'form' : 'table'))
  }, [])

  return (
    <div className="flex flex-col justify-between gap-4 pt-4">
      {view === 'table' ? (
        <GroupsTable changeView={changeView} setCurrentGroup={setCurrentGroup} />
      ) : (
        currentGroup && <UpdateGroupSection changeView={changeView} group={currentGroup} />
      )}
    </div>
  )
}
