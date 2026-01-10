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
import { ChevronLeft, ChevronRight, Users, AlertCircle, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CupWizardState, AvailableTeam } from '@/types/fixture'
import { ClubService } from '@/services/club.service'
import { DroppableLeagueZone } from '../../league/_components/droppable-league-zone'
import { DraggableTeam } from '../../league/_components/draggable-team'

interface Step2TeamAssignmentCupProps {
  wizardState: CupWizardState
  onStateChange: (updates: Partial<CupWizardState>) => void
  onNext: () => void
  onBack: () => void
}

export function Step2TeamAssignmentCup({
  wizardState,
  onStateChange,
  onNext,
  onBack,
}: Step2TeamAssignmentCupProps) {
  const { t } = useTranslation('fixtures')
  const [isLoading, setIsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Cargar equipos disponibles
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

      // Inicializar grupos vacíos
      const initialGroups: Record<string, AvailableTeam[]> = {}
      for (let i = 0; i < wizardState.numGroups; i++) {
        const groupId = String.fromCharCode(65 + i) // A, B, C, D...
        initialGroups[groupId] = []
      }

      onStateChange({
        availableTeams: teams,
        groupAssignments: initialGroups,
      })
    } catch (err) {
      console.error('Error loading teams:', err)
      setError(t('cup.errorCreating'))
    } finally {
      setIsLoading(false)
    }
  }

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
    const targetGroupId = over.id as string

    // Si se soltó en "unassigned", quitar el equipo de cualquier grupo
    if (targetGroupId === 'unassigned') {
      const updatedGroups = { ...wizardState.groupAssignments }
      Object.keys(updatedGroups).forEach((groupId) => {
        updatedGroups[groupId] = updatedGroups[groupId].filter((t) => t.id !== teamId)
      })

      onStateChange({ groupAssignments: updatedGroups })
      return
    }

    // Validar que targetGroupId es un grupo válido
    if (!wizardState.groupAssignments[targetGroupId]) {
      return
    }

    // Verificar si el grupo ya está lleno
    const targetGroup = wizardState.groupAssignments[targetGroupId]
    if (targetGroup.length >= wizardState.teamsPerGroup) {
      setError(
        `El Grupo ${targetGroupId} ya tiene el máximo de ${wizardState.teamsPerGroup} equipos`
      )
      return
    }

    // Quitar el equipo de cualquier grupo anterior
    const updatedGroups = { ...wizardState.groupAssignments }
    Object.keys(updatedGroups).forEach((groupId) => {
      updatedGroups[groupId] = updatedGroups[groupId].filter((t) => t.id !== teamId)
    })

    // Agregar el equipo al nuevo grupo
    const team = wizardState.availableTeams.find((t) => t.id === teamId)
    if (team) {
      updatedGroups[targetGroupId] = [...updatedGroups[targetGroupId], team]
    }

    onStateChange({ groupAssignments: updatedGroups })
    setError(null)
  }

  const validateAssignments = (): boolean => {
    // Validar que todos los grupos tengan el número correcto de equipos
    const invalidGroups = Object.keys(wizardState.groupAssignments).filter((groupId) => {
      const teamCount = wizardState.groupAssignments[groupId].length
      return teamCount !== wizardState.teamsPerGroup
    })

    if (invalidGroups.length > 0) {
      setError(t('cup.validation.allGroupsFull'))
      return false
    }

    setError(null)
    return true
  }

  const handleNext = () => {
    if (validateAssignments()) {
      onNext()
    }
  }

  // Obtener equipos sin asignar
  const getUnassignedTeams = (): AvailableTeam[] => {
    const assignedIds = new Set(
      Object.values(wizardState.groupAssignments)
        .flat()
        .map((t) => t.id)
    )
    return wizardState.availableTeams.filter((team) => !assignedIds.has(team.id))
  }

  const activeTeam = activeId ? wizardState.availableTeams.find((t) => t.id === activeId) : null

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Cargando equipos disponibles...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const unassignedTeams = getUnassignedTeams()
  const totalTeams = wizardState.availableTeams.length
  const assignedTeams = totalTeams - unassignedTeams.length
  const totalNeededTeams = wizardState.numGroups * wizardState.teamsPerGroup

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                {t('cup.teamsAssigned')}
              </CardTitle>
              <CardDescription className="mt-2">
                Arrastra los equipos a los grupos correspondientes ({wizardState.teamsPerGroup} equipos
                por grupo)
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{assignedTeams}</div>
                <div className="text-sm text-muted-foreground">Asignados</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">
                  {totalNeededTeams - assignedTeams}
                </div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Equipos disponibles */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Equipos Disponibles</CardTitle>
              <CardDescription>
                {unassignedTeams.length} de {totalTeams} equipos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-4">
                <DroppableLeagueZone
                  id="unassigned"
                  teams={unassignedTeams}
                  isEmpty={unassignedTeams.length === 0}
                  emptyMessage="Todos los equipos han sido asignados"
                />
              </div>
            </CardContent>
          </Card>

          {/* Panel derecho: Grupos */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(wizardState.groupAssignments)
                .sort()
                .map((groupId) => {
                  const groupTeams = wizardState.groupAssignments[groupId]
                  const isFull = groupTeams.length === wizardState.teamsPerGroup

                  return (
                    <Card key={groupId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {t('cup.groupLabel', { letter: groupId })}
                          </CardTitle>
                          <Badge variant={isFull ? 'default' : 'secondary'}>
                            {groupTeams.length}/{wizardState.teamsPerGroup}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <DroppableLeagueZone
                          id={groupId}
                          teams={groupTeams}
                          isEmpty={groupTeams.length === 0}
                          emptyMessage={`Arrastra ${wizardState.teamsPerGroup} equipos aquí`}
                          minTeams={wizardState.teamsPerGroup}
                        />
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>{activeTeam && <DraggableTeam team={activeTeam} />}</DragOverlay>
      </DndContext>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!validateAssignments()}>
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
