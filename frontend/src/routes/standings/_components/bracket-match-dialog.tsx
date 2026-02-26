import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Calendar, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BracketMatch } from '../_types/standings.types'

interface BracketMatchDialogProps {
  match: BracketMatch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BracketMatchDialog({ match, open, onOpenChange }: BracketMatchDialogProps) {
  const { t } = useTranslation('standings')

  if (!match) return null

  const isPlayed = match.status === 'FINALIZADO'
  const homeWon = match.winner === 'home'
  const awayWon = match.winner === 'away'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t('combined.matchDetails')}
          </DialogTitle>
        </DialogHeader>

        {/* Score Display */}
        <div className="flex items-center justify-center gap-6 py-6">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {match.homeClub?.logo ? (
              <img
                src={match.homeClub.logo}
                alt={match.homeClub.name}
                className="h-12 w-12 object-contain rounded"
              />
            ) : (
              <Users className="h-12 w-12 text-muted-foreground" />
            )}
            <span className={`text-sm font-medium text-center ${homeWon ? 'text-emerald-500' : ''}`}>
              {match.homeClub?.name || match.homePlaceholder || 'TBD'}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-bold tabular-nums ${homeWon ? 'text-emerald-500' : ''}`}>
              {isPlayed ? (match.homeClubGoals ?? 0) : '-'}
            </span>
            <span className="text-2xl text-muted-foreground">:</span>
            <span className={`text-4xl font-bold tabular-nums ${awayWon ? 'text-emerald-500' : ''}`}>
              {isPlayed ? (match.awayClubGoals ?? 0) : '-'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {match.awayClub?.logo ? (
              <img
                src={match.awayClub.logo}
                alt={match.awayClub.name}
                className="h-12 w-12 object-contain rounded"
              />
            ) : (
              <Users className="h-12 w-12 text-muted-foreground" />
            )}
            <span className={`text-sm font-medium text-center ${awayWon ? 'text-emerald-500' : ''}`}>
              {match.awayClub?.name || match.awayPlaceholder || 'TBD'}
            </span>
          </div>
        </div>

        <Separator />

        {/* Match Info */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('combined.status')}</span>
            <Badge variant={isPlayed ? 'secondary' : 'outline'}>
              {isPlayed ? 'Finalizado' : 'Pendiente'}
            </Badge>
          </div>

          {match.knockoutRound && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('combined.round')}</span>
              <span className="font-medium flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {match.knockoutRound}
              </span>
            </div>
          )}

          {match.resultRecordedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('combined.date')}</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(match.resultRecordedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Events */}
        {match.events && match.events.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('combined.events')}</h4>
              <div className="space-y-1">
                {match.events.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-1 px-2 rounded bg-muted/30"
                  >
                    <span>{event.player}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
