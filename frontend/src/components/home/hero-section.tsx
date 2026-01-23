import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, TrendingUp, DollarSign, Trophy } from 'lucide-react'
import type { SeasonStats } from '@/services/home.service'

interface HeroSectionProps {
  seasonStats: SeasonStats | null
  isLoading: boolean
}

export function HeroSection({ seasonStats, isLoading }: HeroSectionProps) {
  const { t } = useTranslation('home')

  const stats = [
    {
      key: 'matchesPlayed',
      icon: Calendar,
      getValue: () => seasonStats?.playedMatches || 0,
      getTotal: () => {
        if (!seasonStats) return null
        const total = seasonStats.playedMatches + seasonStats.pendingMatches
        return total > 0 ? total : null
      },
      getDescription: () => t('hero.stats.currentSeason', { number: seasonStats?.seasonNumber || '-' }),
    },
    {
      key: 'transfers',
      icon: TrendingUp,
      getValue: () => seasonStats?.totalTransfers || 0,
      getTotal: () => null,
      getDescription: () => t('hero.stats.previousSeason'),
    },
    {
      key: 'moneyMoved',
      icon: DollarSign,
      getValue: () => '€0',
      getTotal: () => null,
      getDescription: () => t('hero.stats.previousSeason'),
    },
    {
      key: 'champions',
      icon: Trophy,
      getValue: () => seasonStats?.seasonNumber || 0,
      getTotal: () => null,
      getDescription: () => t('hero.stats.seasons'),
    },
  ]

  if (isLoading) {
    return (
      <section className="relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        <div className="relative px-[5%] lg:px-[7%] xl:px-[10%] py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <Skeleton className="h-4 w-40 mb-4" />
              <Skeleton className="h-14 w-64 mb-2" />
              <Skeleton className="h-14 w-80" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-40" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden mb-10">
      {/* Background Image - Stadium */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&h=600&fit=crop')`,
        }}
      />
      {/* Dark Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/60" />

      {/* Content with horizontal padding matching the rest of the app */}
      <div className="relative px-[5%] lg:px-[7%] xl:px-[10%] py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('hero.seasonInProgress', { number: seasonStats?.seasonNumber || '-' })}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              KEMPES
              <span className="block text-primary">MASTER LEAGUE</span>
            </h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{t(`hero.stats.${stat.key}`)}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{stat.getValue()}</span>
                  {stat.getTotal() && (
                    <span className="text-sm text-muted-foreground">/ {stat.getTotal()}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.getDescription()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
