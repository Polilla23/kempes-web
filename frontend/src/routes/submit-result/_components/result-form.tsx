import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, Plus, Minus, AlertCircle, ImageIcon, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { EventsColumn, type EventRow, type EventTypeOption } from './events-column'
import { PlayerCombobox, type PlayerOption, type PlayerGroup } from '@/components/ui/player-combobox'
import type { PendingMatch } from '@/services/submit-result.service'
import { useRef } from 'react'

interface ResultFormProps {
  match: PendingMatch
  homeScore: number
  awayScore: number
  onHomeScoreChange: (score: number) => void
  onAwayScoreChange: (score: number) => void
  homeEvents: EventRow[]
  awayEvents: EventRow[]
  onHomeEventsChange: (events: EventRow[]) => void
  onAwayEventsChange: (events: EventRow[]) => void
  homePlayers: PlayerOption[]
  awayPlayers: PlayerOption[]
  eventTypes: EventTypeOption[]
  goalTypeId: string | null
  mvpPlayerId: string | null
  onMvpChange: (playerId: string) => void
  screenshotFile: File | null
  onScreenshotChange: (file: File | null) => void
  isSubmitting: boolean
  onSubmit: () => void
  canSubmit: boolean
}

const getCompetitionColors = (typeName: string) => {
  const name = typeName.toUpperCase()
  if (name.includes('GOLD')) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
  if (name.includes('SILVER')) return 'bg-gray-400/20 text-gray-500 border-gray-400/40'
  if (name.includes('KEMPES') || name.includes('CINDOR') || name.includes('SUPER'))
    return 'bg-primary/10 text-primary border-primary/30'
  return 'bg-muted text-muted-foreground border-transparent'
}

export function ResultForm({
  match,
  homeScore,
  awayScore,
  onHomeScoreChange,
  onAwayScoreChange,
  homeEvents,
  awayEvents,
  onHomeEventsChange,
  onAwayEventsChange,
  homePlayers,
  awayPlayers,
  eventTypes,
  goalTypeId,
  mvpPlayerId,
  onMvpChange,
  screenshotFile,
  onScreenshotChange,
  isSubmitting,
  onSubmit,
  canSubmit,
}: ResultFormProps) {
  const { t } = useTranslation('submitResult')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Build grouped players for MVP combobox
  const mvpPlayerGroups: PlayerGroup[] = [
    { label: match.homeClub.name, players: homePlayers },
    { label: match.awayClub.name, players: awayPlayers },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onScreenshotChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0] || null
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      onScreenshotChange(file)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs gap-1 mb-2',
                getCompetitionColors(match.competition.competitionType.name)
              )}
            >
              {match.competition.name}
            </Badge>
            <CardTitle className="text-foreground">{t('form.title')}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Input */}
        <div className="bg-secondary/50 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold border overflow-hidden',
                    match.isUserHome
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {match.homeClub.logo ? (
                    <img
                      src={match.homeClub.logo}
                      alt={match.homeClub.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    match.homeClub.name.substring(0, 3).toUpperCase()
                  )}
                </div>
                <div>
                  <p className={cn('font-semibold', match.isUserHome && 'text-primary')}>
                    {match.homeClub.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('form.local')}</p>
                </div>
              </div>

              {/* Score Control */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onHomeScoreChange(Math.max(0, homeScore - 1))}
                  className="h-12 w-12 rounded-full bg-transparent"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-6xl font-bold text-primary w-20 text-center tabular-nums">
                  {homeScore}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onHomeScoreChange(homeScore + 1)}
                  className="h-12 w-12 rounded-full bg-transparent"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-bold text-muted-foreground">{t('form.vs')}</div>
              <div className="w-px h-16 bg-border" />
            </div>

            {/* Away Team */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className={cn('font-semibold', !match.isUserHome && 'text-primary')}>
                    {match.awayClub.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('form.visitante')}</p>
                </div>
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold border overflow-hidden',
                    !match.isUserHome
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {match.awayClub.logo ? (
                    <img
                      src={match.awayClub.logo}
                      alt={match.awayClub.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    match.awayClub.name.substring(0, 3).toUpperCase()
                  )}
                </div>
              </div>

              {/* Score Control */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onAwayScoreChange(Math.max(0, awayScore - 1))}
                  className="h-12 w-12 rounded-full bg-transparent"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-6xl font-bold text-primary w-20 text-center tabular-nums">
                  {awayScore}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onAwayScoreChange(awayScore + 1)}
                  className="h-12 w-12 rounded-full bg-transparent"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventsColumn
            teamName={match.homeClub.name}
            teamScore={homeScore}
            events={homeEvents}
            onEventsChange={onHomeEventsChange}
            players={homePlayers}
            eventTypes={eventTypes}
            goalTypeId={goalTypeId}
          />
          <EventsColumn
            teamName={match.awayClub.name}
            teamScore={awayScore}
            events={awayEvents}
            onEventsChange={onAwayEventsChange}
            players={awayPlayers}
            eventTypes={eventTypes}
            goalTypeId={goalTypeId}
          />
        </div>

        {/* MVP Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <Label className="text-foreground font-semibold">{t('mvp.title')}</Label>
          </div>
          <p className="text-xs text-muted-foreground">{t('mvp.description')}</p>
          <PlayerCombobox
            groups={mvpPlayerGroups}
            players={[]}
            value={mvpPlayerId}
            onSelect={onMvpChange}
            placeholder={t('mvp.selectPlayer')}
            searchPlaceholder={t('mvp.selectPlayer')}
          />
          {!mvpPlayerId && (
            <p className="text-xs text-destructive">{t('mvp.required')}</p>
          )}
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-2">
          <Label className="text-foreground">{t('screenshot.title')}</Label>
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-secondary/30"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
            />
            {screenshotFile ? (
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">
                  {t('screenshot.selected', { fileName: screenshotFile.name })}
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium mb-1">
                  {t('screenshot.dragText')}
                </p>
                <p className="text-xs text-muted-foreground">{t('screenshot.clickText')}</p>
                <p className="text-xs text-muted-foreground mt-2">{t('screenshot.fileTypes')}</p>
              </>
            )}
          </div>
        </div>

        {/* Alert */}
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-600">{t('warning.title')}</p>
            <p className="text-muted-foreground">{t('warning.message')}</p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full h-12 text-lg font-semibold"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          <Upload className="w-5 h-5 mr-2" />
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </CardContent>
    </Card>
  )
}
