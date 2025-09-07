import { Moon, Sun, LaptopMinimal } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const { state: sidebarState } = useSidebar()

  const toggleTheme = () => {
    switch (theme) {
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('system')
        break
      case 'system':
        setTheme('light')
        break
      default:
        setTheme('light')
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      case 'dark':
        return <Moon className="size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      case 'system':
        return <LaptopMinimal className="size-4" />
      default:
        return <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    }
  }

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Light'
    }
  }

  return (
    <SidebarMenuButton className="cursor-pointer select-none" onClick={toggleTheme}>
      <div
        className={cn(
          'flex items-center justify-center w-full',
          sidebarState === 'expanded' ? 'justify-start' : 'justify-center'
        )}
      >
        {getThemeIcon()}
        {sidebarState === 'expanded' && <span className="ml-2">{getThemeText()}</span>}
      </div>
    </SidebarMenuButton>
  )
}
