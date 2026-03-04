import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomeStandings } from '@/services/home.service'

interface UserStandingsSectionProps {
  homeStandings: HomeStandings | null
  userClubId: string | null
  isLoading: boolean
  className?: string
}

function getZoneColor(zone?: string | null) {
  switch (zone) {
    case 'champion':
      return 'text-yellow-500'
    case 'liguilla':
    case 'triangular':
      return 'text-purple-500'
    case 'promotion':
      return 'text-emerald-500'
    case 'promotion_playoff':
      return 'text-blue-500'
    case 'playout':
      return 'text-orange-500'
    case 'playoff':
      return 'text-blue-500'
    case 'relegation':
      return 'text-destructive'
    case 'relegation_playoff':
      return 'text-red-400'
    case 'reducido':
      return 'text-cyan-500'
    default:
      return 'text-muted-foreground'
  }
}

const ZONE_LEGEND_CONFIG: Record<string, { color: string; labelKey: string }> = {
  champion:           { color: 'bg-yellow-500',  labelKey: 'legend.champion' },
  liguilla:           { color: 'bg-purple-500',  labelKey: 'legend.liguilla' },
  triangular:         { color: 'bg-purple-500',  labelKey: 'legend.triangular' },
  promotion:          { color: 'bg-emerald-500', labelKey: 'legend.promotion' },
  promotion_playoff:  { color: 'bg-blue-500',    labelKey: 'legend.promotionPlayoff' },
  playout:            { color: 'bg-orange-500',   labelKey: 'legend.playout' },
  relegation:         { color: 'bg-destructive',  labelKey: 'legend.relegation' },
  relegation_playoff: { color: 'bg-red-400',      labelKey: 'legend.relegationPlayoff' },
  reducido:           { color: 'bg-cyan-500',     labelKey: 'legend.reducido' },
}

export function UserStandingsSection({
  homeStandings,
  userClubId,
  isLoading,
  className,
}: UserStandingsSectionProps) {
  const { t } = useTranslation('home')

  if (isLoading) {
    return (
      <Card className={cn('bg-card border-border h-full flex flex-col', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!homeStandings) {
    return (
      <Card className={cn('bg-card border-border h-full flex flex-col', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">{t('standings.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('standings.subtitle')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-1 py-12">
          <p className="text-muted-foreground text-center">{t('standings.noLeague')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-card border-border h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">{homeStandings.competitionName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('standings.subtitle')}
              {homeStandings.matchesPlayed > 0 && (
                <span className="ml-1">
                  · {homeStandings.matchesPlayed}/{homeStandings.matchesTotal}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
          <Link to="/standings">
            {t('standings.viewFull')} <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                <th className="w-10 py-3 pl-6 pr-3 text-center">#</th>
                <th className="py-3 px-3 text-left">{t('standings.team')}</th>
                <th className="w-10 py-3 px-1 text-center">{t('standings.played')}</th>
                <th className="w-10 py-3 px-1 text-center">{t('standings.won')}</th>
                <th className="w-10 py-3 px-1 text-center">{t('standings.drawn')}</th>
                <th className="w-10 py-3 px-1 text-center">{t('standings.lost')}</th>
                <th className="w-10 py-3 px-1 text-center hidden md:table-cell">{t('standings.goalsFor')}</th>
                <th className="w-10 py-3 px-1 text-center hidden md:table-cell">{t('standings.goalsAgainst')}</th>
                <th className="w-12 py-3 px-1 text-center">{t('standings.goalDifference')}</th>
                <th className="w-12 py-3 px-2 text-center">{t('standings.points')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {homeStandings.standings.map((team) => {
                const isUserTeam = team.clubId === userClubId

                return (
                  <tr
                    key={team.clubId}
                    className={cn(
                      'transition-colors hover:bg-muted/50',
                      isUserTeam && 'bg-primary/10'
                    )}
                  >
                    <td className="py-3 pl-6 pr-3 text-center">
                      <span className={getZoneColor(team.zone)}>
                        {team.position}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border shrink-0">
                          {team.clubLogo ? (
                            <img src={team.clubLogo} alt={team.clubName} className="w-5 h-5 object-contain" />
                          ) : (
                            team.clubName.slice(0, 3).toUpperCase()
                          )}
                        </div>
                        <span
                          className={cn(
                            'font-medium hover:text-primary transition-colors',
                            isUserTeam && 'text-primary font-semibold'
                          )}
                        >
                          {team.clubName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-1 text-center text-muted-foreground">{team.played}</td>
                    <td className="py-3 px-1 text-center text-muted-foreground">{team.won}</td>
                    <td className="py-3 px-1 text-center text-muted-foreground">{team.drawn}</td>
                    <td className="py-3 px-1 text-center text-muted-foreground">{team.lost}</td>
                    <td className="py-3 px-1 text-center text-muted-foreground hidden md:table-cell">
                      {team.goalsFor}
                    </td>
                    <td className="py-3 px-1 text-center text-muted-foreground hidden md:table-cell">
                      {team.goalsAgainst}
                    </td>
                    <td className="py-3 px-1 text-center text-muted-foreground">
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-foreground">{team.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend - dynamic based on active zones */}
        {homeStandings.activeZones && homeStandings.activeZones.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-t border-border text-xs text-muted-foreground">
            {homeStandings.activeZones.map((zone) => {
              const config = ZONE_LEGEND_CONFIG[zone]
              if (!config) return null
              return (
                <div key={zone} className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', config.color)} />
                  <span>{t(config.labelKey, { ns: 'standings' })}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
