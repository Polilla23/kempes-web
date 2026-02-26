import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AvailableTeam } from '@/types/fixture'
import { cn } from '@/lib/utils'

interface SorteoGroupSlotProps {
  groupId: string
  teams: AvailableTeam[]
  maxTeams: number
  isAvailable: boolean
  isPlacing: boolean
  onClick?: () => void
}

export function SorteoGroupSlot({
  groupId,
  teams,
  maxTeams,
  isAvailable,
  isPlacing,
  onClick,
}: SorteoGroupSlotProps) {
  const { t } = useTranslation('fixtures')
  const isFull = teams.length >= maxTeams

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isPlacing &&
          isAvailable &&
          !isFull &&
          'ring-2 ring-primary cursor-pointer hover:bg-primary/5 shadow-md',
        isPlacing && !isAvailable && 'opacity-50',
        isFull && 'bg-muted/30'
      )}
      onClick={isPlacing && isAvailable && !isFull ? onClick : undefined}
    >
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{t('cup.groupLabel', { letter: groupId })}</span>
          <Badge variant={isFull ? 'default' : 'secondary'} className="text-xs">
            {teams.length}/{maxTeams}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-1">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="flex items-center gap-2 p-1.5 rounded bg-muted/30 text-xs sorteo-fade-in"
            >
              <Badge
                variant="outline"
                className="h-4 w-4 flex items-center justify-center text-[10px] p-0 flex-shrink-0"
              >
                {idx + 1}
              </Badge>
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={team.name}
                  className="h-4 w-4 object-contain rounded flex-shrink-0"
                />
              ) : (
                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className="truncate">{team.name}</span>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: maxTeams - teams.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className={cn(
                'flex items-center justify-center p-1.5 rounded border border-dashed text-xs h-[30px]',
                isPlacing && isAvailable
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-muted-foreground/20'
              )}
            >
              {isPlacing && isAvailable && idx === 0 ? (
                <Plus className="h-3 w-3 text-primary" />
              ) : (
                <span className="text-muted-foreground/30">—</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
