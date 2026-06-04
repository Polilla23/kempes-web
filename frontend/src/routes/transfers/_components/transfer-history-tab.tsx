import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trophy, ArrowLeftRight, DollarSign, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TransferDetailPanel } from './transfer-detail-panel'
import { TYPE_BADGE_CLASSES, STATUS_BADGE_CLASSES, TYPE_LABELS, STATUS_LABELS } from './transfer-badge-classes'
import { cn } from '@/lib/utils'
import type { Transfer, TransferType, TransferStatus } from '@/types'

function formatAmount(amount: number) {
  return `$${amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface HistoryFilters {
  type: TransferType | ''
  status: TransferStatus | ''
  seasonHalfId: string
  clubName: string
}

const ALL = '__ALL__'

interface TransferHistoryTabProps {
  transfers: Transfer[]
  onSelectTransfer: (id: string) => void
  selectedId: string | null
  detail: Transfer | null
  detailLoading: boolean
}

export function TransferHistoryTab({
  transfers,
  onSelectTransfer,
  selectedId,
  detail,
  detailLoading,
}: TransferHistoryTabProps) {
  const { t } = useTranslation('transfers')
  const [filters, setFilters] = useState<HistoryFilters>({
    type: '',
    status: '',
    seasonHalfId: '',
    clubName: '',
  })

  const stats = useMemo(() => {
    const total = transfers.length
    const totalMoney = transfers.reduce((sum, tr) => sum + (tr.totalAmount || 0), 0)
    const mostExpensive = transfers.reduce(
      (max, tr) => (tr.totalAmount > (max?.totalAmount ?? 0) ? tr : max),
      null as Transfer | null
    )
    const clubCount: Record<string, number> = {}
    for (const tr of transfers) {
      if (tr.fromClub?.name) clubCount[tr.fromClub.name] = (clubCount[tr.fromClub.name] ?? 0) + 1
      if (tr.toClub?.name) clubCount[tr.toClub.name] = (clubCount[tr.toClub.name] ?? 0) + 1
    }
    const mostActiveClub = Object.entries(clubCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    return { total, totalMoney, mostExpensive, mostActiveClub }
  }, [transfers])

  const seasonHalves = useMemo(() => {
    const seen = new Map<string, string>()
    for (const tr of transfers) {
      if (tr.seasonHalf && !seen.has(tr.seasonHalfId)) {
        const label = tr.seasonHalf.halfType === 'FIRST_HALF' ? '1ra Mitad' : '2da Mitad'
        seen.set(tr.seasonHalfId, label)
      }
    }
    return [...seen.entries()]
  }, [transfers])

  const clubNames = useMemo(() => {
    const names = new Set<string>()
    for (const tr of transfers) {
      if (tr.fromClub?.name) names.add(tr.fromClub.name)
      if (tr.toClub?.name) names.add(tr.toClub.name)
    }
    return [...names].sort()
  }, [transfers])

  const filtered = useMemo(() => {
    return transfers.filter((tr) => {
      if (filters.type && tr.type !== filters.type) return false
      if (filters.status && tr.status !== filters.status) return false
      if (filters.seasonHalfId && tr.seasonHalfId !== filters.seasonHalfId) return false
      if (filters.clubName) {
        if (tr.fromClub?.name !== filters.clubName && tr.toClub?.name !== filters.clubName) return false
      }
      return true
    })
  }, [transfers, filters])

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <div className="rounded-full bg-primary/10 p-2.5">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total transferencias</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <div className="rounded-full bg-green-100 p-2.5 dark:bg-green-900">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dinero movido</p>
            <p className="text-lg font-bold">{formatAmount(stats.totalMoney)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <div className="rounded-full bg-yellow-100 p-2.5 dark:bg-yellow-900">
            <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Transferencia más cara</p>
            <p className="text-lg font-bold">
              {stats.mostExpensive ? formatAmount(stats.mostExpensive.totalAmount) : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <div className="rounded-full bg-blue-100 p-2.5 dark:bg-blue-900">
            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Club más activo</p>
            <p className="text-sm font-bold truncate max-w-[120px]">{stats.mostActiveClub}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.type || ALL}
          onValueChange={(v) => setFilters((f) => ({ ...f, type: v === ALL ? '' : (v as TransferType) }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los tipos</SelectItem>
            {(Object.keys(TYPE_LABELS) as TransferType[]).map((type) => (
              <SelectItem key={type} value={type}>{TYPE_LABELS[type]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || ALL}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v === ALL ? '' : (v as TransferStatus) }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            {(Object.keys(STATUS_LABELS) as TransferStatus[]).map((status) => (
              <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.seasonHalfId || ALL}
          onValueChange={(v) => setFilters((f) => ({ ...f, seasonHalfId: v === ALL ? '' : v }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los períodos</SelectItem>
            {seasonHalves.map(([id, label]) => (
              <SelectItem key={id} value={id}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.clubName || ALL}
          onValueChange={(v) => setFilters((f) => ({ ...f, clubName: v === ALL ? '' : v }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Club" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los clubes</SelectItem>
            {clubNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table + Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* History Table */}
        <div className="rounded-md border overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-background shadow-sm">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Jugador</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">De → A</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('list.columns.amount')}</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('list.columns.status')}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No hay transferencias para los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  filtered.map((tr) => (
                    <tr
                      key={tr.id}
                      className={cn(
                        'border-b cursor-pointer hover:bg-muted/50 transition-colors',
                        selectedId === tr.id && 'bg-muted'
                      )}
                      onClick={() => onSelectTransfer(tr.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tr.player?.fullName ?? '—'}</span>
                          {tr.player?.overall != null && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 font-mono">
                              {tr.player.overall}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <span>{tr.fromClub?.name ?? '—'}</span>
                        <span className="mx-1 font-bold">→</span>
                        <span>{tr.toClub?.name ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                            TYPE_BADGE_CLASSES[tr.type]
                          )}
                        >
                          {TYPE_LABELS[tr.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatAmount(tr.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                            STATUS_BADGE_CLASSES[tr.status]
                          )}
                        >
                          {STATUS_LABELS[tr.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                        {formatDate(tr.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <TransferDetailPanel transfer={detail} isLoading={detailLoading} />
      </div>
    </div>
  )
}
