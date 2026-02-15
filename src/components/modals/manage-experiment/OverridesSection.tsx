import { useOverridesSectionLogic } from '@/src/hooks/use-overrides-section-logic'

import { AddOverrideForm } from './AddOverrideForm'
import { OverridesList } from './OverridesList'
import { PageContextCard } from './PageContextCard'

export const OverridesSection = () => {
  const {
    addOverride,
    deleteOverride,
    currentItemId,
    detectedUser,
    detectedUserId,
    groups,
    handleBackClick,
    handleCreateOverrideClick,
    handleOverrideValueChange,
    isDetectedUserOverridden,
    isPending,
    overridesData,
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
    <div className="flex flex-col gap-6">
      <PageContextCard
        detectedUser={detectedUser || undefined}
        detectedUserId={detectedUserId || ''}
        isDetectedUserOverridden={isDetectedUserOverridden}
        canEdit={typeApiKey === 'write-key'}
        isPending={isPending}
        groups={groups}
        onAddOverride={addOverride}
      />

      {view === 'table' ? (
        <OverridesList
          canEdit={typeApiKey === 'write-key'}
          onCreateOverrideClick={handleCreateOverrideClick}
          overridesData={overridesData}
          onDeleteOverride={deleteOverride}
          isPending={isPending}
        />
      ) : (
        <AddOverrideForm
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectedGroupChange={setSelectedGroup}
          overrideValue={overrideValue}
          onOverrideValueChange={handleOverrideValueChange}
          setOverrideValue={setOverrideValue}
          onCancel={handleBackClick}
          onAddOverride={() => addOverride()}
          isPending={isPending}
          overrideType={overrideType}
          onOverrideTypeChange={setOverrideType}
          featureGates={featureGates}
        />
      )}
    </div>
  )
}
