import { DraggableTeam } from './draggable-team'
import type { AvailableTeam } from '@/types/bracket-editor'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvailableTeamsPanelProps {
  teams: AvailableTeam[]
  assignedCount: number
  totalRequired: number
  isDragging?: boolean
}

export function AvailableTeamsPanel({ teams, assignedCount, totalRequired, isDragging }: AvailableTeamsPanelProps) {
  const unassignedTeams = teams.filter((t) => !t.isAssigned)
  const assignedTeams = teams.filter((t) => t.isAssigned)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="pb-4 border-b flex-shrink-0">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Equipos Disponibles
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Arrastra los equipos a los slots del bracket
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`text-sm font-medium ${assignedCount === totalRequired ? 'text-green-600' : 'text-amber-600'}`}
          >
            {assignedCount}/{totalRequired} asignados
          </span>
          {assignedCount === totalRequired && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Completo</span>
          )}
        </div>
      </div>

      {/* Lista de equipos */}
      <div className={cn('flex-1 mt-4', isDragging ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden')}>
        <div className="space-y-2 pr-2">
          {/* Equipos no asignados primero */}
          {unassignedTeams.map((team) => (
            <DraggableTeam key={team.id} team={team} />
          ))}

          {/* Separador si hay equipos asignados */}
          {assignedTeams.length > 0 && unassignedTeams.length > 0 && (
            <div className="my-4 border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Ya asignados:</p>
            </div>
          )}

          {/* Equipos ya asignados */}
          {assignedTeams.map((team) => (
            <DraggableTeam key={team.id} team={team} isDisabled />
          ))}
        </div>
      </div>
    </div>
  )
}
