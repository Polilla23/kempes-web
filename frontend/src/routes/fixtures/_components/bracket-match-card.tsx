import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BracketMatch } from '../_types/fixtures.types'

interface BracketMatchCardProps {
  match: BracketMatch
  isFinal: boolean
  height: number
  isHighlighted?: boolean
  highlightedClubId?: string | null
  onTeamHover?: (clubId: string | null) => void
}

export function BracketMatchCard({
  match,
  isFinal,
  height,
  isHighlighted = false,
  highlightedClubId,
  onTeamHover,
}: BracketMatchCardProps) {
  const isPlayed = match.status === 'FINALIZADO'
  const isDraw = isPlayed && match.homeClubGoals === match.awayClubGoals
  const isTBD = !match.homeClub || !match.awayClub

  // Determinar si cada equipo es el que está siendo destacado
  const isHomeHighlighted = highlightedClubId && match.homeClub?.id === highlightedClubId
  const isAwayHighlighted = highlightedClubId && match.awayClub?.id === highlightedClubId

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-all',
        // Estado por defecto
        !isHighlighted && !highlightedClubId && 'hover:shadow-md',
        // Final styling
        isFinal && !isHighlighted
          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20'
          : !isHighlighted && !highlightedClubId
            ? 'border-border bg-card hover:border-primary/30'
            : null,
        // Highlighted state (cuando el equipo está en el camino)
        isHighlighted && 'border-primary ring-2 ring-primary/50 shadow-lg shadow-primary/20 bg-primary/5',
        // Dimmed state (cuando hay un highlight pero este match no está en el camino)
        highlightedClubId && !isHighlighted && 'opacity-40'
      )}
      style={{ height }}
    >
      {/* Final Trophy Icon */}
      {isFinal && (
        <div
          className={cn(
            'px-2 py-1 flex items-center justify-center gap-1.5 border-b',
            isHighlighted
              ? 'bg-primary/30 border-primary/30'
              : 'bg-primary/20 border-primary/20'
          )}
        >
          <Trophy className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">FINAL</span>
        </div>
      )}

      {/* Home Team */}
      <div
        className={cn(
          'flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 transition-colors cursor-pointer',
          // Normal winner styling
          match.winner === 'home' && !isHomeHighlighted && 'bg-emerald-500/10',
          // Highlighted team styling
          isHomeHighlighted && 'bg-primary/20',
          // Hover effect when not highlighted
          !isHomeHighlighted && 'hover:bg-secondary/30'
        )}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
        onMouseEnter={() => match.homeClub && onTeamHover?.(match.homeClub.id)}
        onMouseLeave={() => onTeamHover?.(null)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Winner indicator */}
          {match.winner === 'home' && !isHomeHighlighted && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          {/* Highlighted team indicator */}
          {isHomeHighlighted && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-medium truncate',
                isTBD
                  ? 'text-muted-foreground/50 italic'
                  : isHomeHighlighted
                    ? 'text-primary font-semibold'
                    : match.winner === 'home'
                      ? 'text-emerald-500'
                      : 'text-foreground'
              )}
            >
              {match.homeClub?.name || match.homePlaceholder || 'TBD'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-1">
          {isPlayed ? (
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                isHomeHighlighted
                  ? 'text-primary'
                  : match.winner === 'home'
                    ? 'text-emerald-500'
                    : isDraw
                      ? 'text-amber-500'
                      : 'text-foreground'
              )}
            >
              {match.homeClubGoals}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/30">-</span>
          )}
        </div>
      </div>

      {/* Away Team */}
      <div
        className={cn(
          'flex items-center justify-between px-2.5 py-1.5 transition-colors cursor-pointer',
          // Normal winner styling
          match.winner === 'away' && !isAwayHighlighted && 'bg-emerald-500/10',
          // Highlighted team styling
          isAwayHighlighted && 'bg-primary/20',
          // Hover effect when not highlighted
          !isAwayHighlighted && 'hover:bg-secondary/30'
        )}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
        onMouseEnter={() => match.awayClub && onTeamHover?.(match.awayClub.id)}
        onMouseLeave={() => onTeamHover?.(null)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* Winner indicator */}
          {match.winner === 'away' && !isAwayHighlighted && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          {/* Highlighted team indicator */}
          {isAwayHighlighted && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-medium truncate',
                isTBD
                  ? 'text-muted-foreground/50 italic'
                  : isAwayHighlighted
                    ? 'text-primary font-semibold'
                    : match.winner === 'away'
                      ? 'text-emerald-500'
                      : 'text-foreground'
              )}
            >
              {match.awayClub?.name || match.awayPlaceholder || 'TBD'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-1">
          {isPlayed ? (
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                isAwayHighlighted
                  ? 'text-primary'
                  : match.winner === 'away'
                    ? 'text-emerald-500'
                    : isDraw
                      ? 'text-amber-500'
                      : 'text-foreground'
              )}
            >
              {match.awayClubGoals}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/30">-</span>
          )}
        </div>
      </div>
    </div>
  )
}
