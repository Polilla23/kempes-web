import { Link, useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../sidebar'
import { ChevronRight, LogOut, Moon, Sun, UserRound } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '../button'
import { useTheme } from '@/context/theme-provider'
import { useUser } from '@/context/UserContext'

const NavbarFooter = () => {
  const navigate = useNavigate()
  const { logout } = useUser()
  const { state: sidebarState } = useSidebar()
  const { setTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login', search: { redirect: '/login' } })
  }
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Preferences</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarState === 'expanded' ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Link
                        to="/"
                        className="flex items-center justify-between w-full py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          <span>Theme</span>
                        </span>
                        <ChevronRight className="size-4" />
                      </Link>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Link
                        to="/"
                        className="flex items-center justify-between w-full py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <UserRound className="size-4" />
                          <span>Profile</span>
                        </span>
                        <ChevronRight className="size-4" />
                      </Link>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/" className="flex items-center w-full">
                          <UserRound className="size-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="size-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <>
              <SidebarMenuItem className="flex justify-center">
                <ModeToggle variant="ghost" />
              </SidebarMenuItem>
              <SidebarMenuItem className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserRound className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" alignOffset={-8}>
                    <DropdownMenuItem asChild>
                      <Link to="/" className="flex items-center">
                        <UserRound className="size-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="size-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default NavbarFooter
