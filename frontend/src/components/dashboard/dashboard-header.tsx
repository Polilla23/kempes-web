import { Trophy, Users, Medal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from 'react-i18next'
import type { DashboardClub } from '@/services/dashboard.service'

interface DashboardHeaderProps {
  club: DashboardClub
  playerCount: number
  isLoading?: boolean
}

export function DashboardHeader({ club, playerCount, isLoading }: DashboardHeaderProps) {
  const { t } = useTranslation('dashboard')

  const leagueCount = club.titles.titles.filter((t) => t.type === 'LEAGUE').length
  const cupCount = club.titles.titles.filter((t) => t.type === 'CUP').length

  const stats = [
    {
      icon: Trophy,
      label: t('header.titles'),
      value: club.titles.total,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: Medal,
      label: t('header.leagues'),
      value: leagueCount,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Trophy,
      label: t('header.cups'),
      value: cupCount,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Users,
      label: t('header.players'),
      value: playerCount,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ]

  if (isLoading) {
    return (
      <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8 border-b border-border">
        <div className="animate-pulse flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8 border-b border-border">
      {/* Club identity */}
      <div className="flex items-center gap-5 mb-6">
        <Avatar className="h-20 w-20 border-2 border-border shadow-md">
          <AvatarImage src={club.logo ?? undefined} alt={club.name} />
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {club.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{club.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('title')}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
