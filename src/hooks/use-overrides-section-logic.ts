import { useCallback, useMemo, useState } from 'react'

import { useExperiment } from '@/src/hooks/use-experiment'
import { useExperimentMutations } from '@/src/hooks/use-experiment-mutations'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useStore } from '@/src/store/use-store'

type View = 'form' | 'table'

const useOverridesFormState = (onSuccess: () => void, currentItemId: string | undefined) => {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [overrideId, setOverrideId] = useState('')

  const { addMutation: mutate, isAdding: isPending } = useExperimentMutations({
    currentItemId: currentItemId ?? '',
    onAddSuccess: () => {
      onSuccess()
      setOverrideId('')
      setSelectedGroup('')
    },
  })

  const addOverride = useCallback(() => {
    if (!currentItemId) {
      return
    }
    mutate({
      experimentId: currentItemId,
      override: { groupID: selectedGroup, ids: [overrideId] },
    })
  }, [currentItemId, mutate, selectedGroup, overrideId])

  return { addOverride, isPending, overrideId, selectedGroup, setOverrideId, setSelectedGroup }
}

export const useOverridesSectionLogic = () => {
  const [typeApiKey] = useLocalStorage('statsig-type-api-key', 'read-key')
  const [view, setView] = useState<View>('table')
  const { currentItemId } = useStore((state) => state)
  const { data: experiment } = useExperiment(currentItemId)
  const groups = useMemo(() => experiment?.groups || [], [experiment?.groups])

  const { addOverride, isPending, overrideId, selectedGroup, setOverrideId, setSelectedGroup } =
    useOverridesFormState(() => setView('table'), currentItemId)

  const handleCreateOverrideClick = useCallback(() => setView('form'), [])
  const handleBackClick = useCallback(() => setView('table'), [])
  const handleOverrideIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setOverrideId(event.target.value),
    [setOverrideId],
  )

  return {
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
  }
}
