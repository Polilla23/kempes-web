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
import { ChevronRight, Trophy, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { LeagueWizardState } from '@/types/fixture'
import { SeasonService } from '@/services/season.service'

interface Step1CreateLeaguesUnifiedProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
}

type LeaguePosition = 'TOP' | 'MIDDLE' | 'BOTTOM'
type RoundType = 'match' | 'match_and_rematch'

interface LeagueFormData {
  id: string
  letter: string
  position: LeaguePosition
  roundType: RoundType
  firstIsChampion: boolean
  directPromotions: number
  playoffPromotions: number
  directRelegations: number
  playoffRelegations: number
}

const LEAGUE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const MAX_LEAGUES = 6

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
          directPromotions: position === 'TOP' ? 0 : 2,
          playoffPromotions: 0,
          directRelegations: position === 'BOTTOM' ? 0 : 2,
          playoffRelegations: 0,
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

  // Recalcular posiciones de todas las ligas cuando cambia la cantidad
  const updateLeaguePositions = (updatedLeagues: LeagueFormData[]) => {
    return updatedLeagues.map((league, index) => {
      const newPosition = calculateLeaguePosition(index, updatedLeagues.length)

      // Ajustar ascensos/descensos según la nueva posición
      const updates: Partial<LeagueFormData> = { position: newPosition }

      if (newPosition === 'TOP') {
        // TOP no tiene ascensos
        updates.directPromotions = 0
        updates.playoffPromotions = 0
        updates.firstIsChampion = league.firstIsChampion ?? true
      } else if (newPosition === 'BOTTOM') {
        // BOTTOM no tiene descensos
        updates.directRelegations = 0
        updates.playoffRelegations = 0
        updates.firstIsChampion = false
      } else {
        // MIDDLE tiene ambos
        updates.firstIsChampion = false
      }

      return { ...league, ...updates }
    })
  }

  const handleUpdateLeague = (id: string, updates: Partial<LeagueFormData>) => {
    setLeagues(
      leagues.map((league) =>
        league.id === id
          ? {
              ...league,
              ...updates,
            }
          : league
      )
    )
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

      onNext()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('step1.errorCreating'))
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
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
                            handleUpdateLeague(league.id, { firstIsChampion: checked })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Promociones: Solo para MIDDLE y BOTTOM */}
                    {league.position !== 'TOP' && (
                      <div className="space-y-3">
                        <Label className="font-semibold">{t('step1.promotions.title')}</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`directPromotions-${league.id}`} className="text-sm w-24">
                              {t('step1.promotions.direct')}
                            </Label>
                            <Input
                              id={`directPromotions-${league.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={league.directPromotions}
                              onChange={(e) =>
                                handleUpdateLeague(league.id, {
                                  directPromotions: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`playoffPromotions-${league.id}`} className="text-sm w-24">
                              {t('step1.promotions.playoff')}
                            </Label>
                            <Input
                              id={`playoffPromotions-${league.id}`}
                              type="number"
                              min="0"
                              max="10"
                              value={league.playoffPromotions}
                              onChange={(e) =>
                                handleUpdateLeague(league.id, {
                                  playoffPromotions: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Descensos: Solo para TOP y MIDDLE */}
                    {league.position !== 'BOTTOM' && (
                      <div className="space-y-3">
                        <Label className="font-semibold">{t('step1.relegations.title')}</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`directRelegations-${league.id}`} className="text-sm w-24">
                              {t('step1.relegations.direct')}
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
                              {t('step1.relegations.playoff')}
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
  )
}
