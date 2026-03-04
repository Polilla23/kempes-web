import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { FileEdit, Calendar, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AdminMatchListPanel } from './admin-match-list-panel'
import { ResultForm } from '@/routes/submit-result/_components/result-form'
import type { EventRow } from '@/routes/submit-result/_components/events-column'
import type { PlayerOption } from '@/components/ui/player-combobox'
import {
  EditResultService,
  type MatchDetailForEdit,
} from '@/services/edit-result.service'
import {
  SubmitResultService,
  type EventTypeOption,
} from '@/services/submit-result.service'
import type { MatchDetailedDTO } from '@/services/fixture.service'
import type { PendingMatch } from '@/services/submit-result.service'

type MatchStatus = 'FINALIZADO' | 'PENDIENTE' | 'CANCELADO'

export default function EditResultsPage() {
  const { t } = useTranslation('editResults')
  const { t: tSubmit } = useTranslation('submitResult')

  // Match selection
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [matchDetail, setMatchDetail] = useState<MatchDetailForEdit | null>(null)

  // Scores
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  // Own goals
  const [homeOwnGoals, setHomeOwnGoals] = useState(0)
  const [awayOwnGoals, setAwayOwnGoals] = useState(0)

  // Events
  const [homeEvents, setHomeEvents] = useState<EventRow[]>([])
  const [awayEvents, setAwayEvents] = useState<EventRow[]>([])

  // MVP
  const [mvpPlayerId, setMvpPlayerId] = useState<string | null>(null)

  // Status
  const [newStatus, setNewStatus] = useState<MatchStatus>('FINALIZADO')

  // Data
  const [allMatches, setAllMatches] = useState<MatchDetailedDTO[]>([])
  const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([])
  const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([])
  const [eventTypes, setEventTypes] = useState<EventTypeOption[]>([])
  const [goalTypeId, setGoalTypeId] = useState<string | null>(null)
  const [redCardTypeId, setRedCardTypeId] = useState<string | null>(null)
  const [injuryTypeId, setInjuryTypeId] = useState<string | null>(null)

  // Loading states
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventTypesLoaded, setEventTypesLoaded] = useState(false)

  // Load event types once
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        const types = await SubmitResultService.getEventTypes()
        setEventTypes(types)
        setGoalTypeId(types.find((et) => et.name === 'GOAL')?.id || null)
        setRedCardTypeId(types.find((et) => et.name === 'RED_CARD')?.id || null)
        setInjuryTypeId(types.find((et) => et.name === 'INJURY')?.id || null)
        setEventTypesLoaded(true)
      } catch (error) {
        console.error('Error loading event types:', error)
      }
    }
    loadEventTypes()
  }, [])

  // Handle match selection
  const handleSelectMatch = useCallback(
    async (matchId: string) => {
      setSelectedMatchId(matchId)
      setIsLoadingDetail(true)

      try {
        const detail = await EditResultService.getMatchDetail(matchId)
        setMatchDetail(detail)

        // Pre-populate form
        setHomeScore(detail.homeClubGoals)
        setAwayScore(detail.awayClubGoals)
        setHomeOwnGoals(detail.homeOwnGoals)
        setAwayOwnGoals(detail.awayOwnGoals)
        setMvpPlayerId(detail.mvpPlayerId)
        setNewStatus(detail.status as MatchStatus)

        // Transform server events to EventRow[]
        setHomeEvents(
          detail.homeEvents.map((e) => ({
            id: crypto.randomUUID(),
            typeId: e.typeId,
            playerId: e.playerId,
            quantity: e.quantity,
          }))
        )
        setAwayEvents(
          detail.awayEvents.map((e) => ({
            id: crypto.randomUUID(),
            typeId: e.typeId,
            playerId: e.playerId,
            quantity: e.quantity,
          }))
        )

        // Load players for both clubs
        if (detail.homeClub && detail.awayClub) {
          setIsLoadingPlayers(true)
          try {
            const [home, away] = await Promise.all([
              EditResultService.getClubPlayers(detail.homeClub.id),
              EditResultService.getClubPlayers(detail.awayClub.id),
            ])
            setHomePlayers(home)
            setAwayPlayers(away)
          } catch (error) {
            console.error('Error loading players:', error)
          } finally {
            setIsLoadingPlayers(false)
          }
        }
      } catch (error) {
        console.error('Error loading match detail:', error)
        toast.error(t('error'))
        // Reset form on error
        setMatchDetail(null)
        setHomeScore(0)
        setAwayScore(0)
        setHomeOwnGoals(0)
        setAwayOwnGoals(0)
        setHomeEvents([])
        setAwayEvents([])
        setMvpPlayerId(null)
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [t]
  )

  // Goal validation (only matters when status is FINALIZADO)
  const homeGoalEvents = homeEvents
    .filter((e) => e.typeId === goalTypeId)
    .reduce((sum, e) => sum + e.quantity, 0)
  const awayGoalEvents = awayEvents
    .filter((e) => e.typeId === goalTypeId)
    .reduce((sum, e) => sum + e.quantity, 0)

  const homeGoalsMatch = homeGoalEvents + homeOwnGoals === homeScore
  const awayGoalsMatch = awayGoalEvents + awayOwnGoals === awayScore

  const allEventsComplete = [...homeEvents, ...awayEvents].every(
    (e) => e.typeId && e.playerId
  )

  // Can submit validation
  const canSubmit =
    !!matchDetail &&
    !isSubmitting &&
    !isLoadingPlayers &&
    (newStatus !== 'FINALIZADO' || (!!mvpPlayerId && homeGoalsMatch && awayGoalsMatch && allEventsComplete))

  // Handle submit
  const handleSubmit = async () => {
    if (!matchDetail || !canSubmit) return

    try {
      setIsSubmitting(true)
      await EditResultService.adminEditResult(matchDetail.id, {
        homeClubGoals: homeScore,
        awayClubGoals: awayScore,
        homeOwnGoals,
        awayOwnGoals,
        homeEvents: homeEvents.map((e) => ({
          typeId: e.typeId,
          playerId: e.playerId,
          quantity: e.quantity,
        })),
        awayEvents: awayEvents.map((e) => ({
          typeId: e.typeId,
          playerId: e.playerId,
          quantity: e.quantity,
        })),
        mvpPlayerId: mvpPlayerId || '',
        newStatus,
      })

      toast.success(t('success'))

      // Reset selection
      setSelectedMatchId(null)
      setMatchDetail(null)
      setHomeScore(0)
      setAwayScore(0)
      setHomeOwnGoals(0)
      setAwayOwnGoals(0)
      setHomeEvents([])
      setAwayEvents([])
      setMvpPlayerId(null)
    } catch (error: any) {
      console.error('Error editing result:', error)
      toast.error(error.message || t('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Build PendingMatch-compatible object for ResultForm
  const matchForForm: PendingMatch | null = matchDetail
    ? {
        id: matchDetail.id,
        matchdayOrder: matchDetail.matchdayOrder,
        status: matchDetail.status,
        stage: matchDetail.stage,
        knockoutRound: matchDetail.knockoutRound,
        homeClub: matchDetail.homeClub!,
        awayClub: matchDetail.awayClub!,
        competition: matchDetail.competition,
        isUserHome: false,
      }
    : null

  // Status selector component to inject into ResultForm
  const statusSelector = (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-foreground">{t('statusSelect.label')}</label>
      </div>
      <Select value={newStatus} onValueChange={(v) => setNewStatus(v as MatchStatus)}>
        <SelectTrigger className="w-full bg-secondary/50 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FINALIZADO">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600 text-[10px]">{t('status.FINALIZADO')}</Badge>
            </div>
          </SelectItem>
          <SelectItem value="PENDIENTE">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-[10px]">{t('status.PENDIENTE')}</Badge>
            </div>
          </SelectItem>
          <SelectItem value="CANCELADO">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-[10px]">{t('status.CANCELADO')}</Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{t('statusSelect.description')}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Match Selection Panel */}
          <div className="lg:col-span-2">
            <AdminMatchListPanel
              selectedMatchId={selectedMatchId}
              onSelectMatch={handleSelectMatch}
              onMatchesLoaded={setAllMatches}
            />
          </div>

          {/* Result Form */}
          <div className="lg:col-span-3">
            {isLoadingDetail ? (
              <Card className="bg-card border-border">
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">{t('loadingDetail')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : matchForForm && eventTypesLoaded ? (
              <ResultForm
                match={matchForForm}
                homeScore={homeScore}
                awayScore={awayScore}
                onHomeScoreChange={setHomeScore}
                onAwayScoreChange={setAwayScore}
                homeEvents={homeEvents}
                awayEvents={awayEvents}
                onHomeEventsChange={setHomeEvents}
                onAwayEventsChange={setAwayEvents}
                homePlayers={homePlayers}
                awayPlayers={awayPlayers}
                eventTypes={eventTypes}
                goalTypeId={goalTypeId}
                redCardTypeId={redCardTypeId}
                injuryTypeId={injuryTypeId}
                mvpPlayerId={mvpPlayerId}
                onMvpChange={setMvpPlayerId}
                screenshotFile={null}
                onScreenshotChange={() => {}}
                isSubmitting={isSubmitting}
                isLoadingPlayers={isLoadingPlayers}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
                homeOwnGoals={homeOwnGoals}
                awayOwnGoals={awayOwnGoals}
                onHomeOwnGoalsChange={setHomeOwnGoals}
                onAwayOwnGoalsChange={setAwayOwnGoals}
                submitLabel={t('save')}
                submittingLabel={t('saving')}
                hideScreenshot
                hideWarning
                extraContent={statusSelector}
              />
            ) : (
              <Card className="bg-card border-border h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('selectMatch.title')}
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    {t('selectMatch.description')}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
