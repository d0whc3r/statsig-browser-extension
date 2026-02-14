import { X } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import type { Override } from '@/src/hooks/use-overrides'

import { Button } from '@/src/components/ui/button'

interface OverrideGroupProps {
  override: Override
  groupName: string
  currentLocalStorageValue: string
  canEdit: boolean
  onSave: (id: string) => void
  onDelete: (groupId: string, id: string) => void
}

interface OverrideButtonProps {
  id: string
  groupID: string
  isSelected: boolean
  canEdit: boolean
  onSave: (id: string) => void
  onDelete: (groupId: string, id: string) => void
}

const OverrideButton = memo(
  ({ id, groupID, isSelected, canEdit, onSave, onDelete }: OverrideButtonProps) => {
    const handleSave = useCallback(() => {
      onSave(id)
    }, [id, onSave])

    const handleDeleteClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation()
        onDelete(groupID, id)
      },
      [groupID, id, onDelete],
    )

    const handleDeleteKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation()
          onDelete(groupID, id)
        }
      },
      [groupID, id, onDelete],
    )

    return (
      <Button
        variant={isSelected ? 'default' : 'secondary'}
        className={isSelected ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
        size="sm"
        onClick={handleSave}
        title={`User ID: ${id}`}
      >
        {id}
        {canEdit && (
          <span
            // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="button"
            tabIndex={0}
            className="ml-2 rounded-full p-0.5 hover:bg-white/20"
            onClick={handleDeleteClick}
            onKeyDown={handleDeleteKeyDown}
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </Button>
    )
  },
)

OverrideButton.displayName = 'OverrideButton'

export const OverrideGroup = memo(
  ({
    override,
    groupName,
    currentLocalStorageValue,
    canEdit,
    onSave,
    onDelete,
  }: OverrideGroupProps) => {
    if (override.ids.length === 0) {
      // eslint-disable-next-line unicorn/no-null
      return null
    }

    return (
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">{groupName}</p>
        <div className="flex flex-wrap gap-2">
          {override.ids.map((id) => (
            <OverrideButton
              key={id}
              id={id}
              groupID={override.groupID}
              isSelected={currentLocalStorageValue === id}
              canEdit={canEdit}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    )
  },
)

OverrideGroup.displayName = 'OverrideGroup'
