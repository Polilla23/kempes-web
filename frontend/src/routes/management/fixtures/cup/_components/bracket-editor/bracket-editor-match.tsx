import { DroppableBracketSlot } from './droppable-bracket-slot'
import type { BracketSlot, AvailableTeam } from '@/types/bracket-editor'
import { cn } from '@/lib/utils'

interface BracketEditorMatchProps {
  position: number
  homeSlot: BracketSlot
  awaySlot: BracketSlot
  homeTeam?: AvailableTeam
  awayTeam?: AvailableTeam
  isBye: boolean
  onRemove: (slotId: string) => void
}

export function BracketEditorMatch({
  position,
  homeSlot,
  awaySlot,
  homeTeam,
  awayTeam,
  isBye,
  onRemove,
}: BracketEditorMatchProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 p-2 border rounded-lg bg-card min-w-[200px]',
        isBye && 'bg-muted/30 border-dashed'
      )}
    >
      <div className="text-xs text-muted-foreground text-center mb-1">
        Partido {position}
        {isBye && <span className="ml-1 text-amber-600">(BYE)</span>}
      </div>

      {/* Home team slot */}
      <DroppableBracketSlot slot={homeSlot} team={homeTeam} onRemove={onRemove} />

      <div className="text-center text-xs text-muted-foreground">vs</div>

      {/* Away team slot */}
      <DroppableBracketSlot slot={awaySlot} team={awayTeam} onRemove={onRemove} />
    </div>
  )
}
