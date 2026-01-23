import { useRef, useEffect, useState, useMemo } from 'react'
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

// Get competition style based on type
const getCompetitionStyle = (format: string, name: string) => {
  const nameLower = name.toLowerCase()

  if (format === 'CUP') {
    if (nameLower.includes('oro') || nameLower.includes('gold')) {
      return {
        badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30 hover:border-amber-500/50',
      }
    }
    if (nameLower.includes('plata') || nameLower.includes('silver')) {
      return {
        badge: 'bg-slate-400/15 text-slate-600 dark:text-slate-300',
        border: 'border-slate-400/30 hover:border-slate-400/50',
      }
    }
    if (nameLower.includes('kempes')) {
      return {
        badge: 'bg-primary/15 text-primary',
        border: 'border-primary/30 hover:border-primary/50',
      }
    }
    return {
      badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30 hover:border-purple-500/50',
    }
  }

  // League default
  return {
    badge: 'bg-muted text-muted-foreground',
    border: 'border-border hover:border-primary/30',
  }
}

function MatchCard({ match }: { match: RecentMatch }) {
  const { t } = useTranslation('home')
  const style = getCompetitionStyle(match.competition.competitionType.format, match.competition.name)

  const homeWin = match.homeClubGoals > match.awayClubGoals
  const awayWin = match.awayClubGoals > match.homeClubGoals
  const isDraw = match.homeClubGoals === match.awayClubGoals

  return (
    <div className={cn('bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg', style.border)}>
      {/* Header with competition and time */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/50">
        <div className={cn('flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md', style.badge)}>
          <Trophy className="w-3 h-3" />
          <span className="truncate max-w-[100px]">{match.competition.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('competition.matchday', { number: match.matchdayOrder })}
        </span>
      </div>

      {/* Match content */}
      <div className="p-4 space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
              {match.homeClub.logo ? (
                <img src={match.homeClub.logo} alt={match.homeClub.name} className="w-6 h-6 object-contain" />
              ) : (
                match.homeClub.name.slice(0, 3).toUpperCase()
              )}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                homeWin ? 'text-foreground font-semibold' : 'text-muted-foreground'
              )}
            >
              {match.homeClub.name}
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
              {match.awayClub.logo ? (
                <img src={match.awayClub.logo} alt={match.awayClub.name} className="w-6 h-6 object-contain" />
              ) : (
                match.awayClub.name.slice(0, 3).toUpperCase()
              )}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                awayWin ? 'text-foreground font-semibold' : 'text-muted-foreground'
              )}
            >
              {match.awayClub.name}
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
  const animationRef = useRef<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)

  // Triple the data for infinite scroll effect
  const infiniteMatches = useMemo(() => [...matches, ...matches, ...matches], [matches])

  // Auto-scroll with requestAnimationFrame - infinite loop
  useEffect(() => {
    if (isPaused || isDragging || matches.length === 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const speed = 0.5

    const animate = () => {
      if (!scrollRef.current) return

      const { scrollLeft, scrollWidth } = scrollRef.current
      const singleSetWidth = scrollWidth / 3

      // Reset to middle set when reaching end or beginning
      if (scrollLeft >= singleSetWidth * 2) {
        scrollRef.current.scrollLeft = singleSetWidth
      } else if (scrollLeft <= 0) {
        scrollRef.current.scrollLeft = singleSetWidth
      } else {
        scrollRef.current.scrollLeft += speed
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start from middle set
    if (scrollRef.current) {
      const singleSetWidth = scrollRef.current.scrollWidth / 3
      scrollRef.current.scrollLeft = singleSetWidth
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPaused, isDragging, matches.length])

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
          <div>
            <CardTitle className="text-foreground">{t('recentResults.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('recentResults.subtitle')}</p>
          </div>
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
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsDragging(false)
            setIsPaused(false)
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
        >
          {infiniteMatches.map((match, index) => (
            <div key={`${match.id}-${index}`} className="flex-shrink-0 w-64">
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
