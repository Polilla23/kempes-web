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
  CalendarDays,
  Zap,
  ListTree,
  Award,
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
import { useTranslation } from 'react-i18next'

const navItems = [
  { key: 'home', icon: House, to: '/' },
  { key: 'standings', icon: ListOrdered, to: '/standings' },
  { key: 'fixture', icon: CalendarRange, to: '/fixture' },
  { key: 'statistics', icon: ChartColumn, to: '/stats' },
  { key: 'transfers', icon: ArrowLeftRight, to: '/transfers' },
]
const adminItems = [
  { key: 'users', icon: UserCog, to: '/management/users' },
  { key: 'clubs', icon: Shield, to: '/management/clubs' },
  { key: 'players', icon: Users, to: '/management/players' },
  { key: 'salaryRates', icon: CircleDollarSign, to: '/management/salary-rates' },
  { key: 'competitions', icon: Trophy, to: '/management/competitions' },
]
const fixtureItems = [
  { key: 'createLeague', icon: ListTree, to: '/management/fixtures/league/' },
  { key: 'createCup', icon: Award, to: '/management/fixtures/cup/' },
]
const configurationItems = [
  { key: 'eventTypes', icon: Zap, to: '/configuration/event-types' },
  { key: 'competitionTypes', icon: Trophy, to: '/configuration/competition-types' },
  { key: 'seasons', icon: CalendarDays, to: '/configuration/seasons' },
]

const NavbarContent = () => {
  const { role } = useUser()
  const { state: sidebarState } = useSidebar()
  const { t } = useTranslation('navigation')
  return (
    <>
      <SidebarGroup className={cn('pt-3', sidebarState === 'collapsed' && 'hidden')}>
        <SidebarGroupContent className="relative select-none">
          <Label htmlFor="search" className="sr-only select-none">
            {t('search')}
          </Label>
          <SidebarInput id="search" type="text" placeholder={`${t('search')}...`} className="pl-8" />
          <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarGroupLabel className="select-none">{t('menu.title')}</SidebarGroupLabel>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton asChild>
                  <Link className="select-none" to={item.to}>
                    <item.icon />
                    <span>{t(`menu.${item.key}`)}</span>
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
              <SidebarGroupLabel className="select-none">{t('management.title')}</SidebarGroupLabel>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <Link className="select-none" to={item.to}>
                      <item.icon />
                      <span>{t(`management.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarGroupLabel className="select-none mt-4">{t('fixtures.title')}</SidebarGroupLabel>
              {fixtureItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <Link className="select-none" to={item.to}>
                      <item.icon />
                      <span>{t(`fixtures.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {role === 'ADMIN' && (
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupLabel className="select-none">{t('configuration.title')}</SidebarGroupLabel>
              {configurationItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <Link className="select-none" to={item.to}>
                      <item.icon />
                      <span>{t(`configuration.${item.key}`)}</span>
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
