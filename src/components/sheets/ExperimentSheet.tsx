import { useCallback, useMemo } from 'react'

import { ExperimentGroups } from '@/src/components/ExperimentGroups'
import { OverridesSection } from '@/src/components/modals/manage-experiment/OverridesSection'
import { useExperiment } from '@/src/hooks/use-experiment'
import { useOverrides } from '@/src/hooks/use-overrides'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage } from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

import { CommonSheet, SheetTabs } from './CommonSheet'
import { ExperimentSheetDetails } from './ExperimentSheetDetails'
import { ExperimentSheetHeader } from './ExperimentSheetHeader'

const useExperimentSheetState = () => {
  const { currentItemId, isItemSheetOpen, setItemSheetOpen, currentItemType } = useUIStore(
    (state) => state,
  )

  const [typeApiKey] = useWxtStorage<'write-key' | 'read-key'>(apiKeyTypeStorage)

  const isOpen = isItemSheetOpen && currentItemType === 'experiment'

  const {
    data: experiment,
    isLoading: isLoadingExperiment,
    error: experimentError,
  } = useExperiment(isOpen ? currentItemId : undefined)
  const {
    data: overridesData,
    isLoading: isLoadingOverrides,
    error: overridesError,
  } = useOverrides(isOpen ? currentItemId : undefined)

  const handleClose = useCallback(() => {
    setItemSheetOpen(false)
  }, [setItemSheetOpen])

  return {
    currentItemId,
    error: experimentError || overridesError,
    experiment,
    handleClose,
    isLoading: isLoadingExperiment || isLoadingOverrides,
    overridesData,
    typeApiKey,
  }
}

const noOp = () => {}

export const ExperimentSheet = () => {
  const { currentItemId, error, experiment, handleClose, isLoading, typeApiKey } =
    useExperimentSheetState()

  const detailsContent = useMemo(
    () => <ExperimentSheetDetails isLoading={isLoading} error={error} experiment={experiment} />,
    [isLoading, error, experiment],
  )

  const groupsContent = useMemo(
    () => (experiment ? <ExperimentGroups experiment={experiment} /> : null),
    [experiment],
  )

  const overridesContent = useMemo(() => <OverridesSection />, [])

  return (
    <CommonSheet type="experiment">
      <ExperimentSheetHeader
        isLoading={isLoading}
        experiment={experiment}
        currentItemId={currentItemId}
        typeApiKey={typeApiKey}
        onClose={handleClose}
        onManage={noOp} // No-op as manage button is removed
      />
      <SheetTabs
        detailsContent={detailsContent}
        rulesContent={groupsContent}
        overridesContent={overridesContent}
        labels={{ rules: 'Groups' }}
      />
    </CommonSheet>
  )
}
