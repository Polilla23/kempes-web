import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Users, AlertCircle, Trophy } from 'lucide-react'
import type { LeagueWizardState, AvailableTeam } from '@/types/fixture'
import { ClubService } from '@/services/club.service'
import { DroppableLeagueZone } from './droppable-league-zone'

interface Step3TeamAssignmentProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
  onBack: () => void
}

export function Step3TeamAssignment({ wizardState, onUpdate, onNext, onBack }: Step3TeamAssignmentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere mover 8px para iniciar drag
      },
    }),
    useSensor(KeyboardSensor)
  )

  const loadAvailableTeams = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await ClubService.getClubs()

      // Convertir clubs a AvailableTeam
      const teams: AvailableTeam[] = response.clubs
        .filter((club) => club.isActive)
        .map((club) => ({
          id: club.id,
          name: club.name,
          logo: club.logo,
          isAssigned: false,
        }))

      // Inicializar teamAssignments vacío para cada liga si no existe
      const initialAssignments = { ...wizardState.teamAssignments }
      const leagues = wizardState.leagueCreationConfigs || []
      leagues.forEach((league) => {
        if (!initialAssignments[league.id]) {
          initialAssignments[league.id] = []
        }
      })

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

  // Cargar equipos disponibles al montar el componente
  useEffect(() => {
    loadAvailableTeams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    const teamId = active.id as string
    const targetLeagueId = over.id as string

    // Si se soltó en "unassigned", quitar el equipo de cualquier liga
    if (targetLeagueId === 'unassigned') {
      const updatedAssignments = { ...wizardState.teamAssignments }
      Object.keys(updatedAssignments).forEach((leagueId) => {
        updatedAssignments[leagueId] = updatedAssignments[leagueId].filter((id) => id !== teamId)
      })

      onUpdate({
        ...wizardState,
        teamAssignments: updatedAssignments,
      })
      return
    }

    // Validar que targetLeagueId es una liga válida
    const leagues = wizardState.leagueCreationConfigs || []
    if (!leagues.find((l) => l.id === targetLeagueId)) {
      return
    }

    // Quitar el equipo de cualquier liga anterior
    const updatedAssignments = { ...wizardState.teamAssignments }
    Object.keys(updatedAssignments).forEach((leagueId) => {
      updatedAssignments[leagueId] = updatedAssignments[leagueId].filter((id) => id !== teamId)
    })

    // Agregar el equipo a la nueva liga (si no está ya)
    if (!updatedAssignments[targetLeagueId].includes(teamId)) {
      updatedAssignments[targetLeagueId] = [...updatedAssignments[targetLeagueId], teamId]
    }

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
    // Validar que cada liga tenga al menos 4 equipos
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

  // Obtener el equipo que se está arrastrando
  const activeTeam = activeId ? wizardState.availableTeams.find((t) => t.id === activeId) : null

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
                Arrastra los equipos a las ligas correspondientes (mínimo 4 equipos por liga)
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

      {/* Drag & Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo: Equipos disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipos Disponibles</CardTitle>
              <CardDescription>Arrastra un equipo a una liga para asignarlo</CardDescription>
            </CardHeader>
            <CardContent>
              <DroppableLeagueZone
                id="unassigned"
                teams={unassignedTeams}
                isEmpty={unassignedTeams.length === 0}
                emptyMessage="Todos los equipos han sido asignados"
              />
            </CardContent>
          </Card>

          {/* Panel derecho: Ligas */}
          <div className="space-y-4">
            {(wizardState.leagueCreationConfigs || []).map((league) => {
              const leagueTeams = getLeagueTeams(league.id)
              const isValid = leagueTeams.length >= 4

              return (
                <Card key={league.id} className={!isValid ? 'border-destructive' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{league.name}</CardTitle>
                      </div>
                      <Badge variant={isValid ? 'default' : 'destructive'}>
                        {leagueTeams.length} {leagueTeams.length === 1 ? 'equipo' : 'equipos'}
                      </Badge>
                    </div>
                    {!isValid && (
                      <CardDescription className="text-destructive">
                        Se necesitan al menos {4 - leagueTeams.length} equipos más
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <DroppableLeagueZone
                      id={league.id}
                      teams={leagueTeams}
                      isEmpty={leagueTeams.length === 0}
                      emptyMessage="Arrastra equipos aquí"
                      minTeams={4}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Drag Overlay - Muestra el equipo mientras se arrastra */}
        <DragOverlay>
          {activeTeam ? (
            <div className="bg-background border-2 border-primary rounded-lg p-3 shadow-lg cursor-grabbing">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">{activeTeam.name}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
