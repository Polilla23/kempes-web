import { cn } from '@/lib/utils'
import { SidebarHeader, useSidebar } from '../ui/sidebar'
import { Button } from '../ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const NavbarHeader = () => {
  const { state: sidebarState, toggleSidebar } = useSidebar()
  return (
    <SidebarHeader className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full items-center justify-center">
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
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex self-start cursor-pointer"
        >
          {sidebarState === 'expanded' ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
      </div>
    </SidebarHeader>
  )
}

export default NavbarHeader
