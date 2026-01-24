import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BracketMatch } from '../_types/fixtures.types'

interface BracketMatchCardProps {
  match: BracketMatch
  isFinal: boolean
  height: number
}

export function BracketMatchCard({ match, isFinal, height }: BracketMatchCardProps) {
  const isPlayed = match.status === 'FINALIZADO'
  const isDraw = isPlayed && match.homeClubGoals === match.awayClubGoals
  const isTBD = !match.homeClub || !match.awayClub

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-all hover:shadow-md',
        isFinal
          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30'
      )}
      style={{ height }}
    >
      {/* Final Trophy Icon */}
      {isFinal && (
        <div className="bg-primary/20 px-2 py-1 flex items-center justify-center gap-1.5 border-b border-primary/20">
          <Trophy className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">FINAL</span>
        </div>
      )}

      {/* Home Team */}
      <div
        className={cn(
          'flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 transition-colors',
          match.winner === 'home' ? 'bg-emerald-500/10' : 'hover:bg-secondary/30'
        )}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {match.winner === 'home' && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-medium truncate',
                isTBD
                  ? 'text-muted-foreground/50 italic'
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
                match.winner === 'home'
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
          'flex items-center justify-between px-2.5 py-1.5 transition-colors',
          match.winner === 'away' ? 'bg-emerald-500/10' : 'hover:bg-secondary/30'
        )}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {match.winner === 'away' && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-xs font-medium truncate',
                isTBD
                  ? 'text-muted-foreground/50 italic'
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
                match.winner === 'away'
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
