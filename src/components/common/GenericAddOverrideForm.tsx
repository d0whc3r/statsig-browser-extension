import { Loader2 } from 'lucide-react'
import React, { memo, useCallback, useEffect, useState } from 'react'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { useUnitIDTypes } from '@/src/hooks/use-unit-id-types'

export interface GenericAddOverrideFormProps<TValue> {
  isPending: boolean
  onAddOverride: (
    id: string,
    value: TValue,
    environment: string | null,
    idType: string | null,
  ) => void
  onCancel: () => void
  // Value selection (Pass/Fail or Group)
  valueLabel: string
  values: { label: string; value: TValue }[]
  selectedValue: TValue
  onValueChange: (value: TValue) => void
  // ID Type configuration
  defaultIdType?: string
  // Customization
  getSubmitButtonClassName?: (value: TValue) => string
  getSubmitButtonText?: (value: TValue) => string
}

const GenericAddOverrideFormInternal = <TValue extends string>({
  isPending,
  onAddOverride,
  onCancel,
  valueLabel,
  values,
  selectedValue,
  onValueChange,
  defaultIdType = 'userID',
  getSubmitButtonClassName,
  getSubmitButtonText,
}: GenericAddOverrideFormProps<TValue>) => {
  const [id, setId] = useState('')
  const [environment, setEnvironment] = useState<string>('Production')
  const [idType, setIdType] = useState<string>(defaultIdType)

  const { data: availableIdTypes = ['userID', 'stableID'] } = useUnitIDTypes()

  // Update idType if defaultIdType changes (e.g. when switching entities)
  useEffect(() => {
    setIdType(defaultIdType)
  }, [defaultIdType])

  const handleAdd = useCallback(() => {
    const env = environment === 'All Environments' ? null : environment
    onAddOverride(id, selectedValue, env, idType)
  }, [id, selectedValue, environment, idType, onAddOverride])

  const handleIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setId(event.target.value)
  }, [])

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Value Selection (Pass/Fail or Group) */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="override-value">{valueLabel}</Label>
          <Select value={selectedValue} onValueChange={onValueChange}>
            <SelectTrigger id="override-value">
              <SelectValue placeholder={`Select ${valueLabel.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {values.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Environment Selection */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="environment">Environment</Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger id="environment">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Environments">All Environments</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ID Type Selection */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="id-type">ID Type</Label>
          <Select value={idType} onValueChange={setIdType}>
            <SelectTrigger id="id-type">
              <SelectValue placeholder="Select ID Type" />
            </SelectTrigger>
            <SelectContent>
              {availableIdTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ID Input */}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="id-value">ID Value</Label>
          <Input id="id-value" placeholder="Enter ID" value={id} onChange={handleIdChange} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={isPending || !id}
            onClick={handleAdd}
            className={getSubmitButtonClassName?.(selectedValue)}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : undefined}
            {getSubmitButtonText?.(selectedValue) ?? 'Add Override'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Cast to a generic component to export
export const GenericAddOverrideForm = memo(GenericAddOverrideFormInternal) as <
  TValue extends string,
>(
  props: GenericAddOverrideFormProps<TValue>,
) => React.ReactElement
