import { LogOut, Settings, User } from 'lucide-react'
import { memo, useCallback } from 'react'

import statsigLogo from '@/assets/statsig_full.png'
import packageJson from '@/package.json'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { useUIStore } from '@/src/store/use-ui-store'

interface HeaderProps {
  onLogout: () => void
}

export const Header = memo(({ onLogout }: HeaderProps) => {
  const { setUserDetailsSheetOpen, setSettingsSheetOpen } = useUIStore((state) => state)

  const handleOpenUserDetails = useCallback(() => {
    setUserDetailsSheetOpen(true)
  }, [setUserDetailsSheetOpen])

  const handleOpenSettings = useCallback(() => {
    setSettingsSheetOpen(true)
  }, [setSettingsSheetOpen])

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
      <div className="flex items-center gap-2">
        <img src={statsigLogo} alt="Statsig" className="h-6" />
        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md leading-none">
          v{packageJson.version}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Account Settings</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Manage your preferences
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpenUserDetails} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>User Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
})
Header.displayName = 'Header'
