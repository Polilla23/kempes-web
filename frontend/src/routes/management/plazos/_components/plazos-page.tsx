import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CalendarClock, Plus, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SeasonService } from '@/services/season.service'
import { SeasonHalfService } from '@/services/season-half.service'
import { PlazoService, type PlazoDTO } from '@/services/plazo.service'
import CompetitionService, { type Competition } from '@/services/competition.service'
import type { Season, SeasonHalf } from '@/types'
import { PlazoCard } from './plazo-card'
import { PlazoFormDialog } from './plazo-form-dialog'
import { OverdueReport } from './overdue-report'

type HalfTab = 'FIRST_HALF' | 'SECOND_HALF'

export default function PlazosPage() {
  const { t } = useTranslation('plazos')
  const { t: tSeasons } = useTranslation('seasons')

  // View state
  const [showOverdueReport, setShowOverdueReport] = useState(false)

  // Data
  const [seasons, setSeasons] = useState<Season[]>([])
  const [seasonHalves, setSeasonHalves] = useState<SeasonHalf[]>([])
  const [plazos, setPlazos] = useState<PlazoDTO[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Selections
  const [selectedSeasonId, setSelectedSeasonId] = useState('')
  const [selectedHalf, setSelectedHalf] = useState<HalfTab>('FIRST_HALF')

  // Dialog
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlazo, setEditingPlazo] = useState<PlazoDTO | null>(null)

  // Loading states
  const [isCreatingHalves, setIsCreatingHalves] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReassigning, setIsReassigning] = useState(false)
  const [isLoadingPlazos, setIsLoadingPlazos] = useState(false)
  const [isLoadingHalves, setIsLoadingHalves] = useState(false)

  // Load seasons on mount
  useEffect(() => {
    loadSeasons()
  }, [])

  // Load season halves & competitions when season changes
  useEffect(() => {
    if (selectedSeasonId) {
      loadSeasonHalves(selectedSeasonId)
      loadCompetitions()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeasonId])

  // Load plazos when season half changes
  useEffect(() => {
    const half = getSelectedSeasonHalf()
    if (half) {
      loadPlazos(half.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonHalves, selectedHalf])

  const loadSeasons = async () => {
    try {
      const response = await SeasonService.getSeasons()
      const sorted = (response.seasons || []).sort((a: Season, b: Season) => b.number - a.number)
      setSeasons(sorted)
      const active = sorted.find((s: Season) => s.isActive)
      if (active) setSelectedSeasonId(active.id)
      else if (sorted.length > 0) setSelectedSeasonId(sorted[0].id)
    } catch {
      toast.error(t('error.fetch'))
    } finally {
      setIsLoading(false)
    }
  }

  const loadSeasonHalves = async (seasonId: string) => {
    setIsLoadingHalves(true)
    try {
      const response = await SeasonHalfService.getSeasonHalvesBySeasonId(seasonId)
      setSeasonHalves(response.seasonHalves || [])
    } catch {
      setSeasonHalves([])
    } finally {
      setIsLoadingHalves(false)
    }
  }

  const loadCompetitions = async () => {
    try {
      const response = await CompetitionService.getCompetitions()
      // Filter to current season's competitions
      const seasonComps = (response.data || []).filter(
        (c: Competition) => c.seasonId === selectedSeasonId
      )
      setCompetitions(seasonComps)
    } catch {
      setCompetitions([])
    }
  }

  const loadPlazos = async (seasonHalfId: string) => {
    setIsLoadingPlazos(true)
    try {
      const data = await PlazoService.getBySeasonHalf(seasonHalfId)
      setPlazos(data)
    } catch {
      toast.error(t('error.fetch'))
      setPlazos([])
    } finally {
      setIsLoadingPlazos(false)
    }
  }

  const getSelectedSeasonHalf = (): SeasonHalf | undefined => {
    return seasonHalves.find((h) => h.halfType === selectedHalf)
  }

  const handleCreateSeasonHalves = async () => {
    setIsCreatingHalves(true)
    try {
      await SeasonHalfService.createSeasonHalves(selectedSeasonId)
      toast.success(t('success.seasonHalvesCreated'))
      await loadSeasonHalves(selectedSeasonId)
    } catch {
      toast.error(t('error.createSeasonHalves'))
    } finally {
      setIsCreatingHalves(false)
    }
  }

  const handleCreate = () => {
    setEditingPlazo(null)
    setIsFormOpen(true)
  }

  const handleEdit = (plazo: PlazoDTO) => {
    setEditingPlazo(plazo)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await PlazoService.delete(id)
      toast.success(t('success.deleted'))
      const half = getSelectedSeasonHalf()
      if (half) loadPlazos(half.id)
    } catch {
      toast.error(t('error.delete'))
    }
  }

  const handleFormSubmit = async (data: {
    title: string
    deadline: string
    order: number
    isOpen?: boolean
    scopes: Array<{
      competitionId: string
      matchdayFrom?: number | null
      matchdayTo?: number | null
      knockoutRounds?: string[]
    }>
  }) => {
    setIsSubmitting(true)
    try {
      const half = getSelectedSeasonHalf()
      if (!half) {
        toast.error(t('error.noSeasonHalf'))
        return
      }

      if (editingPlazo) {
        await PlazoService.update(editingPlazo.id, data)
        toast.success(t('success.updated'))
      } else {
        await PlazoService.create({
          seasonHalfId: half.id,
          ...data,
        })
        toast.success(t('success.created'))
      }

      setIsFormOpen(false)
      setEditingPlazo(null)
      loadPlazos(half.id)
    } catch {
      toast.error(editingPlazo ? t('error.update') : t('error.create'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReassignAll = async () => {
    const half = getSelectedSeasonHalf()
    if (!half) return

    setIsReassigning(true)
    try {
      const result = await PlazoService.reassignAll(half.id)
      toast.success(
        t('reassign.success', {
          count: result.matchesAssigned,
          plazos: result.plazosProcessed,
        })
      )
      loadPlazos(half.id)
    } catch {
      toast.error(t('reassign.error'))
    } finally {
      setIsReassigning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (showOverdueReport && selectedSeasonId) {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4 h-full max-w-4xl w-full px-4 mt-8 mb-8">
          <OverdueReport
            seasonId={selectedSeasonId}
            onBack={() => setShowOverdueReport(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col items-center gap-4 h-full max-w-4xl w-full px-4">
        {/* Header */}
        <div className="flex items-center gap-3 w-full mt-8">
          <CalendarClock className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        {/* Season selector */}
        <div className="flex items-center justify-between w-full gap-3">
          <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={tSeasons('fields.seasonLabel', { number: '...' })} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {tSeasons('fields.seasonLabel', { number: s.number })}
                  {s.isActive && ` (${tSeasons('status.active')})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {seasonHalves.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverdueReport(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                {t('actions.overdueReport')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReassignAll}
                disabled={plazos.length === 0 || isReassigning}
              >
                {isReassigning ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                )}
                {t('actions.reassignAll')}
              </Button>
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-1.5" />
                {t('create.button')}
              </Button>
            </div>
          )}
        </div>

        {isLoadingHalves ? (
          <div className="w-full space-y-3 mb-8">
            {/* Half tabs skeleton */}
            <div className="flex bg-secondary/50 p-0.5 rounded-lg w-full animate-pulse">
              <div className="flex-1 h-8 bg-muted rounded" />
              <div className="flex-1 h-8 bg-muted rounded" />
            </div>
            {/* Plazo cards skeleton */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardContent className="py-4 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-32 bg-muted rounded" />
                        <div className="h-5 w-8 bg-muted rounded" />
                        <div className="h-5 w-16 bg-muted rounded-full" />
                      </div>
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="flex gap-3">
                        <div className="h-3.5 w-20 bg-muted rounded" />
                        <div className="h-3.5 w-20 bg-muted rounded" />
                        <div className="h-3.5 w-20 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <div className="h-8 w-8 bg-muted rounded" />
                      <div className="h-8 w-8 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : seasonHalves.length === 0 && selectedSeasonId ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-muted-foreground mb-4">{t('error.noSeasonHalf')}</p>
              <Button onClick={handleCreateSeasonHalves} disabled={isCreatingHalves}>
                {isCreatingHalves && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                {t('actions.createSeasonHalves')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Half tabs */}
            <div className="flex bg-secondary/50 p-0.5 rounded-lg w-full">
              <Button
                variant={selectedHalf === 'FIRST_HALF' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedHalf('FIRST_HALF')}
                className="flex-1 text-xs h-8"
              >
                {t('tabs.firstHalf')}
              </Button>
              <Button
                variant={selectedHalf === 'SECOND_HALF' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedHalf('SECOND_HALF')}
                className="flex-1 text-xs h-8"
              >
                {t('tabs.secondHalf')}
              </Button>
            </div>

            {/* Plazos list */}
            {isLoadingPlazos ? (
              <div className="w-full space-y-3 mb-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="w-full">
                    <CardContent className="py-4 animate-pulse">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-32 bg-muted rounded" />
                            <div className="h-5 w-8 bg-muted rounded" />
                            <div className="h-5 w-16 bg-muted rounded-full" />
                          </div>
                          <div className="h-4 w-40 bg-muted rounded" />
                          <div className="flex gap-3">
                            <div className="h-3.5 w-20 bg-muted rounded" />
                            <div className="h-3.5 w-20 bg-muted rounded" />
                            <div className="h-3.5 w-20 bg-muted rounded" />
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <div className="h-8 w-8 bg-muted rounded" />
                          <div className="h-8 w-8 bg-muted rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : plazos.length === 0 ? (
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('empty')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="w-full space-y-3 mb-8">
                {plazos.map((plazo) => (
                  <PlazoCard
                    key={plazo.id}
                    plazo={plazo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefresh={() => {
                      const half = getSelectedSeasonHalf()
                      if (half) loadPlazos(half.id)
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Form dialog */}
        <PlazoFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open)
            if (!open) setEditingPlazo(null)
          }}
          editingPlazo={editingPlazo}
          competitions={competitions}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
