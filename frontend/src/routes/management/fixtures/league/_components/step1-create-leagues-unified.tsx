import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronRight, Trophy, Loader2, AlertCircle, Plus, Trash2, Settings } from 'lucide-react'
import { toast } from 'sonner'
import type { LeagueWizardState } from '@/types/fixture'
import { SeasonService } from '@/services/season.service'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Step1CreateLeaguesUnifiedProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
}

type LeaguePosition = 'TOP' | 'MIDDLE' | 'BOTTOM'
type RoundType = 'match' | 'match_and_rematch'
type ChampionshipFormat = 'direct' | 'playoff' | 'triangular' | null
type PlayoffType = 'PLAYOUT' | 'REDUCIDO' | 'PROMOTION'
type PlayoffAction = 'ASCEND' | 'DESCEND' | 'STAY' | 'PROMOTION'

interface PlayoffConfig {
  id: string
  name: string
  type: PlayoffType
  positions: string // e.g., "5, 6" or "3, 4, 5"
  winnerAction: PlayoffAction
  loserAction: PlayoffAction
  winnerTargetPosition?: number // Si va a PROMOTION
  loserTargetPosition?: number // Si va a PROMOTION
}

interface LeagueFormData {
  id: string
  letter: string
  position: LeaguePosition
  roundType: RoundType
  firstIsChampion: boolean
  championshipFormat: ChampionshipFormat
  playoffTeams: number
  directPromotions: number
  playoffPromotions: number
  directRelegations: number
  playoffRelegations: number
  playoffConfigs: PlayoffConfig[]
}

// Calcular posición automáticamente: A siempre TOP, última BOTTOM, intermedias MIDDLE
const calculateLeaguePosition = (index: number, totalLeagues: number): LeaguePosition => {
  if (index === 0) return 'TOP' // Primera liga (A) siempre TOP
  if (index === totalLeagues - 1) return 'BOTTOM' // Última liga siempre BOTTOM
  return 'MIDDLE' // Intermedias son MIDDLE
}

