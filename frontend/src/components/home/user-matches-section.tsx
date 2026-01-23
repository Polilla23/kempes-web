import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserMatch } from '@/services/home.service'

interface UserMatchesSectionProps {
  matches: UserMatch[]
  isLoading: boolean
  className?: string
}

const resultColors = {
  W: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  D: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  L: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
}

function MatchRow({ match }: { match: UserMatch }) {
  const { t } = useTranslation('home')

  const opponent = match.isUserHome ? match.awayClub : match.homeClub
  const userGoals = match.isUserHome ? match.homeClubGoals : match.awayClubGoals
  const opponentGoals = match.isUserHome ? match.awayClubGoals : match.homeClubGoals

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
      {/* Result Badge */}
      <Badge
        variant="outline"
        className={cn('w-8 h-8 rounded-lg font-bold text-sm justify-center shrink-0', resultColors[match.result])}
      >
        {t(`userMatches.${match.result === 'W' ? 'win' : match.result === 'D' ? 'draw' : 'loss'}`)}
      </Badge>

      {/* Opponent */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0 border border-border">
          {opponent.logo ? (
            <img src={opponent.logo} alt={opponent.name} className="w-7 h-7 object-contain" />
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground">
              {opponent.name.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{opponent.name}</p>
          <p className="text-xs text-muted-foreground truncate">{match.competition.name}</p>
        </div>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-foreground tabular-nums">
          {userGoals} - {opponentGoals}
        </p>
        <p className="text-xs text-muted-foreground">{match.isUserHome ? 'Local' : 'Visitante'}</p>
      </div>
    </div>
  )
}

function MatchRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-5 w-14 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  )
}

export function UserMatchesSection({ matches, isLoading, className }: UserMatchesSectionProps) {
  const { t } = useTranslation('home')

  if (isLoading) {
    return (
      <Card className={cn('bg-card border-border h-full flex flex-col', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-28 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent className="space-y-2 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <MatchRowSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-card border-border h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">{t('userMatches.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('userMatches.subtitle')}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
          <Link to="/submit-result">
            {t('userMatches.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 flex-1 flex flex-col">
        {matches.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-8 text-muted-foreground">
            {t('userMatches.noMatches')}
          </div>
        ) : (
          <>
            {matches.slice(0, 4).map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
            <div className="flex-1" />
            <Button variant="outline" className="w-full bg-transparent mt-4" asChild>
              <Link to="/fixtures">
                Ver todos mis partidos
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
