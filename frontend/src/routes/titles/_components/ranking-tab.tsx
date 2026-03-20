import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy } from 'lucide-react'
import { NAME_LABELS, CATEGORY_LABELS } from '@/lib/competition-labels'
import { cn } from '@/lib/utils'
import type { GlobalRankingEntry, TitlePointConfig } from '@/types'
import { useTranslation } from 'react-i18next'

interface RankingTabProps {
  ranking: GlobalRankingEntry[]
  pointConfigs: TitlePointConfig[]
}

const positionStyles: Record<number, string> = {
  1: 'bg-yellow-500/10',
  2: 'bg-slate-400/10',
  3: 'bg-amber-700/10',
}

const positionBadge: Record<number, string> = {
  1: 'text-yellow-500 font-bold',
  2: 'text-slate-400 font-bold',
  3: 'text-amber-700 font-bold',
}

/** Composite key matching the backend breakdown format */
function configKey(config: TitlePointConfig): string {
  return `${config.competitionName}:${config.category}`
}

function configLabel(config: TitlePointConfig): string {
  const name = NAME_LABELS[config.competitionName] || config.competitionName
  const cat = CATEGORY_LABELS[config.category] || config.category
  return `${name} - ${cat}`
}

const RankingTab = ({ ranking, pointConfigs }: RankingTabProps) => {
  const { t } = useTranslation('titles')

  // Sort configs by points descending to create dynamic columns
  const sortedConfigs = [...pointConfigs]
    .filter((c) => c.isActive)
    .sort((a, b) => b.points - a.points)

  if (ranking.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Trophy className="size-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">{t('ranking.noData')}</p>
        <p className="text-sm">{t('ranking.noDataDescription')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">{t('ranking.position')}</TableHead>
              <TableHead>{t('ranking.club')}</TableHead>
              {sortedConfigs.map((config) => (
                <TableHead key={config.id} className="text-center">
                  {configLabel(config)}
                </TableHead>
              ))}
              <TableHead className="text-center">{t('ranking.totalTitles')}</TableHead>
              <TableHead className="text-center">{t('ranking.totalPoints')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((entry, index) => {
              const position = index + 1
              return (
                <TableRow key={entry.club.id} className={cn(positionStyles[position])}>
                  <TableCell className={cn('text-center', positionBadge[position])}>
                    {position}
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/club/findOne/$id"
                      params={{ id: entry.club.id }}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Avatar className="size-6">
                        <AvatarImage src={entry.club.logo ?? undefined} alt={entry.club.name} />
                        <AvatarFallback className="text-xs">
                          {entry.club.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{entry.club.name}</span>
                    </Link>
                  </TableCell>
                  {sortedConfigs.map((config) => (
                    <TableCell key={config.id} className="text-center">
                      {entry.breakdown[configKey(config)] || '-'}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-medium">{entry.totalTitles}</TableCell>
                  <TableCell className="text-center font-bold">{entry.totalPoints}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default RankingTab
