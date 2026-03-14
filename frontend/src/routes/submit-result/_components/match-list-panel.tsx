import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, Shield, Check, CalendarClock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { PendingMatch } from '@/services/submit-result.service'

interface MatchListPanelProps {
  matches: PendingMatch[]
  selectedMatchId: string | null
  onSelectMatch: (matchId: string) => void
  isLoading: boolean
  seasonNumber: number | null
}

interface PlazoGroup {
  plazoId: string | null
  title: string
  order: number
  deadline: string | null
  isOpen: boolean
  matches: PendingMatch[]
}

const getCompetitionColors = (typeName: string) => {
  const name = typeName.toUpperCase()
  if (name.includes('GOLD')) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
  if (name.includes('SILVER')) return 'bg-gray-400/20 text-gray-500 border-gray-400/40'
  if (name.includes('KEMPES') || name.includes('CINDOR') || name.includes('SUPER'))
    return 'bg-primary/10 text-primary border-primary/30'
  return 'bg-muted text-muted-foreground border-transparent'
}

const getKnockoutRoundLabel = (round: string | null, matchdayOrder: number) => {
  if (!round) return `Fecha ${matchdayOrder}`
  const labels: Record<string, string> = {
    FINAL: 'Final',
    SEMIFINAL: 'Semifinal',
    QUARTERFINAL: 'Cuartos de Final',
    ROUND_OF_16: 'Octavos de Final',
    ROUND_OF_32: '32avos de Final',
    ROUND_OF_64: '64avos de Final',
  }
  return labels[round] || round
}

const formatDeadline = (deadline: string, locale: string) => {
  try {
    const date = new Date(deadline)
    return date.toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return deadline
  }
}

const isOverdue = (deadline: string) => {
  try {
    return new Date(deadline) < new Date()
  } catch {
    return false
  }
}

export function MatchListPanel({
  matches,
  selectedMatchId,
  onSelectMatch,
  isLoading,
  seasonNumber,
}: MatchListPanelProps) {
  const { t, i18n } = useTranslation('submitResult')

  const plazoGroups = useMemo(() => {
    const groupMap = new Map<string, PlazoGroup>()

    for (const match of matches) {
      const key = match.plazo?.id ?? '__no_plazo__'

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          plazoId: match.plazo?.id ?? null,
          title: match.plazo?.title ?? t('pendingMatches.noPlazo'),
          order: match.plazo?.order ?? 999,
          deadline: match.plazo?.deadline ?? null,
          isOpen: match.plazo?.isOpen ?? false,
          matches: [],
        })
      }

      groupMap.get(key)!.matches.push(match)
    }

    return Array.from(groupMap.values()).sort((a, b) => a.order - b.order)
  }, [matches, t])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle className="text-foreground">{t('pendingMatches.title')}</CardTitle>
        </div>
        {seasonNumber != null && (
          <p className="text-sm text-muted-foreground">
            {t('pendingMatches.seasonLabel', { season: seasonNumber })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('pendingMatches.empty')}
          </p>
        ) : (
          plazoGroups.map((group) => (
            <div key={group.plazoId ?? 'no-plazo'} className="space-y-2">
              {/* Plazo group header */}
              <div className="flex items-center gap-2 px-1">
                {group.plazoId ? (
                  <CalendarClock className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {group.title}
                  </span>
                  {group.deadline && (
                    <span
                      className={cn(
                        'text-xs shrink-0',
                        isOverdue(group.deadline)
                          ? 'text-red-500 font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      {isOverdue(group.deadline) ? '⚠ ' : ''}
                      {t('pendingMatches.dueDate', {
                        date: formatDeadline(group.deadline, i18n.language),
                      })}
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {group.matches.length}
                </Badge>
              </div>

              {/* Matches in this group */}
              <div className="space-y-2">
                {group.matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => onSelectMatch(match.id)}
                    className={cn(
                      'w-full text-left bg-secondary/50 border rounded-xl p-4 transition-all hover:border-primary/50',
                      selectedMatchId === match.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border'
                    )}
                  >
                    {/* Competition badge + plazo badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] gap-1',
                            getCompetitionColors(match.competition.competitionType.name)
                          )}
                        >
                          {match.competition.competitionType.format === 'CUP' ? (
                            <Trophy className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {match.competition.name}
                        </Badge>
                        {match.plazo && (
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-1 bg-blue-500/10 text-blue-600 border-blue-500/30"
                          >
                            <CalendarClock className="w-3 h-3" />
                            {match.plazo.title}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Matchday */}
                    <p className="text-xs text-muted-foreground mb-2">
                      {getKnockoutRoundLabel(match.knockoutRound, match.matchdayOrder)}
                    </p>

                    {/* Teams */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-8 h-8 rounded flex items-center justify-center text-xs font-bold border overflow-hidden',
                            match.isUserHome
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {match.homeClub.logo ? (
                            <img
                              src={match.homeClub.logo}
                              alt={match.homeClub.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            match.homeClub.name.substring(0, 3).toUpperCase()
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            match.isUserHome && 'text-primary'
                          )}
                        >
                          {match.homeClub.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            !match.isUserHome && 'text-primary'
                          )}
                        >
                          {match.awayClub.name}
                        </span>
                        <div
                          className={cn(
                            'w-8 h-8 rounded flex items-center justify-center text-xs font-bold border overflow-hidden',
                            !match.isUserHome
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {match.awayClub.logo ? (
                            <img
                              src={match.awayClub.logo}
                              alt={match.awayClub.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            match.awayClub.name.substring(0, 3).toUpperCase()
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedMatchId === match.id && (
                      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-primary/20 text-primary text-xs font-medium">
                        <Check className="w-4 h-4" />
                        {t('pendingMatches.selected')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
