import { useState, useCallback, useMemo } from 'react'
import { BracketEditorView } from './bracket-editor-view'
import { SelectableTeamsPanel } from './selectable-teams-panel'
import type { EmptyBracketStructure, AvailableTeam, BracketTeamPlacement } from '@/types/bracket-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface BracketEditorContainerProps {
  structure: EmptyBracketStructure
  teams: AvailableTeam[]
  onConfirm: (placements: BracketTeamPlacement[]) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function BracketEditorContainer({
  structure,
  teams: initialTeams,
  onConfirm,
  onCancel,
  isSubmitting,
}: BracketEditorContainerProps) {
  // Estado de placements: slotId -> teamId
  const [placements, setPlacements] = useState<Map<string, string>>(new Map())
  // Equipo seleccionado para asignar
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  // Calcular equipos con estado de asignación
  const teamsWithAssignment = useMemo(() => {
    const assignedTeamIds = new Set(placements.values())
    return initialTeams.map((team) => ({
      ...team,
      isAssigned: assignedTeamIds.has(team.id),
    }))
  }, [initialTeams, placements])

  // Contar slots requeridos (excluyendo BYEs)
  const requiredSlots = structure.slots.filter((s) => !s.isBye).length
  const assignedCount = placements.size

  // Validar si está completo
  const isValid = assignedCount === requiredSlots

  // Handler para seleccionar un equipo del panel
  const handleSelectTeam = useCallback((teamId: string) => {
    setSelectedTeamId((prev) => (prev === teamId ? null : teamId))
  }, [])

  // Handler para asignar equipo a un slot
  const handleAssignToSlot = useCallback(
    (slotId: string) => {
      if (!selectedTeamId) return

      // Verificar que el slot existe y no es BYE
      const targetSlot = structure.slots.find((s) => s.id === slotId)
      if (!targetSlot || targetSlot.isBye) return

      setPlacements((prev) => {
        const newPlacements = new Map(prev)

        // Si el equipo ya está en otro slot, quitarlo primero
        for (const [existingSlotId, existingTeamId] of newPlacements.entries()) {
          if (existingTeamId === selectedTeamId) {
            newPlacements.delete(existingSlotId)
            break
          }
        }

        // Asignar el equipo al nuevo slot
        newPlacements.set(slotId, selectedTeamId)

        return newPlacements
      })

      // Deseleccionar el equipo después de asignarlo
      setSelectedTeamId(null)
    },
    [selectedTeamId, structure.slots]
  )

  // Handler para quitar equipo de un slot
  const handleRemove = useCallback((slotId: string) => {
    setPlacements((prev) => {
      const newPlacements = new Map(prev)
      newPlacements.delete(slotId)
      return newPlacements
    })
  }, [])

  // Handler para confirmar
  const handleConfirm = useCallback(() => {
    const placementsArray: BracketTeamPlacement[] = Array.from(placements.entries()).map(
      ([slotId, teamId]) => ({
        slotId,
        teamId,
      })
    )
    onConfirm(placementsArray)
  }, [placements, onConfirm])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Panel de equipos disponibles */}
      <div className="lg:col-span-1">
        <Card className="h-[600px]">
          <CardContent className="p-4 h-full overflow-hidden">
            <SelectableTeamsPanel
              teams={teamsWithAssignment}
              assignedCount={assignedCount}
              totalRequired={requiredSlots}
              selectedTeamId={selectedTeamId}
              onSelectTeam={handleSelectTeam}
            />
          </CardContent>
        </Card>
      </div>

      {/* Editor de bracket */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Editor de Bracket</span>
              {isValid ? (
                <span className="flex items-center gap-2 text-sm font-normal text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Listo para crear
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm font-normal text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Faltan {requiredSlots - assignedCount} equipos
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BracketEditorView
              structure={structure}
              placements={placements}
              teams={teamsWithAssignment}
              selectedTeamId={selectedTeamId}
              onSlotClick={handleAssignToSlot}
              onRemove={handleRemove}
            />
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Confirmar y Crear'}
          </Button>
        </div>
      </div>
    </div>
  )
}
