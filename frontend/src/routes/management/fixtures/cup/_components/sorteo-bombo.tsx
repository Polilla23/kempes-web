import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AvailableTeam } from '@/types/fixture'
import { cn } from '@/lib/utils'

interface SorteoBomboProps {
  potIndex: number
  teams: AvailableTeam[]
  isActive: boolean
  isEmpty: boolean
  isDrawing: boolean
  onClick?: () => void
}

export function SorteoBombo({
  potIndex,
  teams,
  isActive,
  isEmpty,
  isDrawing,
  onClick,
}: SorteoBomboProps) {
  const { t } = useTranslation('fixtures')

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isActive && !isDrawing && 'ring-2 ring-primary shadow-lg cursor-pointer hover:shadow-xl',
        isActive && isDrawing && 'ring-2 ring-primary shadow-lg',
        !isActive && !isEmpty && 'opacity-50',
        isEmpty && 'opacity-30 grayscale'
      )}
      onClick={isActive && !isDrawing && !isEmpty ? onClick : undefined}
    >
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{t('cup.sorteo.bombo', { number: potIndex + 1 })}</span>
          <Badge
            variant={isEmpty ? 'outline' : isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {teams.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div
          className={cn(
            'space-y-1 min-h-[60px]',
            isActive && isDrawing && 'sorteo-shake'
          )}
        >
          {teams.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              {t('cup.sorteo.potEmpty')}
            </p>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className={cn(
                  'flex items-center gap-2 p-1.5 rounded text-xs transition-colors',
                  isActive && isDrawing && 'bg-primary/10'
                )}
              >
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
