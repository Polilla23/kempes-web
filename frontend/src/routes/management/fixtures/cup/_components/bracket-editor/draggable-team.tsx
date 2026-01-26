import { useDraggable } from '@dnd-kit/core'
import { GripVertical, Users } from 'lucide-react'
import type { AvailableTeam } from '@/types/bracket-editor'
import { cn } from '@/lib/utils'

interface DraggableTeamProps {
  team: AvailableTeam
  isDisabled?: boolean
}

export function DraggableTeam({ team, isDisabled }: DraggableTeamProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: team.id,
    disabled: isDisabled || team.isAssigned,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-3 p-3 bg-background border rounded-lg transition-all',
        team.isAssigned && 'opacity-40 cursor-not-allowed',
        !team.isAssigned && 'hover:border-primary hover:bg-accent cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary shadow-lg z-50'
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain rounded" />
      ) : (
        <Users className="h-6 w-6 text-muted-foreground" />
      )}
      <span className="font-medium text-sm truncate">{team.name}</span>
      {team.isAssigned && (
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Asignado</span>
      )}
    </div>
  )
}
