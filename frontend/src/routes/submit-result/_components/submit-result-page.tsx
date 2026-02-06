import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Upload, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MatchListPanel } from './match-list-panel'
import { ResultForm } from './result-form'
import type { EventRow } from './events-column'
import type { PlayerOption } from '@/components/ui/player-combobox'
import {
  SubmitResultService,
  type PendingMatch,
  type EventTypeOption,
} from '@/services/submit-result.service'

export default function SubmitResultPage() {
  const { t } = useTranslation('submitResult')

  // Match selection
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  // Scores
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  // Events
  const [homeEvents, setHomeEvents] = useState<EventRow[]>([])
  const [awayEvents, setAwayEvents] = useState<EventRow[]>([])

  // MVP
  const [mvpPlayerId, setMvpPlayerId] = useState<string | null>(null)

  // Screenshot
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)

  // Data
  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([])
  const [homePlayers, setHomePlayers] = useState<PlayerOption[]>([])
  const [awayPlayers, setAwayPlayers] = useState<PlayerOption[]>([])
  const [eventTypes, setEventTypes] = useState<EventTypeOption[]>([])
  const [goalTypeId, setGoalTypeId] = useState<string | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedMatch = pendingMatches.find((m) => m.id === selectedMatchId) || null

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [matches, types] = await Promise.all([
          SubmitResultService.getMyPendingMatches(),
          SubmitResultService.getEventTypes(),
        ])
        setPendingMatches(matches)
        setEventTypes(types)

        // Find GOAL type ID for validation
        const goalType = types.find((et) => et.name === 'GOAL')
        setGoalTypeId(goalType?.id || null)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error(t('error'))
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [t])

  // Load players when match is selected
  useEffect(() => {
    if (!selectedMatch) {
      setHomePlayers([])
      setAwayPlayers([])
      return
    }

    const loadPlayers = async () => {
      try {
        setIsLoadingPlayers(true)
        const [home, away] = await Promise.all([
          SubmitResultService.getClubPlayers(selectedMatch.homeClub.id),
          SubmitResultService.getClubPlayers(selectedMatch.awayClub.id),
        ])
        setHomePlayers(home)
        setAwayPlayers(away)
      } catch (error) {
        console.error('Error loading players:', error)
      } finally {
        setIsLoadingPlayers(false)
      }
    }
    loadPlayers()
  }, [selectedMatch?.id])

  // Handle match selection
  const handleSelectMatch = useCallback((matchId: string) => {
    setSelectedMatchId(matchId)
    setHomeScore(0)
    setAwayScore(0)
    setHomeEvents([])
    setAwayEvents([])
    setMvpPlayerId(null)
    setScreenshotFile(null)
  }, [])

  // Calculate if goals match events
  const homeGoalEvents = homeEvents
    .filter((e) => e.typeId === goalTypeId)
    .reduce((sum, e) => sum + e.quantity, 0)
  const awayGoalEvents = awayEvents
    .filter((e) => e.typeId === goalTypeId)
    .reduce((sum, e) => sum + e.quantity, 0)

  const homeGoalsMatch = homeGoalEvents === homeScore
  const awayGoalsMatch = awayGoalEvents === awayScore

  // All events must have both typeId and playerId filled
  const allEventsComplete = [...homeEvents, ...awayEvents].every(
    (e) => e.typeId && e.playerId
  )

  // Can submit validation
  const canSubmit =
    !!selectedMatch &&
    !!mvpPlayerId &&
    homeGoalsMatch &&
    awayGoalsMatch &&
    allEventsComplete &&
    !isSubmitting &&
    !isLoadingPlayers

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedMatch || !mvpPlayerId || !canSubmit) return

    try {
      setIsSubmitting(true)
      await SubmitResultService.submitResult(selectedMatch.id, {
        homeClubGoals: homeScore,
        awayClubGoals: awayScore,
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
        mvpPlayerId,
      })

      toast.success(t('success'))

      // Remove submitted match from list and reset form
      setPendingMatches((prev) => prev.filter((m) => m.id !== selectedMatch.id))
      setSelectedMatchId(null)
      setHomeScore(0)
      setAwayScore(0)
      setHomeEvents([])
      setAwayEvents([])
      setMvpPlayerId(null)
      setScreenshotFile(null)
    } catch (error: any) {
      console.error('Error submitting result:', error)
      toast.error(error.message || t('error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Match Selection Panel */}
          <div className="lg:col-span-2">
            <MatchListPanel
              matches={pendingMatches}
              selectedMatchId={selectedMatchId}
              onSelectMatch={handleSelectMatch}
              isLoading={isLoading}
            />
          </div>

          {/* Result Form */}
          <div className="lg:col-span-3">
            {selectedMatch ? (
              <ResultForm
                match={selectedMatch}
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
                mvpPlayerId={mvpPlayerId}
                onMvpChange={setMvpPlayerId}
                screenshotFile={screenshotFile}
                onScreenshotChange={setScreenshotFile}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
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
