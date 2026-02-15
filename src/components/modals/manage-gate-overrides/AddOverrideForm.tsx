import { memo, useState } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { GenericAddOverrideForm } from '@/src/components/common/GenericAddOverrideForm'

import type { OverrideType } from './types'

interface AddOverrideFormProps {
  isPending: boolean
  onAddOverride: (
    userId: string,
    type: OverrideType,
    environment: string | null,
    idType: string | null,
  ) => void
  onCancel: () => void
  featureGate?: FeatureGate
}

export const AddOverrideForm = memo(
  ({ isPending, onAddOverride, onCancel, featureGate }: AddOverrideFormProps) => {
    const [overrideType, setOverrideType] = useState<OverrideType>('pass')

    return (
      <GenericAddOverrideForm
        isPending={isPending}
        onAddOverride={onAddOverride}
        onCancel={onCancel}
        valueLabel="Override Type"
        values={[
          { label: 'PASS', value: 'pass' },
          { label: 'FAIL', value: 'fail' },
        ]}
        selectedValue={overrideType}
        onValueChange={(val) => setOverrideType(val as OverrideType)}
        defaultIdType={featureGate?.idType || 'userID'}
        getSubmitButtonClassName={(val) => (val === 'pass' ? 'bg-primary' : 'bg-destructive')}
        getSubmitButtonText={(val) => `Add ${val.toUpperCase()} Override`}
      />
    )
  },
)

AddOverrideForm.displayName = 'AddOverrideForm'
