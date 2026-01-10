import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableTeam } from './draggable-team'
import type { AvailableTeam } from '@/types/fixture'
import { cn } from '@/lib/utils'

interface DroppableLeagueZoneProps {
  id: string
  teams: AvailableTeam[]
  isEmpty: boolean
  emptyMessage: string
  minTeams?: number
}

export function DroppableLeagueZone({
  id,
  teams,
  isEmpty,
  emptyMessage,
  minTeams = 0,
}: DroppableLeagueZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const hasEnoughTeams = teams.length >= minTeams
  const showWarning = minTeams > 0 && !hasEnoughTeams

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[300px] p-6 rounded-lg border-2 border-dashed transition-colors',
        isOver && 'border-primary bg-primary/5 border-4',
        !isOver && showWarning && 'border-destructive/50 bg-destructive/5',
        !isOver && !showWarning && 'border-border bg-muted/20'
      )}
    >
      <SortableContext items={teams.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              {showWarning && (
                <p className="text-xs text-destructive mt-2">Se necesitan al menos {minTeams} equipos</p>
              )}
            </div>
          ) : (
            teams.map((team) => <DraggableTeam key={team.id} team={team} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
