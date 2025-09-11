import { cn } from '@/lib/utils'
import { SidebarHeader, useSidebar } from '../ui/sidebar'
import { Button } from '../ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const NavbarHeader = () => {
  const { state: sidebarState, toggleSidebar } = useSidebar()
  return (
    <SidebarHeader className="flex flex-col items-center justify-center gap-2 select-none">
      <div className="flex w-full items-center justify-center select-none">
        <div className="flex flex-col items-center justify-center select-none">
          <img
            src="/images/120.png"
            alt="KML Logo"
            className={cn(
              'transition-all duration-300 select-none',
              sidebarState === 'expanded' ? 'h-16 w-16' : 'h-6 w-6'
            )}
          />
          <h2
            className={cn(
              'text-lg font-medium transition-all duration-300 mt-2 select-none',
              sidebarState === 'collapsed' && 'hidden'
            )}
          >
            Kempes Master League
          </h2>
          <p
            className={cn(
              'text-muted-foreground italic text-xs select-none mx-2 text-center transition-all duration-300',
              sidebarState === 'collapsed' && 'hidden'
            )}
          >
            Donde el futbol es vida y la gloria es la victoria...
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex self-start cursor-pointer select-none"
        >
          {sidebarState === 'expanded' ? (
            <PanelLeftClose className="size-4 " />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>
      </div>
    </SidebarHeader>
  )
}

export default NavbarHeader
