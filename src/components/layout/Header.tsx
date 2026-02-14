import { LogOut, Settings, User } from 'lucide-react'
import { memo, useCallback } from 'react'

import statsigLogo from '@/assets/statsig-logo.png'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { useStore } from '@/src/store/use-store'

interface HeaderProps {
  onNavigate: (tab: string) => void
  onLogout: () => void
}

export const Header = memo(({ onNavigate, onLogout }: HeaderProps) => {
  const { setUserDetailsSheetOpen, setSettingsSheetOpen } = useStore((state) => state)

  const handleNavigateAuditLogs = useCallback(() => {
    onNavigate('audit_logs')
  }, [onNavigate])

  const handleOpenUserDetails = useCallback(() => {
    setUserDetailsSheetOpen(true)
  }, [setUserDetailsSheetOpen])

  const handleOpenSettings = useCallback(() => {
    setSettingsSheetOpen(true)
  }, [setSettingsSheetOpen])

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
      <div className="flex items-center gap-2">
        <img src={statsigLogo} alt="Statsig" className="h-8" />
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleNavigateAuditLogs}>Audit Logs</DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenUserDetails}>
              <User className="mr-2 h-4 w-4" />
              User Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
})
Header.displayName = 'Header'
