import { useNavigate } from '@tanstack/react-router'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '../ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronsUpDown, LogOut, Settings, Sun, Moon, Monitor, Languages, Check } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useTheme } from '@/context/theme-provider'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ProfileSettingsDialog } from '@/components/profile-settings-dialog'

const NavbarFooter = () => {
  const navigate = useNavigate()
  const { email, username, avatar, logout } = useUser()
  const { theme, setTheme } = useTheme()
  const { state: sidebarState, isMobile } = useSidebar()
  const { t, i18n } = useTranslation(['navigation', 'common'])
  const [profileOpen, setProfileOpen] = useState(false)

  const displayName = username || email || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login', search: { redirect: '/' } })
  }

  const currentLang = i18n.language

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar ?? undefined} alt={displayName} />
                  <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
                </Avatar>
                {sidebarState === 'expanded' && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {username || t('common:profile.noUsername')}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{email}</span>
                  </div>
                )}
                {sidebarState === 'expanded' && (
                  <ChevronsUpDown className="ml-auto size-4" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar ?? undefined} alt={displayName} />
                  <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {username || t('common:profile.noUsername')}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages className="mr-2 size-4" />
                  {t('navigation:userMenu.language')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                    <span className="mr-2">🇬🇧</span>
                    English
                    {currentLang === 'en' && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => i18n.changeLanguage('es')}>
                    <span className="mr-2">🇪🇸</span>
                    Español
                    {currentLang === 'es' && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 size-4" />
                  {t('navigation:userMenu.theme')}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 size-4" />
                    {t('common:theme.light')}
                    {theme === 'light' && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 size-4" />
                    {t('common:theme.dark')}
                    {theme === 'dark' && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 size-4" />
                    {t('common:theme.system')}
                    {theme === 'system' && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <Settings className="mr-2 size-4" />
                {t('navigation:userMenu.profileSettings')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                {t('navigation:userMenu.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ProfileSettingsDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}

export default NavbarFooter
