import React, { useCallback } from 'react'

import { Input } from '@/src/components/ui/input'
import { useSettingsStore } from '@/src/store/use-settings-store'

interface ProjectLabelInputProps {
  projectId: string
  label: string
}

export function ProjectLabelInput({ label, projectId }: Readonly<ProjectLabelInputProps>) {
  const updateProject = useSettingsStore((state) => state.updateProject)

  const rename = useCallback(
    (next: string) => {
      const value = next.trim()
      if (value && value !== label) {
        void updateProject(projectId, { label: value })
      }
    },
    [label, projectId, updateProject],
  )

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      rename(event.target.value)
    },
    [rename],
  )

  // The settings sheet is already a form, so Enter must save the name instead of saving the settings.
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        rename(event.currentTarget.value)
      }
    },
    [rename],
  )

  return (
    <Input
      defaultValue={label}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label="Project name"
      className="h-7 text-sm font-medium"
    />
  )
}
