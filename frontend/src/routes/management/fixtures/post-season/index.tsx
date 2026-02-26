import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Trophy,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowUpDown,
  PlayCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { SeasonService } from '@/services/season.service'
import CompetitionService, {
  type Competition,
  type PostSeasonStatus,
} from '@/services/competition.service'

export const Route = createFileRoute('/management/fixtures/post-season/')({
  component: PostSeasonPage,
})

interface LeagueWithStatus {
  competition: Competition
  postSeasonStatus: PostSeasonStatus | null
  isLoadingStatus: boolean
}

function PostSeasonPage() {
  const [leagues, setLeagues] = useState<LeagueWithStatus[]>([])
  const [activeSeason, setActiveSeason] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. Obtener temporada activa
      const seasonResponse = await SeasonService.getSeasons()
      const active = seasonResponse.seasons.find((s: any) => s.isActive)
      if (!active) {
        setError('No hay una temporada activa')
        setIsLoading(false)
        return
      }
      setActiveSeason(active)

      // 2. Obtener competiciones de la temporada
      const compResponse = await CompetitionService.getCompetitions()
      const allComps = compResponse?.data || []

      // Filtrar solo ligas activas de esta temporada
      const seasonLeagues = allComps.filter(
        (c: Competition) =>
          c.seasonId === active.id &&
          (c.competitionType?.format || c.type?.format) === 'LEAGUE' &&
          c.isActive
      )

      // Ordenar por hierarchy
      seasonLeagues.sort((a: Competition, b: Competition) => {
        const hierA = a.competitionType?.hierarchy || a.type?.hierarchy || 999
        const hierB = b.competitionType?.hierarchy || b.type?.hierarchy || 999
        return hierA - hierB
      })

      // 3. Cargar estado de post-temporada para cada liga
      const leaguesWithStatus: LeagueWithStatus[] = seasonLeagues.map((comp: Competition) => ({
        competition: comp,
        postSeasonStatus: null,
        isLoadingStatus: true,
      }))
      setLeagues(leaguesWithStatus)
      setIsLoading(false)

      // Cargar status en paralelo
      const statusPromises = seasonLeagues.map(async (comp: Competition, index: number) => {
        try {
          const status = await CompetitionService.getPostSeasonStatus(comp.id)
          setLeagues((prev) => {
            const updated = [...prev]
            updated[index] = {
              ...updated[index],
              postSeasonStatus: status,
              isLoadingStatus: false,
            }
            return updated
          })
        } catch (err) {
          console.error(`Error loading post-season status for ${comp.name}:`, err)
          setLeagues((prev) => {
            const updated = [...prev]
            updated[index] = {
              ...updated[index],
              isLoadingStatus: false,
            }
            return updated
          })
        }
      })

      await Promise.all(statusPromises)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos')
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleExpanded = (compId: string) => {
    setExpandedLeagues((prev) => {
      const next = new Set(prev)
      if (next.has(compId)) {
        next.delete(compId)
      } else {
        next.add(compId)
      }
      return next
    })
  }

  const handleGeneratePostSeason = async (competitionId: string, competitionName: string) => {
    try {
      setActionLoading(competitionId)
      setError(null)
      setSuccessMessage(null)

      const result = await CompetitionService.generatePostSeason(competitionId)

      setSuccessMessage(
        `Post-temporada generada para ${competitionName}: ${result.matchesCreated} partidos creados (${result.phases.map((p) => `${p.phase}: ${p.matchesCreated}`).join(', ')})`
      )

      // Recargar datos
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Error al generar post-temporada')
    } finally {
      setActionLoading(null)
    }
  }

  const handleGeneratePromotions = async (upperCompId: string, lowerCompId: string) => {
    if (!activeSeason) return

    try {
      setActionLoading(`promo-${upperCompId}-${lowerCompId}`)
      setError(null)
      setSuccessMessage(null)

      const result = await CompetitionService.generatePromotions({
        upperCompetitionId: upperCompId,
        lowerCompetitionId: lowerCompId,
        seasonId: activeSeason.id,
      })

      setSuccessMessage(
        `Promociones generadas: ${result.competition.name} (${result.matchesCreated} partidos)`
      )

      await loadData()
    } catch (err: any) {
      setError(err.message || 'Error al generar promociones')
    } finally {
      setActionLoading(null)
    }
  }

  const getPhaseLabel = (phase: string): string => {
    const labels: Record<string, string> = {
      LIGUILLA: 'Liguilla',
      TRIANGULAR_SEMI: 'Triangular - Semi',
      TRIANGULAR_FINAL: 'Triangular - Final',
      PLAYOUT: 'Playout',
      REDUCIDO_QUARTER: 'Reducido - Cuartos',
      REDUCIDO_SEMI: 'Reducido - Semi',
      REDUCIDO_FINAL: 'Reducido - Final',
      PROMOTION: 'Promocion',
    }
    return labels[phase] || phase
  }

  const getStatusIcon = (isComplete: boolean) => {
    return isComplete ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-500" />
    )
  }

  const getLeaguePositionLabel = (comp: Competition): string => {
    const rules = comp.rules as any
    if (rules?.league_position === 'TOP') return '1ra Division'
    if (rules?.league_position === 'MIDDLE') return 'Intermedia'
    if (rules?.league_position === 'BOTTOM') return 'Ultima'
    // Fallback: usar hierarchy
    const hier = comp.competitionType?.hierarchy || comp.type?.hierarchy || 999
    if (hier <= 2) return '1ra Division'
    if (hier >= 10) return 'Ultima'
    return 'Intermedia'
  }

  const canGeneratePostSeason = (status: PostSeasonStatus | null): boolean => {
    if (!status) return false
    return status.regularSeasonComplete && status.hasPostSeason && !status.postSeasonGenerated
  }

  const isPostSeasonComplete = (status: PostSeasonStatus | null): boolean => {
    if (!status) return false
    if (!status.postSeasonGenerated) return !status.hasPostSeason && status.regularSeasonComplete
    return status.phases.every((p) => p.isComplete)
  }

  const canGeneratePromotions = (upperIndex: number, lowerIndex: number): boolean => {
    const upper = leagues[upperIndex]
    const lower = leagues[lowerIndex]
    if (!upper || !lower) return false
    return isPostSeasonComplete(upper.postSeasonStatus) && isPostSeasonComplete(lower.postSeasonStatus)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Gestion de Post-Temporada
          </CardTitle>
          <CardDescription>
            Genera y administra los playoffs, playout, reducido y promociones de las ligas
            {activeSeason && ` - Temporada ${activeSeason.number}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Success message */}
      {successMessage && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando ligas...</span>
          </CardContent>
        </Card>
      )}

      {/* No leagues */}
      {!isLoading && leagues.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay ligas en la temporada activa</p>
          </CardContent>
        </Card>
      )}

      {/* Liga cards */}
      {!isLoading &&
        leagues.map((league, index) => {
          const status = league.postSeasonStatus
          const isExpanded = expandedLeagues.has(league.competition.id)
          const regularProgress = status
            ? (status.regularMatchesPlayed / Math.max(status.regularMatchesTotal, 1)) * 100
            : 0

          return (
            <Card key={league.competition.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleExpanded(league.competition.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{league.competition.name}</CardTitle>
                      <CardDescription>{getLeaguePositionLabel(league.competition)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {league.isLoadingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status ? (
                      <>
                        {status.regularSeasonComplete ? (
                          <Badge variant="default">Fase Regular Completa</Badge>
                        ) : (
                          <Badge variant="secondary">
                            En Curso ({status.regularMatchesPlayed}/{status.regularMatchesTotal})
                          </Badge>
                        )}
                        {status.hasPostSeason && status.postSeasonGenerated && (
                          <Badge variant={isPostSeasonComplete(status) ? 'default' : 'outline'}>
                            {isPostSeasonComplete(status) ? 'Post-Temporada Completa' : 'Post-Temporada En Curso'}
                          </Badge>
                        )}
                        {!status.hasPostSeason && status.regularSeasonComplete && (
                          <Badge variant="secondary">Sin Post-Temporada</Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline">Sin datos</Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Regular Season Progress */}
                  {status && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Fase Regular</span>
                        <span className="text-muted-foreground">
                          {status.regularMatchesPlayed} / {status.regularMatchesTotal} partidos
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${regularProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Post-season info */}
                  {status && !status.hasPostSeason && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Esta liga no tiene post-temporada configurada</p>
                      <p className="text-sm">El primero es campeon directo</p>
                    </div>
                  )}

                  {status && status.hasPostSeason && !status.postSeasonGenerated && (
                    <div className="text-center py-4 space-y-4">
                      <p className="text-muted-foreground">
                        {status.regularSeasonComplete
                          ? 'La fase regular esta completa. Puedes generar la post-temporada.'
                          : 'Esperando a que termine la fase regular para generar post-temporada.'}
                      </p>
                      <Button
                        onClick={() =>
                          handleGeneratePostSeason(
                            league.competition.id,
                            league.competition.name
                          )
                        }
                        disabled={
                          !canGeneratePostSeason(status) ||
                          actionLoading === league.competition.id
                        }
                        className="gap-2"
                      >
                        {actionLoading === league.competition.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Generar Post-Temporada
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Post-season phases */}
                  {status && status.postSeasonGenerated && status.phases.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Fases de Post-Temporada:</h4>
                      {status.phases.map((phase) => (
                        <div
                          key={phase.phase}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(phase.isComplete)}
                              <span className="font-medium">{getPhaseLabel(phase.phase)}</span>
                            </div>
                            <Badge variant={phase.isComplete ? 'default' : 'secondary'}>
                              {phase.isComplete ? 'Completa' : 'En Curso'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {phase.matches.length} partido{phase.matches.length !== 1 ? 's' : ''} -{' '}
                            {phase.matches.filter((m) => m.status === 'FINALIZADO').length} finalizado
                            {phase.matches.filter((m) => m.status === 'FINALIZADO').length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}

      {/* Promotion pairs */}
      {!isLoading && leagues.length > 1 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-primary" />
                Promociones entre Divisiones
              </CardTitle>
              <CardDescription>
                Genera partidos de promocion entre ligas adyacentes cuando ambas hayan completado su
                post-temporada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leagues.slice(0, -1).map((upperLeague, i) => {
                const lowerLeague = leagues[i + 1]
                if (!lowerLeague) return null

                const promoKey = `promo-${upperLeague.competition.id}-${lowerLeague.competition.id}`
                const canGenerate = canGeneratePromotions(i, i + 1)
                const upperComplete = isPostSeasonComplete(upperLeague.postSeasonStatus)
                const lowerComplete = isPostSeasonComplete(lowerLeague.postSeasonStatus)

                return (
                  <div key={promoKey} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-center space-y-1">
                          <div className="font-medium text-sm">{upperLeague.competition.name}</div>
                          <div className="flex items-center gap-1">
                            {upperComplete ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-yellow-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {upperComplete ? 'Lista' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <ArrowUpDown className="h-5 w-5 text-muted-foreground mx-2" />
                        <div className="text-center space-y-1">
                          <div className="font-medium text-sm">{lowerLeague.competition.name}</div>
                          <div className="flex items-center gap-1">
                            {lowerComplete ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-yellow-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {lowerComplete ? 'Lista' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          handleGeneratePromotions(
                            upperLeague.competition.id,
                            lowerLeague.competition.id
                          )
                        }
                        disabled={!canGenerate || actionLoading === promoKey}
                        variant={canGenerate ? 'default' : 'outline'}
                        className="gap-2"
                      >
                        {actionLoading === promoKey ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <ArrowUpDown className="h-4 w-4" />
                            Generar Promociones
                          </>
                        )}
                      </Button>
                    </div>

                    {!canGenerate && (
                      <p className="text-xs text-muted-foreground">
                        Ambas ligas deben completar su fase regular y post-temporada antes de generar
                        promociones
                      </p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
