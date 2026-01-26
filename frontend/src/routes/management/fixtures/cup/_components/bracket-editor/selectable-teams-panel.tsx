import type { AvailableTeam } from '@/types/bracket-editor'
import { Users, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectableTeamsPanelProps {
  teams: AvailableTeam[]
  assignedCount: number
  totalRequired: number
  selectedTeamId: string | null
  onSelectTeam: (teamId: string) => void
}

export function SelectableTeamsPanel({
  teams,
  assignedCount,
  totalRequired,
  selectedTeamId,
  onSelectTeam,
}: SelectableTeamsPanelProps) {
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
          Selecciona un equipo y haz click en un slot vacío
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
      <div className="flex-1 mt-4 overflow-y-auto overflow-x-hidden">
        <div className="space-y-2 pr-2">
          {/* Equipos no asignados primero */}
          {unassignedTeams.map((team) => (
            <SelectableTeamItem
              key={team.id}
              team={team}
              isSelected={selectedTeamId === team.id}
              onSelect={onSelectTeam}
            />
          ))}

          {/* Separador si hay equipos asignados */}
          {assignedTeams.length > 0 && unassignedTeams.length > 0 && (
            <div className="my-4 border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Ya asignados:</p>
            </div>
          )}

          {/* Equipos ya asignados */}
          {assignedTeams.map((team) => (
            <SelectableTeamItem
              key={team.id}
              team={team}
              isSelected={false}
              onSelect={onSelectTeam}
              isDisabled
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SelectableTeamItemProps {
  team: AvailableTeam
  isSelected: boolean
  onSelect: (teamId: string) => void
  isDisabled?: boolean
}

function SelectableTeamItem({ team, isSelected, onSelect, isDisabled }: SelectableTeamItemProps) {
  return (
    <button
      type="button"
      onClick={() => !isDisabled && onSelect(team.id)}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-3 p-3 bg-background border rounded-lg transition-all text-left',
        isDisabled && 'opacity-40 cursor-not-allowed',
        !isDisabled && 'hover:border-primary hover:bg-accent cursor-pointer',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/10'
      )}
    >
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain rounded" />
      ) : (
        <Users className="h-6 w-6 text-muted-foreground" />
      )}
      <span className="font-medium text-sm truncate flex-1">{team.name}</span>
      {isSelected && <Check className="h-4 w-4 text-primary" />}
      {isDisabled && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Asignado</span>
      )}
    </button>
  )
}
