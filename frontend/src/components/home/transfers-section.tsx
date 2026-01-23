import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft, ExternalLink, Construction } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransfersSectionProps {
  className?: string
}

export function TransfersSection({ className }: TransfersSectionProps) {
  const { t } = useTranslation('home')

  // Placeholder - transfers feature not implemented yet
  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            {t('transfers.title')}
          </CardTitle>
          <Button variant="ghost" size="sm" disabled className="text-xs gap-1">
            {t('transfers.viewAll')}
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{t('transfers.comingSoon')}</p>
        </div>
      </CardContent>
    </Card>
  )
}
