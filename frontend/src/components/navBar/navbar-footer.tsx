import { useNavigate } from '@tanstack/react-router'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from '../ui/sidebar'
import { LogOut } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useUser } from '@/context/UserContext'
import { useTranslation } from 'react-i18next'

const NavbarFooter = () => {
  const navigate = useNavigate()
  const { logout } = useUser()
  const { state: sidebarState } = useSidebar()
  const { t } = useTranslation('navigation')

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login', search: { redirect: '/' } })
  }
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="select-none">{t('preferences')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <ModeToggle />
          <LanguageSwitcher />
          <SidebarMenuButton className="cursor-pointer select-none" onClick={handleLogout}>
            <LogOut className="size-4 select-none" />
            {sidebarState === 'expanded' && <span>{t('logout')}</span>}
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavbarFooter
