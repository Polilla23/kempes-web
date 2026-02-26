import { Users } from 'lucide-react'
import type { AvailableTeam } from '@/types/fixture'
import { cn } from '@/lib/utils'

interface SorteoRevealedTeamProps {
  team: AvailableTeam
  isVisible: boolean
}

export function SorteoRevealedTeam({ team, isVisible }: SorteoRevealedTeamProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      )}
    >
      <div className="relative">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="h-20 w-20 object-contain rounded-lg shadow-lg"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shadow-lg">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute -inset-2 rounded-xl bg-primary/20 animate-pulse -z-10" />
      </div>
      <span className="text-lg font-bold text-center">{team.name}</span>
    </div>
  )
}
