import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation('home')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            © {currentYear} Kempes Master League. {t('footer.rights')}.
          </p>
          <p className="flex items-center gap-1">
            {t('footer.madeWith')} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {t('footer.by')}{' '}
            <span className="font-medium text-foreground">KML Team</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
