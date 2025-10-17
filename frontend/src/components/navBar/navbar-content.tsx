import {
  ArrowLeftRight,
  CalendarRange,
  ChartColumn,
  CircleDollarSign,
  House,
  Search,
  Shield,
  Trophy,
  UserCog,
  Users,
  ListOrdered,
} from 'lucide-react'
import { Label } from '../ui/label'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useUser } from '@/context/UserContext'

const navItems = [
  { label: 'Home', icon: House, to: '/' },
  { label: 'Standings', icon: ListOrdered, to: '/standings' },
  { label: 'Fixture', icon: CalendarRange, to: '/fixture' },
  { label: 'Statistics', icon: ChartColumn, to: '/stats' },
  { label: 'Transfers', icon: ArrowLeftRight, to: '/transfers' },
]
const adminItems = [
  { label: 'Users', icon: UserCog, to: '/management/users' },
  { label: 'Clubs', icon: Shield, to: '/management/clubs' },
  { label: 'Players', icon: Users, to: '/management/players' },
  { label: 'Salary Rates', icon: CircleDollarSign, to: '/management/salary-rates' },
  { label: 'Competitions', icon: Trophy, to: '/management/competitions' },
]

const NavbarContent = () => {
  const { role } = useUser()
  const { state: sidebarState } = useSidebar()
  return (
    <>
      <SidebarGroup className={cn('pt-3', sidebarState === 'collapsed' && 'hidden')}>
        <SidebarGroupContent className="relative select-none">
          <Label htmlFor="search" className="sr-only select-none">
            Search
          </Label>
          <SidebarInput id="search" type="text" placeholder="Search..." className="pl-8" />
          <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarGroupLabel className="select-none">Navigation</SidebarGroupLabel>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <Link className="select-none" to={item.to}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {role === 'ADMIN' && (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupLabel className="select-none"> Management & Administration</SidebarGroupLabel>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link className="select-none" to={item.to}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  )
}
export default NavbarContent
