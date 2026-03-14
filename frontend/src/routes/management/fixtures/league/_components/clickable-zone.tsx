import type { AvailableTeam } from '@/types/fixture'
import { cn } from '@/lib/utils'
import { ClickableTeamItem } from './clickable-team-item'
import { MousePointerClick } from 'lucide-react'

interface ClickableZoneProps {
  id: string
  teams: AvailableTeam[]
  onAssignTeam: (zoneId: string) => void
  onRemoveTeam: (zoneId: string, teamId: string) => void
  isSelectionActive: boolean
  maxTeams?: number
  minTeams?: number
  emptyMessage?: string
  renderBadge?: (team: AvailableTeam) => React.ReactNode
}

export function ClickableZone({
  id,
  teams,
  onAssignTeam,
  onRemoveTeam,
  isSelectionActive,
  maxTeams,
  minTeams,
  emptyMessage = 'Sin equipos asignados',
  renderBadge,
}: ClickableZoneProps) {
  const isFull = maxTeams ? teams.length >= maxTeams : false
  const canAssign = isSelectionActive && !isFull

  return (
    <div className="space-y-2">
      {/* Assigned teams */}
      {teams.map((team) => (
        <ClickableTeamItem
          key={team.id}
          team={team}
          onRemove={() => onRemoveTeam(id, team.id)}
          badge={renderBadge?.(team)}
        />
      ))}

      {/* Empty state */}
      {teams.length === 0 && !canAssign && (
        <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 text-muted-foreground text-sm">
          {emptyMessage}
        </div>
      )}

      {/* Min teams warning */}
      {minTeams && teams.length > 0 && teams.length < minTeams && (
        <p className="text-xs text-muted-foreground">
          Mínimo {minTeams} equipos ({minTeams - teams.length} más)
        </p>
      )}

      {/* Click to assign button */}
      {canAssign && (
        <button
          type="button"
          onClick={() => onAssignTeam(id)}
          className={cn(
            'w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 transition-colors',
            'border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary cursor-pointer'
          )}
        >
          <MousePointerClick className="h-4 w-4" />
          <span className="text-sm font-medium">Click para agregar aquí</span>
        </button>
      )}
    </div>
  )
}
