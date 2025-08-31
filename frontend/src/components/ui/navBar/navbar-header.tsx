import { cn } from '@/lib/utils'
import { SidebarHeader, useSidebar } from '../sidebar'
import { Button } from '../button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const NavbarHeader = () => {
  const { state: sidebarState, toggleSidebar } = useSidebar()
  return (
    <SidebarHeader className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full items-center justify-center pl-3">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/images/120.png"
            alt="KML Logo"
            className={cn(
              'transition-all duration-300',
              sidebarState === 'expanded' ? 'h-16 w-16' : 'h-6 w-6'
            )}
          />
          <h2
            className={cn(
              'text-lg font-medium transition-all duration-300 mt-2',
              sidebarState === 'collapsed' && 'hidden'
            )}
          >
            Kempes Master League
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex self-start">
          {sidebarState === 'expanded' ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>
    </SidebarHeader>
  )
}

export default NavbarHeader
