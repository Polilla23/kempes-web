import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Users, AlertCircle, Trophy, Dice5 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CupWizardState, AvailableTeam } from '@/types/fixture'
import { ClubService } from '@/services/club.service'
import { ClickableTeamItem } from '../../league/_components/clickable-team-item'
import { ClickableZone } from '../../league/_components/clickable-zone'
import { SorteoDrawModal } from './sorteo-draw-modal'

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
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sorteoOpen, setSorteoOpen] = useState(false)
  const hasLoadedRef = useRef(false)

  // Cargar equipos disponibles
  const loadAvailableTeams = async () => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    try {
      setIsLoading(true)
      setError(null)
      const response = await ClubService.getClubs()

      const activeClubs = response.clubs
        .filter((club) => club.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))

      // Detectar club "Libre" por nombre (comodín para grupos)
      const libreClub = activeClubs.find((club) => club.name.toLowerCase() === 'libre')

      const teams: AvailableTeam[] = activeClubs
        .filter((club) => club.id !== libreClub?.id)
        .map((club) => ({
          id: club.id,
          name: club.name,
          logo: club.logo,
          isAssigned: false,
        }))

      // Inicializar grupos vacíos si no existen ya
      const initialGroups: Record<string, AvailableTeam[]> = { ...wizardState.groupAssignments }

      if (Object.keys(initialGroups).length === 0) {
        for (let i = 0; i < wizardState.numGroups; i++) {
          const groupId = String.fromCharCode(65 + i)
          initialGroups[groupId] = []
        }
      }

      onStateChange({
        availableTeams: teams,
        groupAssignments: initialGroups,
        libreClubId: libreClub?.id,
      })
    } catch (err) {
      console.error('Error loading teams:', err)
      setError(t('cup.errorCreating'))
      hasLoadedRef.current = false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (wizardState.availableTeams.length === 0) {
      loadAvailableTeams()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Libre team derivado del club real detectado por nombre
  const libreClubId = wizardState.libreClubId
  const libreTeam: AvailableTeam | null = libreClubId
    ? { id: libreClubId, name: 'Libre', logo: undefined, isAssigned: false }
    : null

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(prev => prev === teamId ? null : teamId)
  }

  const handleAssignTeam = (groupId: string) => {
    if (!selectedTeamId) return
    if (!wizardState.groupAssignments[groupId]) return

    const isLibre = libreClubId != null && selectedTeamId === libreClubId

    // Check if group is full
    const targetGroup = wizardState.groupAssignments[groupId]
    if (targetGroup.length >= wizardState.teamsPerGroup) {
      setError(`El Grupo ${groupId} ya tiene el máximo de ${wizardState.teamsPerGroup} equipos`)
      return
    }

    // Check if Libre is already in this group
    if (isLibre && targetGroup.some((t) => t.id === libreClubId)) {
      setError(`El Grupo ${groupId} ya tiene un Libre`)
      return
    }

    // Remove team from any previous group (except Libre, which can be in multiple)
    const updatedGroups = { ...wizardState.groupAssignments }
    if (!isLibre) {
      Object.keys(updatedGroups).forEach((gid) => {
        updatedGroups[gid] = updatedGroups[gid].filter((t) => t.id !== selectedTeamId)
      })
    }

    // Add to new group
    const team = isLibre
      ? { ...libreTeam! }
      : wizardState.availableTeams.find((t) => t.id === selectedTeamId)
    if (team) {
      updatedGroups[groupId] = [...updatedGroups[groupId], team]
    }

    onStateChange({ groupAssignments: updatedGroups })
    setSelectedTeamId(null)
    setError(null)
  }

  const handleRemoveTeam = (groupId: string, teamId: string) => {
    const updatedGroups = { ...wizardState.groupAssignments }
    updatedGroups[groupId] = updatedGroups[groupId].filter((t) => t.id !== teamId)
    onStateChange({ groupAssignments: updatedGroups })
  }

  const validateAssignments = (): boolean => {
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

  const canContinue = Object.keys(wizardState.groupAssignments).every((groupId) => {
    return wizardState.groupAssignments[groupId].length === wizardState.teamsPerGroup
  })

  const handleNext = () => {
    if (validateAssignments()) {
      onNext()
    }
  }

  // Obtener equipos sin asignar (excluir Libre del conteo, siempre está disponible)
  const getUnassignedTeams = (): AvailableTeam[] => {
    const assignedIds = new Set(
      Object.values(wizardState.groupAssignments)
        .flat()
        .filter((t) => t.id !== libreClubId)
        .map((t) => t.id)
    )
    return wizardState.availableTeams.filter((team) => !assignedIds.has(team.id))
  }

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
                {selectedTeamId
                  ? 'Ahora haz click en un grupo para asignar el equipo'
                  : `Selecciona un equipo y haz click en un grupo (${wizardState.teamsPerGroup} equipos por grupo)`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSorteoOpen(true)}
                disabled={wizardState.availableTeams.length === 0}
              >
                <Dice5 className="mr-2 h-4 w-4" />
                {t('cup.sorteo.button')}
              </Button>
              <Separator orientation="vertical" className="h-12" />
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

      {/* Sorteo Draw Modal */}
      <SorteoDrawModal
        open={sorteoOpen}
        onOpenChange={setSorteoOpen}
        teams={wizardState.availableTeams}
        numGroups={wizardState.numGroups}
        teamsPerGroup={wizardState.teamsPerGroup}
        onComplete={(assignments) => {
          onStateChange({ groupAssignments: assignments })
        }}
      />

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Click-to-Assign */}
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
            {/* Libre - siempre disponible (solo si existe el club Libre) */}
            {libreTeam && (
              <div className="mb-3 pb-3 border-b">
                <p className="text-xs text-muted-foreground mb-1.5">Comodin</p>
                <ClickableTeamItem
                  team={libreTeam}
                  isSelected={selectedTeamId === libreClubId}
                  onClick={() => handleSelectTeam(libreClubId!)}
                />
              </div>
            )}
            <div className="max-h-[550px] overflow-y-auto space-y-2 pr-2">
              {unassignedTeams.length === 0 ? (
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-muted-foreground text-sm">
                  Todos los equipos han sido asignados
                </div>
              ) : (
                unassignedTeams.map((team) => (
                  <ClickableTeamItem
                    key={team.id}
                    team={team}
                    isSelected={selectedTeamId === team.id}
                    onClick={() => handleSelectTeam(team.id)}
                  />
                ))
              )}
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
                      <ClickableZone
                        id={groupId}
                        teams={groupTeams}
                        onAssignTeam={handleAssignTeam}
                        onRemoveTeam={handleRemoveTeam}
                        isSelectionActive={selectedTeamId !== null}
                        maxTeams={wizardState.teamsPerGroup}
                        emptyMessage={`Asignar ${wizardState.teamsPerGroup} equipos aquí`}
                      />
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!canContinue}>
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
