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
import { useUser } from '@/context/UserContext'

const NavbarFooter = () => {
  const navigate = useNavigate()
  const { logout } = useUser()
  const { state: sidebarState } = useSidebar()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login', search: { redirect: '/login' } })
  }
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Preferences</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <ModeToggle />
          <SidebarMenuButton className="cursor-pointer" onClick={handleLogout}>
            <LogOut className="size-4" />
            {sidebarState === 'expanded' && <span>Logout</span>}
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavbarFooter
