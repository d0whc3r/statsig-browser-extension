import { useCallback } from 'react'

import { ExperimentOverrides } from '@/src/components/ExperimentOverrides'
import { ExperimentRules } from '@/src/components/ExperimentRules'
import { useExperiment } from '@/src/hooks/use-experiment'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useOverrides } from '@/src/hooks/use-overrides'
import { useStore } from '@/src/store/use-store'

import { CommonSheet, SheetTabs } from './CommonSheet'
import { ExperimentSheetDetails } from './ExperimentSheetDetails'
import { ExperimentSheetHeader } from './ExperimentSheetHeader'

export const ExperimentSheet = () => {
  const {
    currentItemId,
    isItemSheetOpen,
    setItemSheetOpen,
    setManageExperimentModalOpen,
    currentItemType,
  } = useStore((state) => state)

  const [typeApiKey] = useLocalStorage('statsig-type-api-key', 'read-key')

  const isOpen = isItemSheetOpen && currentItemType === 'experiment'

  const {
    data: experiment,
    isLoading: isLoadingExperiment,
    error: experimentError,
  } = useExperiment(isOpen ? currentItemId : undefined)
  const {
    data: overrides,
    isLoading: isLoadingOverrides,
    error: overridesError,
  } = useOverrides(isOpen ? currentItemId : undefined)

  const isLoading = isLoadingExperiment || isLoadingOverrides
  const error = experimentError || overridesError

  const handleClose = useCallback(() => {
    setItemSheetOpen(false)
  }, [setItemSheetOpen])

  const handleManage = useCallback(() => {
    setManageExperimentModalOpen(true)
  }, [setManageExperimentModalOpen])

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
        detailsContent={
          <ExperimentSheetDetails isLoading={isLoading} error={error} experiment={experiment} />
        }
        rulesContent={currentItemId && <ExperimentRules experimentId={currentItemId} />}
        overridesContent={
          overrides &&
          experiment && <ExperimentOverrides overrides={overrides} groups={experiment.groups} />
        }
      />
    </CommonSheet>
  )
}
