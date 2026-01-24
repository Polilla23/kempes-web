import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Match, MatchEvent } from '../_types/fixtures.types'
import { ROUND_LABELS } from '../_types/fixtures.types'

interface MatchCardProps {
  match: Match
}

function getRoundLabel(round: string | null | undefined): string {
  if (!round) return 'Fase'
  return ROUND_LABELS[round] || round
}

function getEventIcon(type: MatchEvent['type']): string {
  switch (type) {
    case 'goal':
      return '⚽'
    case 'own-goal':
      return '⚽🔴'
    case 'yellow':
      return '🟨'
    case 'red':
      return '🟥'
    case 'assist':
      return '👟'
    default:
      return '📋'
  }
}

export function MatchCard({ match }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasEvents = match.events && match.events.length > 0

  return (
    <div>
      <div
        className={cn(
          'px-4 py-3 hover:bg-secondary/30 transition-colors flex items-center gap-4',
          hasEvents && 'cursor-pointer'
        )}
        onClick={() => hasEvents && setIsExpanded(!isExpanded)}
      >
        {/* Expand Button */}
        <div className="w-6 flex-shrink-0">
          {hasEvents && (
            <Button variant="ghost" size="icon" className="w-6 h-6 p-0">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>

        {/* Round/Matchday */}
        <div className="w-20 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {match.knockoutRound
              ? getRoundLabel(match.knockoutRound)
              : `Fecha ${match.matchdayOrder}`}
          </span>
        </div>

        {/* Home Team */}
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {match.homeClub?.name || match.homePlaceholder || 'TBD'}
              </p>
            </div>
            <TeamLogo club={match.homeClub} placeholder={match.homePlaceholder} />
          </div>
        </div>

        {/* Score / Status */}
        <div className="w-24 flex-shrink-0 flex items-center justify-center">
          {match.status === 'FINALIZADO' ? (
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg">
              <span className="text-lg font-bold text-foreground">{match.homeClubGoals}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-lg font-bold text-foreground">{match.awayClubGoals}</span>
            </div>
          ) : (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Clock className="w-3 h-3 mr-1" />
              Pendiente
            </Badge>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <TeamLogo club={match.awayClub} placeholder={match.awayPlaceholder} />
            <div>
              <p className="text-sm font-medium text-foreground">
                {match.awayClub?.name || match.awayPlaceholder || 'TBD'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Icon */}
        <div className="w-10 flex-shrink-0 flex justify-end">
          {match.status === 'FINALIZADO' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-primary hover:bg-primary/10"
            >
              <Upload className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Events */}
      {isExpanded && hasEvents && (
        <div className="bg-muted/30 px-4 py-3 border-t border-border">
          <div className="flex gap-8">
            {/* Home Team Events */}
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {match.homeClub?.name}
              </p>
              <div className="space-y-1">
                {match.events
                  ?.filter((e) => e.team === 'home')
                  .sort((a, b) => a.minute - b.minute)
                  .map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-8">{event.minute}'</span>
                      <span>{getEventIcon(event.type)}</span>
                      <span className="text-foreground">{event.player}</span>
                      {event.assist && (
                        <span className="text-muted-foreground text-xs">
                          (Asist: {event.assist})
                        </span>
                      )}
                    </div>
                  ))}
                {match.events?.filter((e) => e.team === 'home').length === 0 && (
                  <p className="text-xs text-muted-foreground">Sin eventos</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-border" />

            {/* Away Team Events */}
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {match.awayClub?.name}
              </p>
              <div className="space-y-1">
                {match.events
                  ?.filter((e) => e.team === 'away')
                  .sort((a, b) => a.minute - b.minute)
                  .map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-8">{event.minute}'</span>
                      <span>{getEventIcon(event.type)}</span>
                      <span className="text-foreground">{event.player}</span>
                      {event.assist && (
                        <span className="text-muted-foreground text-xs">
                          (Asist: {event.assist})
                        </span>
                      )}
                    </div>
                  ))}
                {match.events?.filter((e) => e.team === 'away').length === 0 && (
                  <p className="text-xs text-muted-foreground">Sin eventos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TeamLogo({
  club,
  placeholder,
}: {
  club: { name: string; logo: string | null } | null
  placeholder?: string | null
}) {
  return (
    <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border shrink-0">
      {club?.logo ? (
        <img src={club.logo} alt="" className="w-5 h-5 object-contain" />
      ) : (
        club?.name?.slice(0, 3).toUpperCase() || placeholder?.slice(0, 3).toUpperCase() || 'TBD'
      )}
    </div>
  )
}
