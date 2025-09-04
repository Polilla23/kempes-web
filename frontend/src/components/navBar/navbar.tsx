import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar'
import NavbarHeader from './navbar-header'
import NavbarContent from './navbar-content'
import NavbarFooter from './navbar-footer'

export const Navbar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          <NavbarHeader />
          <NavbarContent />
        </div>
      </SidebarContent>
      <NavbarFooter />
      <SidebarRail />
    </Sidebar>
  )
}

export default Navbar
