import { useDroppable } from '@dnd-kit/core'
import { Users, X, Ban } from 'lucide-react'
import type { BracketSlot, AvailableTeam } from '@/types/bracket-editor'
import { cn } from '@/lib/utils'

interface DroppableBracketSlotProps {
  slot: BracketSlot
  team?: AvailableTeam
  onRemove: (slotId: string) => void
  compact?: boolean
}

export function DroppableBracketSlot({ slot, team, onRemove, compact }: DroppableBracketSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: slot.id,
    disabled: slot.isBye,
  })

  // Estilos compactos vs normales
  const heightClass = compact ? 'h-full' : 'min-h-[44px]'
  const paddingClass = compact ? 'px-2 py-0' : 'px-3 py-2'
  const textClass = compact ? 'text-[10px]' : 'text-sm'
  const iconClass = compact ? 'h-3 w-3' : 'h-5 w-5'
  const smallIconClass = compact ? 'h-3 w-3' : 'h-4 w-4'

  // Si es un BYE, mostrar como slot deshabilitado
  if (slot.isBye) {
    return (
      <div className={cn('flex items-center gap-1 bg-muted/50 border border-dashed rounded-md', paddingClass, heightClass)}>
        <Ban className={cn(iconClass, 'text-muted-foreground')} />
        <span className={cn(textClass, 'text-muted-foreground italic')}>BYE</span>
      </div>
    )
  }

  // Si ya tiene un equipo asignado
  if (team) {
    return (
      <div className={cn('flex items-center gap-1 bg-primary/10 border border-primary/30 rounded-md group', paddingClass, heightClass)}>
        {team.logo ? (
          <img src={team.logo} alt={team.name} className={cn(iconClass, 'object-contain rounded')} />
        ) : (
          <Users className={cn(iconClass, 'text-muted-foreground')} />
        )}
        <span className={cn(textClass, 'font-medium flex-1 truncate')}>{team.name}</span>
        <button
          onClick={() => onRemove(slot.id)}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded transition-opacity"
          title="Quitar equipo"
        >
          <X className={cn(smallIconClass, 'text-destructive')} />
        </button>
      </div>
    )
  }

  // Slot vacío esperando drop
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-center border-2 border-dashed rounded-md transition-colors',
        paddingClass,
        heightClass,
        isOver && 'border-primary bg-primary/10',
        !isOver && 'border-muted-foreground/30 bg-muted/20'
      )}
    >
      <span className={cn(compact ? 'text-[9px]' : 'text-xs', 'text-muted-foreground')}>
        {isOver ? 'Soltar' : compact ? 'Arrastra' : 'Arrastra un equipo'}
      </span>
    </div>
  )
}
