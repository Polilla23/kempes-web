import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Zap, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecentMatch } from '@/services/home.service'

interface RecentResultsCarouselProps {
  matches: RecentMatch[]
  isLoading: boolean
}

// Get competition style based on competition type enum name
const getCompetitionStyle = (competitionTypeName: string) => {
  switch (competitionTypeName) {
    case 'GOLD_CUP':
      return {
        badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/50 hover:border-amber-500/70',
      }
    case 'SILVER_CUP':
      return {
        badge: 'bg-slate-400/20 text-slate-700 dark:text-slate-300',
        border: 'border-slate-400/50 hover:border-slate-400/70',
      }
    case 'KEMPES_CUP':
      return {
        badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/50 hover:border-blue-500/70',
      }
    case 'CINDOR_CUP':
      return {
        badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/50 hover:border-emerald-500/70',
      }
    case 'SUPER_CUP':
      return {
        badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/50 hover:border-rose-500/70',
      }
    case 'LEAGUE_A':
    case 'LEAGUE_B':
    case 'LEAGUE_C':
    case 'LEAGUE_D':
    case 'LEAGUE_E':
      return {
        badge: 'bg-violet-500/20 text-violet-700 dark:text-violet-400',
        border: 'border-violet-500/50 hover:border-violet-500/70',
      }
    case 'PROMOTIONS':
      return {
        badge: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
        border: 'border-orange-500/50 hover:border-orange-500/70',
      }
    default:
      return {
        badge: 'bg-muted text-muted-foreground',
        border: 'border-border hover:border-primary/30',
      }
  }
}

function MatchCard({ match }: { match: RecentMatch }) {
  const { t } = useTranslation('home')
  const style = getCompetitionStyle(match.competition.competitionType.name)

  const homeWin = match.homeClubGoals > match.awayClubGoals
  const awayWin = match.awayClubGoals > match.homeClubGoals
  const isDraw = match.homeClubGoals === match.awayClubGoals

  const homeClubName = match.homeClub?.name || 'TBD'
  const awayClubName = match.awayClub?.name || 'TBD'

  return (
    <div className={cn('bg-card border-2 rounded-xl overflow-hidden transition-all hover:shadow-lg', style.border)}>
      {/* Header with competition and time */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/50">
        <div className={cn('flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md', style.badge)}>
          <Trophy className="w-3 h-3" />
          <span className="truncate max-w-[100px]">{match.competition.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {match.knockoutRound
            ? t(`competition.rounds.${match.knockoutRound}`, match.knockoutRound)
            : t('competition.matchday', { number: match.matchdayOrder })}
        </span>
      </div>

      {/* Match content */}
      <div className="p-4 space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
              {match.homeClub?.logo ? (
                <img src={match.homeClub.logo} alt={homeClubName} className="w-6 h-6 object-contain" />
              ) : (
                homeClubName.slice(0, 3).toUpperCase()
              )}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                homeWin ? 'text-foreground font-semibold' : 'text-muted-foreground'
              )}
            >
              {homeClubName}
            </span>
          </div>
          <span
            className={cn(
              'text-lg font-bold tabular-nums w-6 text-center',
              homeWin ? 'text-green-600 dark:text-green-400' : isDraw ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {match.homeClubGoals}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
              {match.awayClub?.logo ? (
                <img src={match.awayClub.logo} alt={awayClubName} className="w-6 h-6 object-contain" />
              ) : (
                awayClubName.slice(0, 3).toUpperCase()
              )}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                awayWin ? 'text-foreground font-semibold' : 'text-muted-foreground'
              )}
            >
              {awayClubName}
            </span>
          </div>
          <span
            className={cn(
              'text-lg font-bold tabular-nums w-6 text-center',
              awayWin ? 'text-green-600 dark:text-green-400' : isDraw ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {match.awayClubGoals}
          </span>
        </div>
      </div>

      {/* View details link */}
      <div className="px-4 pb-4">
        <Link
          to="/"
          className="block w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors py-2 rounded-md hover:bg-primary/5"
        >
          {t('recentResults.viewDetails')}
        </Link>
      </div>
    </div>
  )
}

function MatchCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/50">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-5 w-4" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-5 w-4" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  )
}

export function RecentResultsCarousel({ matches, isLoading }: RecentResultsCarouselProps) {
  const { t } = useTranslation('home')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftPos(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = scrollLeftPos - (x - startX) * 1.5
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-64">
                <MatchCardSkeleton />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-foreground">{t('recentResults.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('recentResults.subtitle')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="text-center py-8 text-muted-foreground">{t('recentResults.noResults')}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <CardTitle className="text-foreground">{t('recentResults.title')}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div
          ref={scrollRef}
          className={cn(
            'flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseLeave={() => setIsDragging(false)}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
        >
          {matches.map((match) => (
            <div key={match.id} className="flex-shrink-0 w-64">
              <MatchCard match={match} />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>{t('recentResults.updatingLive')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
