import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from 'react-i18next'
import type { DashboardPlayer } from '@/services/dashboard.service'

function formatSalary(salary: number) {
  return `$${salary.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

interface SquadTableProps {
  players: DashboardPlayer[]
  isLoading?: boolean
}

export function SquadTable({ players, isLoading }: SquadTableProps) {
  const { t } = useTranslation('dashboard')

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base">{t('squad.title')}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {players.length} {t('squad.players')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-0">{t('squad.columns.player')}</TableHead>
                  <TableHead className="text-center w-16">{t('squad.columns.position')}</TableHead>
                  <TableHead className="text-center w-16">{t('squad.columns.overall')}</TableHead>
                  <TableHead className="text-center w-16">{t('squad.columns.goals')}</TableHead>
                  <TableHead className="text-center w-16">{t('squad.columns.assists')}</TableHead>
                  <TableHead className="text-center w-16">{t('squad.columns.appearances')}</TableHead>
                  <TableHead className="text-center w-12 hidden md:table-cell">{t('squad.columns.yellowCards')}</TableHead>
                  <TableHead className="text-center w-12 hidden md:table-cell">{t('squad.columns.redCards')}</TableHead>
                  <TableHead className="text-center w-12 hidden lg:table-cell">{t('squad.columns.mvps')}</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">{t('squad.columns.salary')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} className="hover:bg-muted/50">
                    <TableCell className="pl-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarImage src={player.avatar ?? undefined} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {player.fullName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{player.fullName}</p>
                          {player.isKempesita && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">Kempesita</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {player.position ? (
                        <Badge variant="outline" className="text-[10px] font-bold px-1.5">
                          {player.position}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {player.overall ?? '-'}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {player.seasonStats?.goals ?? t('squad.noStats')}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {player.seasonStats?.assists ?? t('squad.noStats')}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {player.seasonStats?.appearances ?? t('squad.noStats')}
                    </TableCell>
                    <TableCell className="text-center text-sm hidden md:table-cell">
                      {player.seasonStats?.yellowCards != null ? (
                        <span className="text-amber-500 font-medium">{player.seasonStats.yellowCards}</span>
                      ) : t('squad.noStats')}
                    </TableCell>
                    <TableCell className="text-center text-sm hidden md:table-cell">
                      {player.seasonStats?.redCards != null ? (
                        <span className="text-red-500 font-medium">{player.seasonStats.redCards}</span>
                      ) : t('squad.noStats')}
                    </TableCell>
                    <TableCell className="text-center text-sm hidden lg:table-cell">
                      {player.seasonStats?.mvps ?? t('squad.noStats')}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground hidden sm:table-cell">
                      {formatSalary(player.salary)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
