import { useOverridesSectionLogic } from '@/src/hooks/use-overrides-section-logic'

import { CreateOverrideForm } from './CreateOverrideForm'
import { OverridesList } from './OverridesList'

export const OverridesSection = () => {
  const {
    addOverride,
    groups,
    handleBackClick,
    handleCreateOverrideClick,
    handleOverrideIdChange,
    isPending,
    overrideId,
    selectedGroup,
    setSelectedGroup,
    typeApiKey,
    view,
  } = useOverridesSectionLogic()

  return (
    <div className="flex flex-col justify-between gap-4 pt-4">
      {view === 'table' ? (
        <OverridesList typeApiKey={typeApiKey} onCreateOverrideClick={handleCreateOverrideClick} />
      ) : (
        <CreateOverrideForm
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectedGroupChange={setSelectedGroup}
          overrideId={overrideId}
          onOverrideIdChange={handleOverrideIdChange}
          onBackClick={handleBackClick}
          onAddOverride={addOverride}
          isPending={isPending}
        />
      )}
    </div>
  )
}
