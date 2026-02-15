import { ExperimentPageContextCard } from '@/src/components/ExperimentPageContextCard'
import { useOverridesSectionLogic } from '@/src/hooks/use-overrides-section-logic'

import { CreateOverrideForm } from './CreateOverrideForm'
import { OverridesList } from './OverridesList'

export const OverridesSection = () => {
  const {
    addOverride,
    detectedUser,
    detectedUserId,
    groups,
    handleBackClick,
    handleCreateOverrideClick,
    handleOverrideValueChange,
    isDetectedUserOverridden,
    isPending,
    overrideValue,
    selectedGroup,
    setSelectedGroup,
    typeApiKey,
    view,
    overrideType,
    setOverrideType,
    featureGates,
    setOverrideValue,
  } = useOverridesSectionLogic()

  return (
    <div className="flex flex-col justify-between gap-4 pt-4">
      {view === 'table' ? (
        <>
          <ExperimentPageContextCard
            detectedUser={detectedUser || undefined}
            detectedUserId={detectedUserId || ''}
            isDetectedUserOverridden={isDetectedUserOverridden}
            canEdit={typeApiKey === 'write-key'}
            isPending={isPending}
            groups={groups}
            onAddOverride={addOverride}
          />
          <OverridesList
            typeApiKey={typeApiKey}
            onCreateOverrideClick={handleCreateOverrideClick}
          />
        </>
      ) : (
        <CreateOverrideForm
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectedGroupChange={setSelectedGroup}
          overrideValue={overrideValue}
          onOverrideValueChange={handleOverrideValueChange}
          setOverrideValue={setOverrideValue}
          onBackClick={handleBackClick}
          onAddOverride={addOverride}
          isPending={isPending}
          overrideType={overrideType}
          onOverrideTypeChange={setOverrideType}
          featureGates={featureGates}
        />
      )}
    </div>
  )
}
