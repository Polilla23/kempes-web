import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowDownLeft, ArrowUpRight, History, User, DollarSign, ArrowRight } from 'lucide-react'
import type { UserClub } from '@/services/home.service'
import type { Transfer } from '@/types'

interface MyTransfersTabProps {
  userClub: UserClub
  transfers: Transfer[]
  onRefresh: () => void
}

type FilterType = 'all' | 'incoming' | 'outgoing'

export function MyTransfersTab({ userClub, transfers, onRefresh }: MyTransfersTabProps) {
  const { t } = useTranslation('transfers')
  const [filter, setFilter] = useState<FilterType>('all')

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Get transfer type label
  const getTypeLabel = (type: string) => {
    return t(`types.${type}`)
  }

  // Get status variant
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'ACTIVE':
      case 'PARTIALLY_PAID':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      case 'PENDING':
      default:
        return 'outline'
    }
  }

  // Determine if transfer is incoming (user receives player)
  const isIncoming = (transfer: Transfer) => {
    return transfer.toClubId === userClub.id
  }

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    if (filter === 'all') return transfers
    if (filter === 'incoming') return transfers.filter((t) => isIncoming(t))
    if (filter === 'outgoing') return transfers.filter((t) => !isIncoming(t))
    return transfers
  }, [transfers, filter, userClub.id])

  // Count by filter
  const counts = useMemo(
    () => ({
      all: transfers.length,
      incoming: transfers.filter((t) => isIncoming(t)).length,
      outgoing: transfers.filter((t) => !isIncoming(t)).length,
    }),
    [transfers, userClub.id]
  )

  if (transfers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('history.title')}</CardTitle>
          <CardDescription>{t('history.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">{t('history.empty')}</p>
            <p className="text-sm text-muted-foreground">
              {t('history.emptyDescription', { clubName: userClub.name })}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('history.title')}</CardTitle>
            <CardDescription>{t('history.subtitle')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <History className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              {t('history.filters.all')}
              <Badge variant="secondary" className="ml-1">
                {counts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              {t('history.filters.incoming')}
              <Badge variant="secondary" className="ml-1">
                {counts.incoming}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              {t('history.filters.outgoing')}
              <Badge variant="secondary" className="ml-1">
                {counts.outgoing}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Transfers table */}
        <ScrollArea className="max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.player')}</TableHead>
                <TableHead>{t('table.fromTo')}</TableHead>
                <TableHead>{t('table.type')}</TableHead>
                <TableHead className="text-right">{t('table.amount')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => {
                const incoming = isIncoming(transfer)

                return (
                  <TableRow key={transfer.id}>
                    {/* Player */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {incoming ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {transfer.player?.name}
                          </p>
                          {transfer.player?.overall && (
                            <p className="text-xs text-muted-foreground">
                              OVR: {transfer.player.overall}
                              {transfer.player.isKempesita && ' | K'}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* From/To */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="truncate max-w-[80px]">
                          {transfer.fromClub?.name || '-'}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate max-w-[80px]">{transfer.toClub?.name || '-'}</span>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(transfer.type)}</Badge>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right">
                      {transfer.totalAmount > 0 ? (
                        <span className={incoming ? 'text-red-500' : 'text-green-500'}>
                          {incoming ? '-' : '+'}
                          {formatCurrency(transfer.totalAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={getStatusVariant(transfer.status)}>
                        {t(`status.${transfer.status}`)}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-muted-foreground">
                      {formatDate(transfer.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