export function Step1CreateLeaguesUnified({ wizardState, onUpdate, onNext }: Step1CreateLeaguesUnifiedProps) {
  const { t } = useTranslation('fixtures')
  const [leagues, setLeagues] = useState<LeagueFormData[]>([])
  const [seasonNumber, setSeasonNumber] = useState<number | undefined>(undefined)
  const [seasonId, setSeasonId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingSeason, setIsLoadingSeason] = useState(true)
  const [seasonError, setSeasonError] = useState<string | null>(null)
  const [playoffModalOpen, setPlayoffModalOpen] = useState(false)
  const [selectedLeagueForPlayoffs, setSelectedLeagueForPlayoffs] = useState<string | null>(null)

  // Inicializar ligas desde el Step0
  useEffect(() => {
    if (wizardState.selectedLeagues && wizardState.selectedLeagues.length > 0 && leagues.length === 0) {
      const initialLeagues: LeagueFormData[] = wizardState.selectedLeagues.map((letter, index) => {
        const position = calculateLeaguePosition(index, wizardState.selectedLeagues!.length)
        return {
          id: crypto.randomUUID(),
          letter,
          position,
          roundType: 'match_and_rematch' as RoundType,
          firstIsChampion: position === 'TOP',
          championshipFormat: position === 'TOP' ? 'direct' : null,
          playoffTeams: 0,
          directPromotions: position === 'TOP' ? 0 : 2,
          playoffPromotions: 0,
          directRelegations: position === 'BOTTOM' ? 0 : 2,
          playoffRelegations: 0,
          playoffConfigs: [],
        }
      })
      setLeagues(initialLeagues)
    }
  }, [wizardState.selectedLeagues, leagues.length])

  useEffect(() => {
    const loadActiveSeason = async () => {
      try {
        setIsLoadingSeason(true)
        setSeasonError(null)
        const { season } = await SeasonService.getActiveSeason()
        if (season) {
          setSeasonNumber(season.number)
          setSeasonId(season.id)
        } else {
          const errorMsg = t('step1.alert.noSeason')
          setSeasonError(errorMsg)
          toast.error(errorMsg)
        }
      } catch (error) {
        console.error('Error loading active season:', error)
        const errorMsg = t('step1.alert.errorLoading')
        setSeasonError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setIsLoadingSeason(false)
      }
    }

    loadActiveSeason()
  }, [t])

  const getLeagueName = (letter: string) => `Liga ${letter} - S${seasonNumber ?? '?'}`

  const handleUpdateLeague = (id: string, updates: Partial<LeagueFormData>) => {
    setLeagues((prevLeagues) => {
      const updatedLeagues = prevLeagues.map((league) =>
        league.id === id
          ? {
              ...league,
              ...updates,
            }
          : league
      )

      // Si se modificaron descensos de una liga, ajustar ascensos de la liga inferior
      if (updates.directRelegations !== undefined || updates.playoffRelegations !== undefined) {
        const currentLeagueIndex = updatedLeagues.findIndex((l) => l.id === id)
        const nextLeagueIndex = currentLeagueIndex + 1

        if (nextLeagueIndex < updatedLeagues.length) {
          const currentLeague = updatedLeagues[currentLeagueIndex]

          // Auto-ajustar ascensos de la liga inferior
          updatedLeagues[nextLeagueIndex] = {
            ...updatedLeagues[nextLeagueIndex],
            directPromotions: updates.directRelegations ?? currentLeague.directRelegations,
            playoffPromotions: updates.playoffRelegations ?? currentLeague.playoffRelegations,
          }
        }
      }

      return updatedLeagues
    })
  }

  // Funciones para manejar playoffs
  const handleOpenPlayoffModal = (leagueId: string) => {
    setSelectedLeagueForPlayoffs(leagueId)
    setPlayoffModalOpen(true)
  }

  const handleClosePlayoffModal = () => {
    setPlayoffModalOpen(false)
    setSelectedLeagueForPlayoffs(null)
  }

  const handleAddPlayoff = () => {
    if (!selectedLeagueForPlayoffs) return

    const newPlayoff: PlayoffConfig = {
      id: crypto.randomUUID(),
      name: '',
      type: 'PLAYOUT',
      positions: '',
      winnerAction: 'ASCEND',
      loserAction: 'DESCEND',
    }

    setLeagues((prev) =>
      prev.map((league) =>
        league.id === selectedLeagueForPlayoffs
          ? { ...league, playoffConfigs: [...league.playoffConfigs, newPlayoff] }
          : league
      )
    )
  }

  const handleRemovePlayoff = (playoffId: string) => {
    if (!selectedLeagueForPlayoffs) return

    setLeagues((prev) =>
      prev.map((league) =>
        league.id === selectedLeagueForPlayoffs
          ? { ...league, playoffConfigs: league.playoffConfigs.filter((p) => p.id !== playoffId) }
          : league
      )
    )
  }

  const handleUpdatePlayoff = (playoffId: string, updates: Partial<PlayoffConfig>) => {
    if (!selectedLeagueForPlayoffs) return

    setLeagues((prev) =>
      prev.map((league) =>
        league.id === selectedLeagueForPlayoffs
          ? {
              ...league,
              playoffConfigs: league.playoffConfigs.map((p) =>
                p.id === playoffId ? { ...p, ...updates } : p
              ),
            }
          : league
      )
    )
  }

  const getSelectedLeague = () => {
    return leagues.find((l) => l.id === selectedLeagueForPlayoffs)
  }

  const validateAndCreateLeagues = async () => {
    if (leagues.length === 0) {
      toast.error(t('step1.atLeastOne'))
      return
    }

    if (!seasonId) {
      toast.error(t('step1.noActiveSeason'))
      return
    }

    // Verificar que tengamos los CompetitionTypes del Step0
    if (!wizardState.createdCompetitionTypes || wizardState.createdCompetitionTypes.length === 0) {
      toast.error('Error: No se encontraron los tipos de competición del paso anterior')
      return
    }

    setIsCreating(true)
    try {
      // Mapear cada liga a su CompetitionType correspondiente
      onUpdate({
        ...wizardState,
        leagueCreationConfigs: leagues.map((league) => {
          // Buscar el CompetitionType correspondiente por letra
          const competitionType = wizardState.createdCompetitionTypes!.find(
            (ct) => ct.name === `LEAGUE_${league.letter}`
          )

          if (!competitionType) {
            throw new Error(`No se encontró el CompetitionType para Liga ${league.letter}`)
          }

          return {
            id: league.id,
            name: getLeagueName(league.letter),
            letter: league.letter,
            position: league.position,
            competitionType, // Usar el CompetitionType ya creado en Step0
            roundType: league.roundType,
            firstIsChampion: league.firstIsChampion,
            directPromotions: league.directPromotions,
            playoffPromotions: league.playoffPromotions,
            directRelegations: league.directRelegations,
            playoffRelegations: league.playoffRelegations,
            hasPlayoutForLastPromotion: league.playoffPromotions > 0,
          }
        }),
        seasonId,
        seasonNumber,
        activeSeason:
          seasonNumber && seasonId ? { id: seasonId, number: seasonNumber, isActive: true } : undefined,
      })

      // Mover onNext() después de limpiar el estado para prevenir doble click
      setIsCreating(false)
      onNext()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('step1.errorCreating'))
      console.error(error)
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            {t('step1.title')}
          </CardTitle>
          <CardDescription>{t('step1.description')}</CardDescription>
        </CardHeader>
      </Card>

      {seasonError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('step1.alert.title')}</strong> {seasonError}
          </AlertDescription>
        </Alert>
      )}

      {isLoadingSeason ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {leagues.map((league) => (
              <Card key={league.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          league.position === 'TOP'
                            ? 'default'
                            : league.position === 'MIDDLE'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="h-8 px-3"
                      >
                        {getLeagueName(league.letter)}
                      </Badge>
                      <Badge variant="outline">
                        {t(
                          `step1.position.${league.position === 'TOP' ? 'top' : league.position === 'MIDDLE' ? 'middle' : 'bottom'}`
                        )}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPlayoffModal(league.id)}
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Configurar Playoffs
                      {league.playoffConfigs.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {league.playoffConfigs.length}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`roundType-${league.id}`}>{t('step1.roundType.label')}</Label>
                    <Select
                      value={league.roundType}
                      onValueChange={(value) =>
                        handleUpdateLeague(league.id, { roundType: value as RoundType })
                      }
                    >
                      <SelectTrigger id={`roundType-${league.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">{t('step1.roundType.singleRound')}</SelectItem>
                        <SelectItem value="match_and_rematch">{t('step1.roundType.doubleRound')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {league.position === 'TOP' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label>{t('step1.champion.label')}</Label>
                          <p className="text-sm text-muted-foreground">{t('step1.champion.description')}</p>
                        </div>
                        <Checkbox
                          checked={league.firstIsChampion}
                          onCheckedChange={(checked: boolean) =>
                            handleUpdateLeague(league.id, {
                              firstIsChampion: checked,
                              championshipFormat: checked ? 'direct' : null,
                            })
                          }
                        />
                      </div>

                      {/* Opciones de formato de campeonato - siempre visibles pero deshabilitadas si firstIsChampion */}
                      <div
                        className={`space-y-3 rounded-lg border p-4 transition-all ${
                          league.firstIsChampion
                            ? 'bg-muted/20 opacity-50 pointer-events-none'
                            : 'bg-muted/30'
                        }`}
                      >
                        <Label className="font-semibold">Formato de Campeonato</Label>
                        <p className="text-xs text-muted-foreground">
                          Define cómo se determinará el campeón después de la fase regular
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`playoff-${league.id}`}
                              checked={league.championshipFormat === 'playoff'}
                              onChange={() =>
                                handleUpdateLeague(league.id, {
                                  championshipFormat: 'playoff',
                                  playoffTeams: 4,
                                })
                              }
                              disabled={league.firstIsChampion}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor={`playoff-${league.id}`}
                              className={`font-normal cursor-pointer ${league.firstIsChampion ? 'cursor-not-allowed' : ''}`}
                            >
                              Liguilla - Los mejores equipos se enfrentan en playoffs
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`triangular-${league.id}`}
                              checked={league.championshipFormat === 'triangular'}
                              onChange={() =>
                                handleUpdateLeague(league.id, {
                                  championshipFormat: 'triangular',
                                  playoffTeams: 3,
                                })
                              }
                              disabled={league.firstIsChampion}
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor={`triangular-${league.id}`}
                              className={`font-normal cursor-pointer ${league.firstIsChampion ? 'cursor-not-allowed' : ''}`}
                            >
                              Triangular - 3° vs 2° (semifinal), ganador vs 1° (final)
                            </Label>
                          </div>
                        </div>

                        {/* Input para cantidad de equipos en liguilla */}
                        {league.championshipFormat === 'playoff' && (
                          <div className="flex items-center gap-2 mt-3">
                            <Label htmlFor={`playoffTeams-${league.id}`} className="text-sm">
                              Equipos en liguilla:
                            </Label>
                            <Input
                              id={`playoffTeams-${league.id}`}
                              type="number"
                              min="4"
                              max="8"
                              value={league.playoffTeams}
                              onChange={(e) =>
                                handleUpdateLeague(league.id, {
                                  playoffTeams: parseInt(e.target.value) || 4,
                                })
                              }
                              disabled={league.firstIsChampion}
                              className="w-20"
                            />
                            <span className="text-xs text-muted-foreground">
                              (mantienen sus puntos de fase regular)
                            </span>
                          </div>
                        )}

                        {league.championshipFormat === 'triangular' && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              El triangular usa los 3 primeros equipos de la tabla. El 3° juega vs 2° en
                              semifinal, y el ganador enfrenta al 1° en la final.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Ascensos: Solo para MIDDLE y BOTTOM - DESHABILITADOS (se autoajustan) */}
                    {league.position !== 'TOP' && (
                      <div className="space-y-3 opacity-60">
                        <Label className="font-semibold">Ascensos</Label>
                        <p className="text-xs text-muted-foreground">
                          Se ajustan automáticamente según los descensos de la división superior
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`directPromotions-${league.id}`} className="text-sm w-24">
                              Directo
                            </Label>
                            <Input
                              id={`directPromotions-${league.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={league.directPromotions}
                              disabled
                              className="w-20 bg-muted cursor-not-allowed"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`playoffPromotions-${league.id}`} className="text-sm w-24">
                              Promoción
                            </Label>
                            <Input
                              id={`playoffPromotions-${league.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={league.playoffPromotions}
                              disabled
                              className="w-20 bg-muted cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Descensos: Solo para TOP y MIDDLE */}
                    {league.position !== 'BOTTOM' && (
                      <div className="space-y-3">
                        <Label className="font-semibold">Descensos</Label>
                        <p className="text-xs text-muted-foreground">
                          Modifica estos valores para ajustar automáticamente los ascensos de la división inferior
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`directRelegations-${league.id}`} className="text-sm w-24">
                              Directo
                            </Label>
                            <Input
                              id={`directRelegations-${league.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={league.directRelegations}
                              onChange={(e) =>
                                handleUpdateLeague(league.id, {
                                  directRelegations: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`playoffRelegations-${league.id}`} className="text-sm w-24">
                              Promoción
                            </Label>
                            <Input
                              id={`playoffRelegations-${league.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={league.playoffRelegations}
                              onChange={(e) =>
                                handleUpdateLeague(league.id, {
                                  playoffRelegations: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mensaje informativo si solo hay un lado */}
                    {(league.position === 'TOP' || league.position === 'BOTTOM') && (
                      <div className="flex items-center justify-center text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50">
                        {league.position === 'TOP'
                          ? t('step1.info.noPromotions')
                          : t('step1.info.noRelegations')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardFooter className="flex justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                {t('step1.footer.configured', { count: leagues.length })}
              </div>
              <Button
                onClick={validateAndCreateLeagues}
                disabled={isCreating || isLoadingSeason || !seasonId}
              >
                {(isCreating || isLoadingSeason) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoadingSeason ? t('wizard.buttons.loading') : t('wizard.buttons.createAndContinue')}
                {!isLoadingSeason && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
      </div>

      {/* Modal de configuración de playoffs */}
    <Dialog open={playoffModalOpen} onOpenChange={setPlayoffModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Playoffs - {getSelectedLeague()?.letter ? `Liga ${getSelectedLeague()?.letter}` : ''}</DialogTitle>
          <DialogDescription>
            Configura los playoffs, reducidos y playouts para esta liga. Puedes definir múltiples instancias encadenadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {getSelectedLeague()?.playoffConfigs.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay playoffs configurados. Haz clic en "Agregar Playoff" para comenzar.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <AlertDescription>
                  Total de playoffs configurados: <strong>{getSelectedLeague()?.playoffConfigs.length}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {getSelectedLeague()?.playoffConfigs.map((playoff) => (
                  <Card key={playoff.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{playoff.type}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePlayoff(playoff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Nombre */}
                      <div className="space-y-2">
                        <Label htmlFor={`playoff-name-${playoff.id}`}>Nombre</Label>
                        <Input
                          id={`playoff-name-${playoff.id}`}
                          placeholder="ej: Triangular Final, Reducido 1, Playout 5° vs 6°"
                          value={playoff.name}
                          onChange={(e) => handleUpdatePlayoff(playoff.id, { name: e.target.value })}
                        />
                      </div>

                      {/* Tipo */}
                      <div className="space-y-2">
                        <Label htmlFor={`playoff-type-${playoff.id}`}>Tipo</Label>
                        <Select
                          value={playoff.type}
                          onValueChange={(value: PlayoffType) =>
                            handleUpdatePlayoff(playoff.id, { type: value })
                          }
                        >
                          <SelectTrigger id={`playoff-type-${playoff.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLAYOUT">PLAYOUT - Pelea por no descender</SelectItem>
                            <SelectItem value="REDUCIDO">REDUCIDO - Pelea por ascender</SelectItem>
                            <SelectItem value="PROMOTION">PROMOTION - Definir ascenso directo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Posiciones */}
                      <div className="space-y-2">
                        <Label htmlFor={`playoff-positions-${playoff.id}`}>Posiciones</Label>
                        <Input
                          id={`playoff-positions-${playoff.id}`}
                          placeholder="ej: 5, 6  o  3, 4, 5"
                          value={playoff.positions}
                          onChange={(e) => handleUpdatePlayoff(playoff.id, { positions: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Posiciones de la tabla que participan (separadas por coma)
                        </p>
                      </div>

                      {/* Acción del ganador */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`playoff-winner-${playoff.id}`}>Ganador</Label>
                          <Select
                            value={playoff.winnerAction}
                            onValueChange={(value: PlayoffAction) =>
                              handleUpdatePlayoff(playoff.id, { winnerAction: value })
                            }
                          >
                            <SelectTrigger id={`playoff-winner-${playoff.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ASCEND">ASCEND - Sube de liga</SelectItem>
                              <SelectItem value="STAY">STAY - Se mantiene</SelectItem>
                              <SelectItem value="PROMOTION">PROMOTION - Va a otro playoff</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Posición objetivo del ganador si va a PROMOTION */}
                        {playoff.winnerAction === 'PROMOTION' && (
                          <div className="space-y-2">
                            <Label htmlFor={`playoff-winner-target-${playoff.id}`}>Posición destino</Label>
                            <Input
                              id={`playoff-winner-target-${playoff.id}`}
                              type="number"
                              min="1"
                              placeholder="ej: 2"
                              value={playoff.winnerTargetPosition || ''}
                              onChange={(e) =>
                                handleUpdatePlayoff(playoff.id, {
                                  winnerTargetPosition: parseInt(e.target.value) || undefined,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* Acción del perdedor */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`playoff-loser-${playoff.id}`}>Perdedor</Label>
                          <Select
                            value={playoff.loserAction}
                            onValueChange={(value: PlayoffAction) =>
                              handleUpdatePlayoff(playoff.id, { loserAction: value })
                            }
                          >
                            <SelectTrigger id={`playoff-loser-${playoff.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DESCEND">DESCEND - Baja de liga</SelectItem>
                              <SelectItem value="STAY">STAY - Se mantiene</SelectItem>
                              <SelectItem value="PROMOTION">PROMOTION - Va a otro playoff</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Posición objetivo del perdedor si va a PROMOTION */}
                        {playoff.loserAction === 'PROMOTION' && (
                          <div className="space-y-2">
                            <Label htmlFor={`playoff-loser-target-${playoff.id}`}>Posición destino</Label>
                            <Input
                              id={`playoff-loser-target-${playoff.id}`}
                              type="number"
                              min="1"
                              placeholder="ej: 3"
                              value={playoff.loserTargetPosition || ''}
                              onChange={(e) =>
                                handleUpdatePlayoff(playoff.id, {
                                  loserTargetPosition: parseInt(e.target.value) || undefined,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleAddPlayoff}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Playoff
          </Button>
          <Button variant="default" onClick={handleClosePlayoffModal}>
            Guardar y Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}