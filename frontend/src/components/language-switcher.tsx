import { useTranslation } from 'react-i18next'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { state: sidebarState } = useSidebar()

  const currentLanguage = languages.find(
    (lang) => lang.code === i18n.language
  ) || languages[0]

  const toggleLanguage = () => {
    const currentIndex = languages.findIndex((lang) => lang.code === i18n.language)
    const nextIndex = (currentIndex + 1) % languages.length
    i18n.changeLanguage(languages[nextIndex].code)
  }

  return (
    <SidebarMenuButton className="cursor-pointer select-none" onClick={toggleLanguage}>
      <div
        className={cn(
          'flex items-center justify-center w-full',
          sidebarState === 'expanded' ? 'justify-start' : 'justify-center'
        )}
      >
        <Languages className="size-4" />
        {sidebarState === 'expanded' && <span className="ml-2">{currentLanguage.label}</span>}
      </div>
    </SidebarMenuButton>
  )
}
