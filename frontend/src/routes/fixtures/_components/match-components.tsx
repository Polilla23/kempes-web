// Match display components

import React from 'react'
import { Badge } from '@/components/ui/badge'
import type { Match } from './fixtures.types'

interface TeamCellProps {
  name: string
  logo: string | null
}

export function TeamCell({ name, logo }: TeamCellProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="h-6 w-6 shrink-0 rounded bg-muted/60 ring-1 ring-border overflow-hidden">
        {logo ? <img src={logo} alt="" className="h-full w-full object-contain" /> : null}
      </div>
      <div className="min-w-0 truncate text-[13px] leading-5">
        <span className="font-medium text-foreground/90">{name}</span>
      </div>
    </div>
  )
}

interface ScoreBoxProps {
  status: Match['status']
  home: number
  away: number
}

export function ScoreBox({ status, home, away }: ScoreBoxProps) {
  if (status === 'JUGADO') {
    return (
      <div className="flex items-center justify-center gap-1 w-[74px] text-sm">
        <span className="inline-flex w-8 justify-center rounded bg-foreground/5 py-1 font-semibold">{home}</span>
        <span className="text-muted-foreground">:</span>
        <span className="inline-flex w-8 justify-center rounded bg-foreground/5 py-1 font-semibold">{away}</span>
      </div>
    )
  }
  return <div className="w-[74px] text-center text-xs text-muted-foreground">vs</div>
}

interface MatchRowProps {
  match: Match
  rightMeta?: React.ReactNode
}

export function MatchRow({ match, rightMeta }: MatchRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 px-3 py-2 hover:bg-muted/40 transition-colors">
      <div className="min-w-0">
        <TeamCell name={match.homeClub?.name ?? 'TBD'} logo={match.homeClub?.logo ?? null} />
      </div>
      <ScoreBox status={match.status} home={match.homeClubGoals} away={match.awayClubGoals} />
      <div className="min-w-0 justify-self-end text-right">
        <div className="flex items-center justify-end gap-2 min-w-0">
          <div className="min-w-0 truncate text-[13px] leading-5">
            <span className="font-medium text-foreground/90">{match.awayClub?.name ?? 'TBD'}</span>
          </div>
          <div className="h-6 w-6 shrink-0 rounded bg-muted/60 ring-1 ring-border overflow-hidden">
            {match.awayClub?.logo ? <img src={match.awayClub.logo} alt="" className="h-full w-full object-contain" /> : null}
          </div>
        </div>
      </div>
      <div className="justify-self-end flex items-center gap-2">
        {rightMeta ?? null}
      </div>
    </div>
  )
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'JUGADO':
      return <Badge variant="default" className="bg-green-600">Jugado</Badge>
    case 'PENDIENTE':
      return <Badge variant="secondary">Pendiente</Badge>
    case 'CANCELADO':
      return <Badge variant="destructive">Cancelado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
