import { useMemo } from 'react'
import type { AvailableTeamWithGroup } from '@/types/bracket-editor'
import { Users, Check, Trophy, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BomboTeamsPanelProps {
  teams: AvailableTeamWithGroup[]
  assignedCount: number
  totalRequired: number
  selectedTeamId: string | null
  onSelectTeam: (teamId: string) => void
}

const BOMBO_COLORS: Record<number, { bg: string; border: string; badge: string; icon: typeof Trophy }> = {
  1: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', icon: Trophy },
  2: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-500', icon: Medal },
  3: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-500', icon: Award },
  4: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-500', icon: Award },
}

export function BomboTeamsPanel({
  teams,
  assignedCount,
  totalRequired,
  selectedTeamId,
  onSelectTeam,
}: BomboTeamsPanelProps) {
  // Agrupar equipos por bombo (posición en grupo)
  const bombos = useMemo(() => {
    const grouped = new Map<number, AvailableTeamWithGroup[]>()
    for (const team of teams) {
      const pos = team.position
      if (!grouped.has(pos)) grouped.set(pos, [])
      grouped.get(pos)!.push(team)
    }
    // Ordenar por posición
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0])
  }, [teams])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="pb-3 border-b flex-shrink-0">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bombos
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Selecciona un equipo y haz click en un slot del bracket
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

      {/* Lista de bombos */}
      <div className="flex-1 mt-3 overflow-y-auto overflow-x-hidden">
        <div className="space-y-4 pr-1">
          {bombos.map(([position, bomboTeams]) => {
            const colors = BOMBO_COLORS[position] || BOMBO_COLORS[4]
            const BomboIcon = colors.icon
            const bomboLabel = position === 1 ? 'Primeros' : position === 2 ? 'Segundos' : position === 3 ? 'Terceros' : `${position}tos`

            return (
              <div key={position} className={cn('rounded-lg border p-2', colors.bg, colors.border)}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <BomboIcon className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    Bombo {position} ({bomboLabel})
                  </span>
                  <Badge className={cn('text-[10px] px-1.5 py-0 text-white ml-auto', colors.badge)}>
                    {bomboTeams.filter(t => !t.isAssigned).length}/{bomboTeams.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {bomboTeams.map((team) => (
                    <BomboTeamItem
                      key={team.id}
                      team={team}
                      isSelected={selectedTeamId === team.id}
                      onSelect={onSelectTeam}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface BomboTeamItemProps {
  team: AvailableTeamWithGroup
  isSelected: boolean
  onSelect: (teamId: string) => void
}

function BomboTeamItem({ team, isSelected, onSelect }: BomboTeamItemProps) {
  const isDisabled = team.isAssigned

  return (
    <button
      type="button"
      onClick={() => !isDisabled && onSelect(team.id)}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-2 p-2 bg-background border rounded-md transition-all text-left',
        isDisabled && 'opacity-40 cursor-not-allowed',
        !isDisabled && 'hover:border-primary hover:bg-accent cursor-pointer',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/10'
      )}
    >
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="h-5 w-5 object-contain rounded flex-shrink-0" />
      ) : (
        <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-xs truncate block">{team.name}</span>
        <span className="text-[10px] text-muted-foreground">
          {team.position}° Grupo {team.groupName}
        </span>
      </div>
      {isSelected && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
      {isDisabled && (
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
          Asig.
        </span>
      )}
    </button>
  )
}
