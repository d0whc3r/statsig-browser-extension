import { useCallback } from 'react'

import { Dialog, DialogContent } from '@/src/components/ui/dialog'
import { useStore } from '@/src/store/use-store'

import { AuthForm } from './AuthForm'

export const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen, setSettingsSheetOpen } = useStore((state) => state)

  const handleSuccess = useCallback(() => {
    setAuthModalOpen(false)
    setSettingsSheetOpen(true)
  }, [setAuthModalOpen, setSettingsSheetOpen])

  const handlePointerDownOutside = useCallback((event: Event) => {
    event.preventDefault()
  }, [])

  const handleEscapeKeyDown = useCallback((event: Event) => {
    event.preventDefault()
  }, [])

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent
        className="sm:max-w-[425px] [&>button]:hidden"
        onPointerDownOutside={handlePointerDownOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <AuthForm onSuccess={handleSuccess} isOpen={isAuthModalOpen} />
      </DialogContent>
    </Dialog>
  )
}
