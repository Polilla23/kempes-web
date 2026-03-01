import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, ChevronRight, Shield, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserMatch } from '@/services/home.service'

interface UserMatchesSectionProps {
  matches: UserMatch[]
  isLoading: boolean
  className?: string
}

const getCompetitionBadgeColor = (competitionTypeName: string) => {
  switch (competitionTypeName) {
    case 'GOLD_CUP':
      return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30'
    case 'SILVER_CUP':
      return 'bg-slate-400/20 text-slate-700 dark:text-slate-300 border-slate-400/30'
    case 'KEMPES_CUP':
      return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
    case 'CINDOR_CUP':
      return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
    case 'SUPER_CUP':
      return 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30'
    case 'LEAGUE_A':
    case 'LEAGUE_B':
    case 'LEAGUE_C':
    case 'LEAGUE_D':
    case 'LEAGUE_E':
      return 'bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-500/30'
    case 'PROMOTIONS':
      return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
    default:
      return 'bg-muted text-muted-foreground border-transparent'
  }
}

const getCompetitionIcon = (category: string) => {
  return category === 'CUP' ? Trophy : Shield
}

const resultColors = {
  W: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  D: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  L: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
}

const scoreColors = {
  W: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  D: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  L: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

function MatchCard({ match }: { match: UserMatch }) {
  const { t } = useTranslation('home')

  const userClub = match.isUserHome ? match.homeClub : match.awayClub
  const opponent = match.isUserHome ? match.awayClub : match.homeClub
  const userClubName = userClub?.name || 'TBD'
  const opponentName = opponent?.name || 'TBD'
  const userGoals = match.isUserHome ? match.homeClubGoals : match.awayClubGoals
  const opponentGoals = match.isUserHome ? match.awayClubGoals : match.homeClubGoals

  const Icon = getCompetitionIcon(match.competition.competitionType.category)

  const matchdayLabel = match.knockoutRound
    ? t(`competition.rounds.${match.knockoutRound}`, match.knockoutRound)
    : t('competition.matchday', { number: match.matchdayOrder })

  return (
    <div className="bg-secondary/50 border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
      {/* Competition Badge + Result */}
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant="outline"
          className={cn('text-[10px] gap-1', getCompetitionBadgeColor(match.competition.competitionType.name))}
        >
          <Icon className="w-3 h-3" />
          {match.competition.name} - {matchdayLabel}
        </Badge>
        <Badge
          variant="outline"
          className={cn('text-xs font-bold', resultColors[match.result])}
        >
          {t(`userMatches.${match.result === 'W' ? 'win' : match.result === 'D' ? 'draw' : 'loss'}`)}
        </Badge>
      </div>

      {/* Match: User Team vs Opponent */}
      <div className="flex items-center gap-2">
        {/* User Team */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 border border-primary/30">
            {userClub?.logo ? (
              <img src={userClub.logo} alt={userClubName} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-[10px] font-bold text-primary">
                {userClubName.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground truncate min-w-0">{userClubName}</p>
        </div>

        {/* Score */}
        <div
          className={cn(
            'text-sm font-bold px-2.5 py-1 rounded tabular-nums shrink-0',
            scoreColors[match.result]
          )}
        >
          {userGoals} - {opponentGoals}
        </div>

        {/* Opponent */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate min-w-0 text-right">{opponentName}</p>
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0 border border-border">
            {opponent?.logo ? (
              <img src={opponent.logo} alt={opponentName} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-[10px] font-bold text-muted-foreground">
                {opponentName.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCardSkeleton() {
  return (
    <div className="bg-secondary/50 border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-8" />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-7 w-12 rounded" />
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        </div>
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
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <MatchCardSkeleton key={i} />
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
          <CardTitle className="text-foreground">{t('userMatches.title')}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
          <Link to="/submit-result">
            {t('userMatches.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {matches.length === 0 ? (
          <div className="flex items-center justify-center flex-1 py-8 text-muted-foreground">
            {t('userMatches.noMatches')}
          </div>
        ) : (
          <>
            {matches.slice(0, 4).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            <div className="flex-1" />
            <Button variant="outline" className="w-full bg-transparent mt-4" asChild>
              <Link to="/fixtures">
                {t('userMatches.viewAllMatches')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
