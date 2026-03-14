import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Users, AlertCircle, Trophy, ArrowUp, ArrowDown } from 'lucide-react'
import type { LeagueWizardState, AvailableTeam, TeamMovement } from '@/types/fixture'
import { ClubService } from '@/services/club.service'
import { SeasonService } from '@/services/season.service'
import { ClickableTeamItem } from './clickable-team-item'
import { ClickableZone } from './clickable-zone'

interface Step3TeamAssignmentProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
  onBack: () => void
}

export function Step3TeamAssignment({ wizardState, onUpdate, onNext, onBack }: Step3TeamAssignmentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [teamMovements, setTeamMovements] = useState<Map<string, TeamMovement>>(new Map())

  const loadAvailableTeams = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await ClubService.getClubs()
      const teams: AvailableTeam[] = response.clubs
        .filter((club) => club.isActive)
        .map((club) => ({
          id: club.id,
          name: club.name,
          logo: club.logo,
          isAssigned: false,
        }))

      // 2. Obtener movimientos de la temporada anterior (si existe)
      let movements = new Map<string, TeamMovement>()
      const previousSeasonNumber = (wizardState.seasonNumber || 1) - 1

      if (previousSeasonNumber > 0) {
        try {
          const movementsData = await SeasonService.getSeasonMovements(previousSeasonNumber, wizardState.competitionCategory)
          movements = new Map(
            movementsData.map((m: any) => [m.clubId, m])
          )
        } catch (error) {
          console.warn('No se pudieron cargar movimientos de temporada anterior:', error)
        }
      }

      setTeamMovements(movements)

      // 3. Pre-asignar equipos según movimientos
      const initialAssignments = { ...wizardState.teamAssignments }
      const leagues = wizardState.leagueCreationConfigs || []

      // Inicializar arrays vacíos para cada liga
      leagues.forEach((league) => {
        if (!initialAssignments[league.id]) {
          initialAssignments[league.id] = []
        }
      })

      // 4. Pre-asignar equipos según movimientos de la temporada anterior
      if (previousSeasonNumber > 0 && movements.size > 0) {
        teams.forEach(team => {
          const movement = movements.get(team.id)
          if (movement && movement.toLeague) {
            const targetLeague = leagues.find(l =>
              l.competitionType?.name === movement.toLeague
            )

            if (targetLeague && !initialAssignments[targetLeague.id].includes(team.id)) {
              initialAssignments[targetLeague.id].push(team.id)
            }
          }
        })
      }

      onUpdate({
        ...wizardState,
        availableTeams: teams,
        teamAssignments: initialAssignments,
      })
    } catch (err) {
      console.error('Error loading teams:', err)
      setError('Error al cargar los equipos. Por favor, intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAvailableTeams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(prev => prev === teamId ? null : teamId)
  }

  const handleAssignTeam = (leagueId: string) => {
    if (!selectedTeamId) return

    const leagues = wizardState.leagueCreationConfigs || []
    if (!leagues.find((l) => l.id === leagueId)) return

    // Remove team from any previous league
    const updatedAssignments = { ...wizardState.teamAssignments }
    Object.keys(updatedAssignments).forEach((lid) => {
      updatedAssignments[lid] = updatedAssignments[lid].filter((id) => id !== selectedTeamId)
    })

    // Add to new league
    if (!updatedAssignments[leagueId].includes(selectedTeamId)) {
      updatedAssignments[leagueId] = [...updatedAssignments[leagueId], selectedTeamId]
    }

    onUpdate({
      ...wizardState,
      teamAssignments: updatedAssignments,
    })
    setSelectedTeamId(null)
  }

  const handleRemoveTeam = (_leagueId: string, teamId: string) => {
    const updatedAssignments = { ...wizardState.teamAssignments }
    Object.keys(updatedAssignments).forEach((lid) => {
      updatedAssignments[lid] = updatedAssignments[lid].filter((id) => id !== teamId)
    })

    onUpdate({
      ...wizardState,
      teamAssignments: updatedAssignments,
    })
  }

  const handleNext = () => {
    if (validateAssignments()) {
      onNext()
    }
  }

  const validateAssignments = (): boolean => {
    const leagues = wizardState.leagueCreationConfigs || []
    const invalidLeagues = leagues.filter((league) => {
      const teamCount = wizardState.teamAssignments[league.id]?.length || 0
      return teamCount < 4
    })

    if (invalidLeagues.length > 0) {
      setError(
        `Las siguientes ligas necesitan al menos 4 equipos: ${invalidLeagues.map((l) => l.name).join(', ')}`
      )
      return false
    }

    setError(null)
    return true
  }

  // Obtener equipos sin asignar
  const getUnassignedTeams = (): AvailableTeam[] => {
    const assignedIds = new Set(Object.values(wizardState.teamAssignments).flat())
    return wizardState.availableTeams.filter((team) => !assignedIds.has(team.id))
  }

  // Obtener equipos asignados a una liga
  const getLeagueTeams = (leagueId: string): AvailableTeam[] => {
    const teamIds = wizardState.teamAssignments[leagueId] || []
    return teamIds
      .map((id) => wizardState.availableTeams.find((t) => t.id === id))
      .filter(Boolean) as AvailableTeam[]
  }

  // Calcular estadísticas de movimientos para una liga
  const getLeagueMovementStats = (leagueId: string) => {
    const teams = getLeagueTeams(leagueId)
    const stats = { promotions: 0, relegations: 0, stayed: 0 }

    teams.forEach(team => {
      const movement = teamMovements.get(team.id)
      if (movement) {
        if (movement.movementType.includes('PROMOTION')) stats.promotions++
        else if (movement.movementType.includes('RELEGATION')) stats.relegations++
        else if (movement.movementType === 'STAYED') stats.stayed++
      }
    })

    return stats
  }

  // Componente para mostrar el badge de movimiento
  const MovementBadge = ({ movement }: { movement: TeamMovement }) => {
    const getMovementConfig = () => {
      switch (movement.movementType) {
        case 'CHAMPION':
          return {
            icon: '\u{1F3C6}',
            className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
            label: 'Campeón'
          }
        case 'DIRECT_PROMOTION':
          return {
            icon: '\u2B06\uFE0F',
            className: 'bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
            label: 'Ascenso'
          }
        case 'PLAYOFF_PROMOTION':
          return {
            icon: '\u2B06\uFE0F',
            className: 'bg-lime-500/10 text-lime-700 border-lime-500/20 dark:bg-lime-500/20 dark:text-lime-300 dark:border-lime-500/30',
            label: 'Ascenso (Playoff)'
          }
        case 'DIRECT_RELEGATION':
          return {
            icon: '\u2B07\uFE0F',
            className: 'bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
            label: 'Descenso'
          }
        case 'PLAYOFF_RELEGATION':
          return {
            icon: '\u2B07\uFE0F',
            className: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
            label: 'Descenso (Playoff)'
          }
        case 'STAYED':
          return {
            icon: '\u2796',
            className: 'bg-muted text-muted-foreground border-border',
            label: 'Se mantiene'
          }
        default:
          return { icon: '', className: '', label: '' }
      }
    }

    const config = getMovementConfig()

    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.icon} {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
        <Card>
          <CardContent className="flex justify-between pt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const unassignedTeams = getUnassignedTeams()
  const totalTeams = wizardState.availableTeams.length
  const assignedTeams = totalTeams - unassignedTeams.length

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Asignación de Equipos
              </CardTitle>
              <CardDescription className="mt-2">
                Selecciona un equipo y haz click en una liga para asignarlo (mínimo 4 equipos por liga)
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{assignedTeams}</div>
                <div className="text-sm text-muted-foreground">Asignados</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">{unassignedTeams.length}</div>
                <div className="text-sm text-muted-foreground">Disponibles</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Click-to-Assign */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo: Equipos disponibles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipos Disponibles</CardTitle>
            <CardDescription>
              {selectedTeamId
                ? 'Ahora haz click en una liga para asignarlo'
                : 'Selecciona un equipo para asignarlo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
              {unassignedTeams.length === 0 ? (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-muted-foreground text-sm">
                  Todos los equipos han sido asignados
                </div>
              ) : (
                unassignedTeams.map((team) => {
                  const movement = teamMovements.get(team.id)
                  return (
                    <ClickableTeamItem
                      key={team.id}
                      team={team}
                      isSelected={selectedTeamId === team.id}
                      onClick={() => handleSelectTeam(team.id)}
                      badge={movement ? <MovementBadge movement={movement} /> : undefined}
                    />
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel derecho: Ligas */}
        <div className="space-y-4">
          {(wizardState.leagueCreationConfigs || []).map((league) => {
            const leagueTeams = getLeagueTeams(league.id)
            const isValid = leagueTeams.length >= 4
            const movementStats = getLeagueMovementStats(league.id)

            return (
              <Card key={league.id} className={!isValid ? 'border-destructive' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{league.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isValid ? 'default' : 'destructive'}>
                        {leagueTeams.length} {leagueTeams.length === 1 ? 'equipo' : 'equipos'}
                      </Badge>
                    </div>
                  </div>

                  {/* Mostrar estadísticas de movimientos */}
                  {(movementStats.promotions > 0 || movementStats.relegations > 0) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {movementStats.promotions > 0 && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-300">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          {movementStats.promotions} ascenso{movementStats.promotions > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {movementStats.relegations > 0 && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-300">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          {movementStats.relegations} descenso{movementStats.relegations > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  )}

                  {!isValid && (
                    <CardDescription className="text-destructive mt-2">
                      Se necesitan al menos {4 - leagueTeams.length} equipos más
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <ClickableZone
                    id={league.id}
                    teams={leagueTeams}
                    onAssignTeam={handleAssignTeam}
                    onRemoveTeam={handleRemoveTeam}
                    isSelectionActive={selectedTeamId !== null}
                    minTeams={4}
                    emptyMessage="Selecciona equipos para asignar aquí"
                    renderBadge={(team) => {
                      const movement = teamMovements.get(team.id)
                      return movement ? <MovementBadge movement={movement} /> : undefined
                    }}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Botones de navegación */}
      <Card>
        <CardContent className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Atrás
          </Button>
          <Button type="button" onClick={handleNext} className="gap-2">
            Continuar al Preview
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
