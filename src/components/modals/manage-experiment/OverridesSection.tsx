import { useOverridesSectionLogic } from '@/src/hooks/use-overrides-section-logic'

import { AddOverrideForm } from './AddOverrideForm'
import { OverridesList } from './OverridesList'
import { PageContextCard } from './PageContextCard'

export const OverridesSection = () => {
  const {
    addOverride,
    deleteOverride,
    detectedUser,
    detectedUserId,
    detectedUserOverrides,
    groups,
    handleBackClick,
    handleCreateOverrideClick,
    isDetectedUserOverridden,
    isPending,
    overridesData,
    typeApiKey,
    view,
    experiment,
  } = useOverridesSectionLogic()

  return (
    <div className="flex flex-col gap-6">
      <PageContextCard
        detectedUser={detectedUser || undefined}
        detectedUserId={detectedUserId || ''}
        isDetectedUserOverridden={isDetectedUserOverridden}
        detectedUserOverrides={detectedUserOverrides}
        canEdit={typeApiKey === 'write-key'}
        isPending={isPending}
        groups={groups}
        onAddOverride={(id, groupName, env, idType) =>
          addOverride(id, groupName, env || null, idType || null)
        }
        experiment={experiment}
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
          onCancel={handleBackClick}
          onAddOverride={addOverride}
          isPending={isPending}
          experiment={experiment}
        />
      )}
    </div>
  )
}
