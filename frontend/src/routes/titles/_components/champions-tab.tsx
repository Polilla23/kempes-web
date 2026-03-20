import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy } from 'lucide-react'
import { NAME_LABELS } from '@/lib/competition-labels'
import type { SeasonChampions } from '@/types'
import { useTranslation } from 'react-i18next'

interface ChampionsTabProps {
  champions: SeasonChampions[]
  categoryFilter: string
  onCategoryChange: (category: string) => void
}

const ChampionsTab = ({ champions, categoryFilter, onCategoryChange }: ChampionsTabProps) => {
  const { t } = useTranslation('titles')

  if (champions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Trophy className="size-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">{t('champions.noData')}</p>
        <p className="text-sm">{t('champions.noDataDescription')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{t('champions.filterCategory')}:</span>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('champions.all')}</SelectItem>
            <SelectItem value="SENIOR">{t('champions.senior')}</SelectItem>
            <SelectItem value="KEMPESITA">{t('champions.kempesita')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Season cards */}
      <div className="space-y-4">
        {champions.map((season) => (
          <Card key={season.seasonId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t('champions.season')} {season.seasonNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {season.champions.map((champ) => (
                  <div
                    key={`${season.seasonId}-${champ.competitionName}`}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Link
                      to="/club/findOne/$id"
                      params={{ id: champ.club.id }}
                      className="shrink-0"
                    >
                      <Avatar className="size-8">
                        <AvatarImage src={champ.club.logo ?? undefined} alt={champ.club.name} />
                        <AvatarFallback className="text-xs">
                          {champ.club.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-muted-foreground">
                        {NAME_LABELS[champ.competitionName] || champ.competitionName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Link
                          to="/club/findOne/$id"
                          params={{ id: champ.club.id }}
                          className="font-medium text-sm truncate hover:underline"
                        >
                          {champ.club.name}
                        </Link>
                        {champ.titleCount > 1 && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                            {champ.titleCount}x
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ChampionsTab
