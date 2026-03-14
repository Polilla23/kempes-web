import { Users, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AvailableTeam } from '@/types/fixture'

interface ClickableTeamItemProps {
  team: AvailableTeam
  isSelected?: boolean
  onClick?: () => void
  onRemove?: () => void
  badge?: React.ReactNode
}

export function ClickableTeamItem({ team, isSelected, onClick, onRemove, badge }: ClickableTeamItemProps) {
  // Assigned mode (with remove button)
  if (onRemove) {
    return (
      <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg group">
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain rounded" />
        ) : (
          <Users className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="font-medium text-sm truncate flex-1">{team.name}</span>
        {badge}
        <button
          type="button"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
          title="Quitar equipo"
        >
          <X className="h-4 w-4 text-destructive" />
        </button>
      </div>
    )
  }

  // Selectable mode (available teams list)
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 bg-background border rounded-lg transition-all text-left',
        'hover:border-primary hover:bg-accent cursor-pointer',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/10'
      )}
    >
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain rounded" />
      ) : (
        <Users className="h-6 w-6 text-muted-foreground" />
      )}
      <span className="font-medium text-sm truncate flex-1">{team.name}</span>
      {badge}
      {isSelected && <Check className="h-4 w-4 text-primary" />}
    </button>
  )
}
