import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from '@/components/ui/sidebar'
import NavbarHeader from './navbar-header'
import NavbarContent from './navbar-content'
import NavbarFooter from './navbar-footer'

export const Navbar = () => {
  return (
    <Sidebar collapsible="icon">
      <NavbarHeader />
      <SidebarContent>
        <NavbarContent />
      </SidebarContent>
      <SidebarFooter>
        <NavbarFooter />
      </SidebarFooter>
      <SidebarRail className="select-none after:bg-transparent hover:after:bg-primary/30 after:transition-colors after:duration-200" />
    </Sidebar>
  )
}

export default Navbar
