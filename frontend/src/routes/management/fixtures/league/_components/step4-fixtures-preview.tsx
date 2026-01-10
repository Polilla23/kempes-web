import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Check, Trophy, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import type { LeagueWizardState, LeaguesRules } from '@/types/fixture'
import api from '@/services/api'

interface Step4FixturesPreviewProps {
  wizardState: LeagueWizardState
  onBack: () => void
}

export function Step4FixturesPreview({ wizardState, onBack }: Step4FixturesPreviewProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCreateFixtures = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const leagues = wizardState.leagueCreationConfigs || []

      // Verificar que tengamos los CompetitionTypes
      if (!leagues.every((league) => league.competitionType && league.competitionType.id)) {
        throw new Error('Error: Faltan tipos de competición. Por favor, vuelve al paso anterior.')
      }

      console.log('📝 Using CompetitionTypes from wizard state...')

      // Construir el payload LeaguesRules usando los CompetitionTypes que ya tenemos
      const leaguesRules: LeaguesRules = {
        leagues: leagues.map((league) => {
          const clubIds = wizardState.teamAssignments[league.id] || []

          return {
            active_league: league.competitionType!, // Ya tenemos el CompetitionType completo
            position: league.position,
            roundType: league.roundType,
            clubIds, // IDs de los clubes asignados
            teams_index: [], // Ya no se usa pero mantenemos compatibilidad
            ...(league.position !== 'TOP' && {
              promotions: {
                direct: league.directPromotions,
                playoff: league.playoffPromotions,
              },
            }),
            ...(league.position !== 'BOTTOM' && {
              relegations: {
                direct: league.directRelegations,
                playoff: league.playoffRelegations,
              },
            }),
            firstIsChampion: league.firstIsChampion,
          }
        }),
        activeSeason: {
          id: wizardState.season!.id,
          number: wizardState.season!.number,
        },
        competitionCategory: wizardState.competitionCategory || 'SENIOR',
      }

      console.log('📤 Sending LeaguesRules:', JSON.stringify(leaguesRules, null, 2))

      // Enviar todo en una sola petición al endpoint de competitions
      const response = await api.post('/api/v1/competitions', leaguesRules)

      console.log('✅ Response:', response.data)

      setSuccess(true)

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate({ to: '/management/users' })
      }, 2000)
    } catch (err: any) {
      console.error('Error creating competitions and fixtures:', err)
      setError(
        err.response?.data?.message ||
          'Error al crear las competiciones y fixtures. Por favor, intenta nuevamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateFixtureStats = (leagueId: string, roundType: 'match' | 'match_and_rematch') => {
    const teams = wizardState.teamAssignments[leagueId] || []
    const isDoubleRound = roundType === 'match_and_rematch'

    const teamsCount = teams.length
    const matchesPerRound = Math.floor(teamsCount / 2)
    const roundsCount = teamsCount - 1
    const totalRounds = isDoubleRound ? roundsCount * 2 : roundsCount
    const totalMatches = matchesPerRound * totalRounds

    return {
      teamsCount,
      matchesPerRound,
      totalRounds,
      totalMatches,
      isDoubleRound,
    }
  }

  const getTeamName = (teamId: string): string => {
    return wizardState.availableTeams.find((t) => t.id === teamId)?.name || 'Equipo desconocido'
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold mb-2">¡Fixtures Creados Exitosamente!</h3>
          <p className="text-muted-foreground">Redirigiendo a la lista de fixtures...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Preview de Fixtures
          </CardTitle>
          <CardDescription>Revisa la configuración antes de crear los fixtures</CardDescription>
        </CardHeader>
      </Card>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resumen por liga */}
      <div className="space-y-4">
        {(wizardState.leagueCreationConfigs || []).map((league) => {
          const stats = calculateFixtureStats(league.id, league.roundType)
          const teams = wizardState.teamAssignments[league.id] || []

          return (
            <Card key={league.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{league.name}</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {league.position === 'TOP'
                      ? '1ra División'
                      : league.position === 'MIDDLE'
                        ? 'Intermedia'
                        : 'Última'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Configuración */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tipo de Ronda</p>
                    <p className="font-medium">
                      {league.roundType === 'match_and_rematch' ? 'Ida y Vuelta' : 'Solo Ida'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Equipos</p>
                    <p className="font-medium">{stats.teamsCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Jornadas</p>
                    <p className="font-medium">{stats.totalRounds}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Partidos</p>
                    <p className="font-medium text-primary">{stats.totalMatches}</p>
                  </div>
                </div>

                <Separator />

                {/* Reglas especiales */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Reglas de la Liga:</p>
                  <div className="flex flex-wrap gap-2">
                    {league.firstIsChampion && <Badge variant="secondary">🏆 Primero es Campeón</Badge>}
                    {league.position !== 'TOP' && league.directPromotions > 0 && (
                      <Badge variant="secondary">⬆️ {league.directPromotions} Ascensos Directos</Badge>
                    )}
                    {league.position !== 'TOP' && league.playoffPromotions > 0 && (
                      <Badge variant="secondary">⬆️ {league.playoffPromotions} Playoffs Ascenso</Badge>
                    )}
                    {league.position !== 'BOTTOM' && league.directRelegations > 0 && (
                      <Badge variant="destructive">⬇️ {league.directRelegations} Descensos Directos</Badge>
                    )}
                    {league.position !== 'BOTTOM' && league.playoffRelegations > 0 && (
                      <Badge variant="destructive">⬇️ {league.playoffRelegations} Playoffs Descenso</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Lista de equipos */}
                <div>
                  <p className="text-sm font-semibold mb-2">Equipos Participantes:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {teams.map((teamId, index) => (
                      <div key={teamId} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="truncate">{getTeamName(teamId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resumen total */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-lg">Resumen Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(wizardState.leagueCreationConfigs || []).length}
              </div>
              <div className="text-sm text-muted-foreground">Ligas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Object.values(wizardState.teamAssignments).flat().length}
              </div>
              <div className="text-sm text-muted-foreground">Equipos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(wizardState.leagueCreationConfigs || []).reduce((sum, league) => {
                  const stats = calculateFixtureStats(league.id, league.roundType)
                  return sum + stats.totalRounds
                }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Jornadas Totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(wizardState.leagueCreationConfigs || []).reduce((sum, league) => {
                  const stats = calculateFixtureStats(league.id, league.roundType)
                  return sum + stats.totalMatches
                }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Partidos Totales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <Card>
        <CardFooter className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Volver a Asignación
          </Button>
          <Button type="button" onClick={handleCreateFixtures} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando Fixtures...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Crear Fixtures
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
