import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface StandingsLegendProps {
  type: 'league' | 'cup-groups'
  activeZones?: string[]
}

const ZONE_CONFIG: Record<string, { color: string; borderColor: string; labelKey: string }> = {
  champion:           { color: 'bg-yellow-500/20',  borderColor: 'border-l-yellow-500',  labelKey: 'legend.champion' },
  liguilla:           { color: 'bg-purple-500/20',  borderColor: 'border-l-purple-500',  labelKey: 'legend.liguilla' },
  triangular:         { color: 'bg-purple-500/20',  borderColor: 'border-l-purple-500',  labelKey: 'legend.triangular' },
  promotion:          { color: 'bg-green-500/20',   borderColor: 'border-l-green-500',   labelKey: 'legend.promotion' },
  promotion_playoff:  { color: 'bg-blue-500/20',    borderColor: 'border-l-blue-500',    labelKey: 'legend.promotionPlayoff' },
  playout:            { color: 'bg-orange-500/20',   borderColor: 'border-l-orange-500',  labelKey: 'legend.playout' },
  relegation:         { color: 'bg-red-500/20',     borderColor: 'border-l-red-500',     labelKey: 'legend.relegation' },
  relegation_playoff: { color: 'bg-red-300/20',     borderColor: 'border-l-red-300',     labelKey: 'legend.relegationPlayoff' },
  reducido:           { color: 'bg-cyan-500/20',    borderColor: 'border-l-cyan-500',    labelKey: 'legend.reducido' },
  playoff:            { color: 'bg-blue-500/20',    borderColor: 'border-l-blue-500',    labelKey: 'legend.playoff' },
  gold_cup:           { color: 'bg-amber-500/20 dark:bg-amber-400/20', borderColor: 'border-l-amber-600 dark:border-l-amber-500', labelKey: 'legend.qualifyGold' },
  silver_cup:         { color: 'bg-slate-400/20 dark:bg-slate-300/20', borderColor: 'border-l-slate-400 dark:border-l-slate-400', labelKey: 'legend.qualifySilver' },
}

export function StandingsLegend({ type, activeZones = [] }: StandingsLegendProps) {
  const { t } = useTranslation('standings')

  const zonesToShow = type === 'cup-groups'
    ? ['gold_cup', 'silver_cup']
    : activeZones.filter(z => ZONE_CONFIG[z])

  if (zonesToShow.length === 0) return null

  return (
    <Card className="mt-6">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {zonesToShow.map(zone => {
            const config = ZONE_CONFIG[zone]
            if (!config) return null
            return (
              <div key={zone} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${config.color} border-l-4 ${config.borderColor} rounded`} />
                <span>{t(config.labelKey)}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
