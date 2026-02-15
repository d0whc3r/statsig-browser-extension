import { useCallback, useMemo } from 'react'

import { ExperimentGroups } from '@/src/components/ExperimentGroups'
import { ExperimentOverrides } from '@/src/components/ExperimentOverrides'
import { useExperiment } from '@/src/hooks/use-experiment'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useOverrides } from '@/src/hooks/use-overrides'
import { STORAGE_KEYS } from '@/src/lib/storage-keys'
import { useUIStore } from '@/src/store/use-ui-store'

import { CommonSheet, SheetTabs } from './CommonSheet'
import { ExperimentSheetDetails } from './ExperimentSheetDetails'
import { ExperimentSheetHeader } from './ExperimentSheetHeader'

const useExperimentSheetState = () => {
  const {
    currentItemId,
    isItemSheetOpen,
    setItemSheetOpen,
    setManageExperimentModalOpen,
    currentItemType,
  } = useUIStore((state) => state)

  const [typeApiKey] = useLocalStorage(STORAGE_KEYS.API_KEY_TYPE, 'read-key')

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

  const handleManage = useCallback(() => {
    setManageExperimentModalOpen(true)
  }, [setManageExperimentModalOpen])

  return {
    currentItemId,
    error: experimentError || overridesError,
    experiment,
    handleClose,
    handleManage,
    isLoading: isLoadingExperiment || isLoadingOverrides,
    overridesData,
    typeApiKey,
  }
}

export const ExperimentSheet = () => {
  const {
    currentItemId,
    error,
    experiment,
    handleClose,
    handleManage,
    isLoading,
    overridesData,
    typeApiKey,
  } = useExperimentSheetState()

  const detailsContent = useMemo(
    () => <ExperimentSheetDetails isLoading={isLoading} error={error} experiment={experiment} />,
    [isLoading, error, experiment],
  )

  const groupsContent = useMemo(
    () => (experiment ? <ExperimentGroups experiment={experiment} /> : null),
    [experiment],
  )

  const overridesContent = useMemo(
    () =>
      overridesData && experiment ? (
        <ExperimentOverrides overrides={overridesData.userIDOverrides} groups={experiment.groups} />
      ) : null,
    [overridesData, experiment],
  )

  return (
    <CommonSheet type="experiment">
      <ExperimentSheetHeader
        isLoading={isLoading}
        experiment={experiment}
        currentItemId={currentItemId}
        typeApiKey={typeApiKey}
        onClose={handleClose}
        onManage={handleManage}
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
