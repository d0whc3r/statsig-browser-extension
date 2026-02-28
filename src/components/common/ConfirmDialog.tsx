import { memo, useCallback } from 'react'

import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export const ConfirmDialog = memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'destructive',
  }: ConfirmDialogProps) => {
    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open) {
          onClose()
        }
      },
      [onClose],
    )

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={variant} onClick={onConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
)

ConfirmDialog.displayName = 'ConfirmDialog'
