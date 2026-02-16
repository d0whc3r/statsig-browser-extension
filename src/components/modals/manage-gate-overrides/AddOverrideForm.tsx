import { useCallback, memo, useState } from 'react'

import type { AddOverrideParams } from '@/src/components/common/GenericAddOverrideForm'
import type { FeatureGate } from '@/src/types/statsig'

import { GenericAddOverrideForm } from '@/src/components/common/GenericAddOverrideForm'

import type { AddGateOverrideParams, OverrideType } from './types'

interface AddOverrideFormProps {
  isPending: boolean
  onAddOverride: (params: AddGateOverrideParams) => void
  onCancel: () => void
  featureGate?: FeatureGate
}

const OVERRIDE_TYPE_VALUES: { label: string; value: OverrideType }[] = [
  { label: 'PASS', value: 'pass' },
  { label: 'FAIL', value: 'fail' },
]

export const AddOverrideForm = memo(
  ({ isPending, onAddOverride, onCancel, featureGate }: AddOverrideFormProps) => {
    const [overrideType, setOverrideType] = useState<OverrideType>('pass')

    const handleAddOverride = useCallback(
      ({ id, value, environment, idType }: AddOverrideParams<OverrideType>) => {
        onAddOverride({
          environment,
          idType,
          type: value,
          userId: id,
        })
      },
      [onAddOverride],
    )

    const handleValueChange = useCallback((val: OverrideType) => setOverrideType(val), [])

    const getSubmitButtonClassName = useCallback(
      (val: OverrideType) => (val === 'pass' ? 'bg-primary' : 'bg-destructive'),
      [],
    )

    const getSubmitButtonText = useCallback(
      (val: OverrideType) => `Add ${val.toUpperCase()} Override`,
      [],
    )

    return (
      <GenericAddOverrideForm
        isPending={isPending}
        onAddOverride={handleAddOverride}
        onCancel={onCancel}
        valueLabel="Override Type"
        values={OVERRIDE_TYPE_VALUES}
        selectedValue={overrideType}
        onValueChange={handleValueChange}
        defaultIdType={featureGate?.idType || 'userID'}
        getSubmitButtonClassName={getSubmitButtonClassName}
        getSubmitButtonText={getSubmitButtonText}
      />
    )
  },
)

AddOverrideForm.displayName = 'AddOverrideForm'
