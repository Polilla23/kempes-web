import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar'
import NavbarHeader from './navbar-header'
import NavbarContent from './navbar-content'
import NavbarFooter from './navbar-footer'

export const Navbar = () => {
  return (
    <Sidebar collapsible="icon">
      <NavbarHeader />
      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          <NavbarContent />
        </div>
        <NavbarFooter />
      </SidebarContent>
      <SidebarRail className="select-none" />
    </Sidebar>
  )
}

export default Navbar
