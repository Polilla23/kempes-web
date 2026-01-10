import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Users } from 'lucide-react'
import type { AvailableTeam } from '@/types/fixture'

interface DraggableTeamProps {
  team: AvailableTeam
}

export function DraggableTeam({ team }: DraggableTeamProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: team.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:border-primary hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain rounded" />
      ) : (
        <Users className="h-6 w-6 text-muted-foreground" />
      )}
      <span className="font-medium text-sm truncate">{team.name}</span>
    </div>
  )
}
