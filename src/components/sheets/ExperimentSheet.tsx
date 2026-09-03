import { useMemo } from 'react'

import { ExperimentGroups } from '@/src/components/ExperimentGroups'
import { OverridesSection } from '@/src/components/modals/manage-experiment/OverridesSection'
import { useExperiment } from '@/src/hooks/use-experiment'
import { useOverrides } from '@/src/hooks/use-overrides'
import { useUIStore } from '@/src/store/use-ui-store'

import { CommonSheet, SheetTabs } from './CommonSheet'
import { ExperimentSheetDetails } from './ExperimentSheetDetails'
import { ExperimentSheetHeader } from './ExperimentSheetHeader'

const useExperimentSheetState = () => {
  const { currentItemId, isItemSheetOpen, currentItemType } = useUIStore((state) => state)

  const isOpen = isItemSheetOpen && currentItemType === 'experiment'

  const {
    data: experiment,
    isLoading: isLoadingExperiment,
    error: experimentError,
  } = useExperiment(isOpen ? currentItemId : undefined)
  const { isLoading: isLoadingOverrides, error: overridesError } = useOverrides(isOpen ? currentItemId : undefined)

  return {
    error: experimentError ?? overridesError,
    experiment,
    isLoading: isLoadingExperiment || isLoadingOverrides,
  }
}

export function ExperimentSheet() {
  const { error, experiment, isLoading } = useExperimentSheetState()

  const detailsContent = useMemo(
    () => <ExperimentSheetDetails isLoading={isLoading} error={error} experiment={experiment} />,
    [isLoading, error, experiment],
  )

  const groupsContent = useMemo(() => (experiment ? <ExperimentGroups experiment={experiment} /> : null), [experiment])

  const overridesContent = useMemo(() => <OverridesSection />, [])

  return (
    <CommonSheet type="experiment">
      <ExperimentSheetHeader isLoading={isLoading} experiment={experiment} />
      <SheetTabs
        detailsContent={detailsContent}
        rulesContent={groupsContent}
        overridesContent={overridesContent}
        labels={{ rules: 'Groups' }}
      />
    </CommonSheet>
  )
}
