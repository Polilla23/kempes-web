import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from 'react-i18next'
import type { DashboardMatch } from '@/services/dashboard.service'

function getCompetitionColor(format: string) {
  switch (format) {
    case 'CUP':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

function ClubBox({ club, align = 'left' }: { club: { name: string; logo?: string | null } | null; align?: 'left' | 'right' }) {
  const name = club?.name ?? 'TBD'
  const abbr = name.slice(0, 3).toUpperCase()

  return (
    <div className={`flex items-center gap-2 flex-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 border border-border bg-muted flex-shrink-0">
        <AvatarImage src={club?.logo ?? undefined} alt={name} />
        <AvatarFallback className="text-[10px] font-bold">{abbr}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium truncate">{name}</span>
    </div>
  )
}

interface UpcomingMatchesCardProps {
  matches: DashboardMatch[]
  isLoading?: boolean
}

export function UpcomingMatchesCard({ matches, isLoading }: UpcomingMatchesCardProps) {
  const { t } = useTranslation('dashboard')

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-base">{t('upcoming.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">{t('upcoming.noMatches')}</p>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-secondary/50 border border-border rounded-xl p-3 hover:border-primary/30 transition-colors"
            >
              {/* Competition badge */}
              <div className="mb-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${getCompetitionColor(match.competition.competitionType.format)}`}
                >
                  {match.competition.name}
                </Badge>
              </div>

              {/* Match info */}
              <div className="flex items-center gap-2">
                <ClubBox club={match.homeClub} align="left" />
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground">{t('upcoming.vs')}</span>
                </div>
                <ClubBox club={match.awayClub} align="right" />
              </div>

              {/* Matchday */}
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                J{match.matchdayOrder} · {match.isUserHome ? t('upcoming.home') : t('upcoming.away')}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
