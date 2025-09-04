import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const { state: sidebarState } = useSidebar()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <SidebarMenuButton className="cursor-pointer" onClick={toggleTheme}>
      <div
        className={cn(
          'flex items-center justify-center w-full',
          sidebarState === 'expanded' ? 'justify-start' : 'justify-center'
        )}
      >
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        {sidebarState === 'expanded' && <span className="ml-2">{theme === 'light' ? 'Light' : 'Dark'}</span>}
      </div>
    </SidebarMenuButton>
  )
}
