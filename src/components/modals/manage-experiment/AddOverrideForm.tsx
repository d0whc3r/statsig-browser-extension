import { memo, useState } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { GenericAddOverrideForm } from '@/src/components/common/GenericAddOverrideForm'

interface CreateOverrideFormProps {
  groups: { name: string }[]
  onAddOverride: (
    id: string,
    groupName: string,
    environment: string | null,
    idType: string | null,
  ) => void
  onCancel: () => void
  isPending: boolean
  experiment?: Experiment
}

export const AddOverrideForm = memo(
  ({ groups, onAddOverride, onCancel, isPending, experiment }: CreateOverrideFormProps) => {
    // Default to first group or empty
    const [selectedGroup, setSelectedGroup] = useState<string>(groups[0]?.name || '')

    return (
      <GenericAddOverrideForm
        isPending={isPending}
        onAddOverride={onAddOverride}
        onCancel={onCancel}
        valueLabel="Group"
        values={groups.map((g) => ({ label: g.name, value: g.name }))}
        selectedValue={selectedGroup}
        onValueChange={setSelectedGroup}
        defaultIdType={experiment?.idType || 'userID'}
        getSubmitButtonClassName={() => 'bg-primary'}
        getSubmitButtonText={(val) => `Add Override to ${val}`}
      />
    )
  },
)

AddOverrideForm.displayName = 'AddOverrideForm'
