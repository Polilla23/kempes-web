import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import type { ZoneDescription } from '../_types/standings.types'

interface StandingsLegendProps {
  type: 'league' | 'cup-groups'
  activeZones?: string[]
  zoneDescriptions?: ZoneDescription[]
}

const ZONE_CONFIG = {
  champion:           { color: 'bg-yellow-500/20',  borderColor: 'border-l-yellow-500',  labelKey: 'legend.champion' },
  liguilla:           { color: 'bg-purple-500/20',  borderColor: 'border-l-purple-500',  labelKey: 'legend.liguilla' },
  triangular:         { color: 'bg-purple-500/20',  borderColor: 'border-l-purple-500',  labelKey: 'legend.triangular' },
  promotion:          { color: 'bg-green-500/20',   borderColor: 'border-l-green-500',   labelKey: 'legend.promotion' },
  promotion_playoff:  { color: 'bg-blue-500/20',    borderColor: 'border-l-blue-500',    labelKey: 'legend.promotionPlayoff' },
  playout:            { color: 'bg-orange-500/20',  borderColor: 'border-l-orange-500',  labelKey: 'legend.playout' },
  relegation:         { color: 'bg-red-500/20',     borderColor: 'border-l-red-500',     labelKey: 'legend.relegation' },
  relegation_playoff: { color: 'bg-red-300/20',     borderColor: 'border-l-red-300',     labelKey: 'legend.relegationPlayoff' },
  reducido:           { color: 'bg-cyan-500/20',    borderColor: 'border-l-cyan-500',    labelKey: 'legend.reducido' },
  playoff:            { color: 'bg-blue-500/20',    borderColor: 'border-l-blue-500',    labelKey: 'legend.playoff' },
  gold_cup:           { color: 'bg-amber-500/20 dark:bg-amber-400/20', borderColor: 'border-l-amber-600 dark:border-l-amber-500', labelKey: 'legend.qualifyGold' },
  silver_cup:         { color: 'bg-slate-400/20 dark:bg-slate-300/20', borderColor: 'border-l-slate-400 dark:border-l-slate-400', labelKey: 'legend.qualifySilver' },
} as const satisfies Record<string, { color: string; borderColor: string; labelKey: string }>

type ZoneKey = keyof typeof ZONE_CONFIG
type ZoneConfigValue = (typeof ZONE_CONFIG)[ZoneKey]

function getZoneConfig(zone: string): ZoneConfigValue | undefined {
  return (ZONE_CONFIG as Record<string, ZoneConfigValue>)[zone]
}

/**
 * Formatea un rango de posiciones: "1°", "1° - 4°", "5°, 7°"
 */
function formatPositionRange(positions: number[]): string {
  if (positions.length === 0) return ''
  if (positions.length === 1) return `${positions[0]}°`

  const sorted = [...positions].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  // Verificar si son consecutivas
  const isConsecutive = sorted.every((pos, i) => i === 0 || pos === sorted[i - 1] + 1)

  if (isConsecutive) {
    return min === max ? `${min}°` : `${min}° - ${max}°`
  }

  // No consecutivas: mostrar individualmente
  return sorted.map(p => `${p}°`).join(', ')
}

/**
 * Obtiene la clave i18n para el nombre de la ronda del reducido
 */
function getRoundLabelKey(roundName: string): string {
  switch (roundName) {
    case 'quarterfinal': return 'legend.roundQuarterfinal'
    case 'semifinal': return 'legend.roundSemifinal'
    case 'final': return 'legend.roundFinal'
    default: return 'legend.roundGeneric'
  }
}

export function StandingsLegend({ type, activeZones = [], zoneDescriptions }: StandingsLegendProps) {
  const { t } = useTranslation('standings')

  // Copa: mostrar swatches simples de oro/plata
  if (type === 'cup-groups') {
    const cupZones = ['gold_cup', 'silver_cup']
    return (
      <Card className="mt-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {cupZones.map(zone => {
              const config = getZoneConfig(zone)
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

  // Liga con descripciones detalladas
  if (zoneDescriptions && zoneDescriptions.length > 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            {t('legend.references')}
          </h4>
          <div className="space-y-2 text-sm">
            {zoneDescriptions.map((desc) => {
              const config = getZoneConfig(desc.zone)
              if (!config) return null

              const posLabel = formatPositionRange(desc.positions)

              return (
                <div key={desc.zone}>
                  {/* Fila principal de zona */}
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${config.color} border-l-4 ${config.borderColor} rounded shrink-0`} />
                    <span className="text-muted-foreground font-mono text-xs w-14 text-left shrink-0">
                      {posLabel}
                    </span>
                    <span>{t(config.labelKey)}</span>
                    {desc.detail && !desc.reducidoRounds && (
                      <span className="text-muted-foreground text-xs">
                        ({t(`legend.${desc.detail}` as any)})
                      </span>
                    )}
                  </div>

                  {/* Sub-items del reducido */}
                  {desc.reducidoRounds && desc.reducidoRounds.length > 0 && (
                    <div className="ml-[5.5rem] pl-3 border-l-2 border-muted space-y-0.5 mt-1 mb-1">
                      {desc.reducidoRounds.map((round, idx) => {
                        const isLast = idx === desc.reducidoRounds!.length - 1
                        const roundLabel = round.roundName.startsWith('round')
                          ? t('legend.roundGeneric', { n: round.roundName.replace('round', '') } as any)
                          : t(getRoundLabelKey(round.roundName) as any)

                        return (
                          <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="shrink-0">{isLast ? '└' : '├'}</span>
                            <span>
                              {round.type === 'start'
                                ? t('legend.reducidoStart', { a: round.positions![0], b: round.positions![1] } as any)
                                : t('legend.reducidoWaiting', { pos: round.waitingPosition } as any)
                              }
                            </span>
                            <span className="text-muted-foreground/60">
                              ({roundLabel})
                            </span>
                          </div>
                        )
                      })}
                      {desc.detail && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mt-0.5">
                          <span>→</span>
                          <span>{t(`legend.${desc.detail}` as any)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Fallback: leyenda simple (para snapshots antiguos sin zoneDescriptions)
  const zonesToShow = activeZones.filter(z => getZoneConfig(z))
  if (zonesToShow.length === 0) return null

  return (
    <Card className="mt-6">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {zonesToShow.map(zone => {
            const config = getZoneConfig(zone)
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
