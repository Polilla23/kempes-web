import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import { DefaultHeader } from '@/components/table/table-header'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import type { ClubSeasonBalance, SeasonHalf } from '@/types'

interface OverviewTabProps {
  balances: ClubSeasonBalance[]
  seasonHalves: SeasonHalf[]
  selectedSeasonHalfId: string
  onSeasonHalfChange: (id: string) => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function OverviewTab({
  balances,
  seasonHalves,
  selectedSeasonHalfId,
  onSeasonHalfChange,
}: OverviewTabProps) {
  const { t } = useTranslation('finances')
  const navigate = useNavigate()

  const sortedBalances = useMemo(
    () => [...balances].sort((a, b) => b.endingBalance - a.endingBalance),
    [balances]
  )

  const totals = useMemo(() => {
    return balances.reduce(
      (acc, b) => ({
        income: acc.income + b.totalIncome,
        expenses: acc.expenses + b.totalExpenses,
        salaries: acc.salaries + b.totalSalaries,
      }),
      { income: 0, expenses: 0, salaries: 0 }
    )
  }, [balances])

  const getSeasonHalfLabel = (half: SeasonHalf) => {
    const halfLabel = half.halfType === 'FIRST_HALF' ? t('labels.firstHalf') : t('labels.secondHalf')
    return half.seasonNumber ? `T${half.seasonNumber} - ${halfLabel}` : halfLabel
  }

  const columnHelper = createColumnHelper<ClubSeasonBalance>()

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'clubName',
        header: (info) => <DefaultHeader info={info} name={t('overview.clubName')} type="string" />,
        cell: ({ row }) => (
          <span
            className="font-medium cursor-pointer hover:text-primary hover:underline"
            onClick={() => navigate({ to: '/management/finances/club/$clubId', params: { clubId: row.original.clubId } })}
          >
            {row.original.club?.name || row.original.clubId}
          </span>
        ),
      }),
      columnHelper.accessor('startingBalance', {
        header: (info) => <DefaultHeader info={info} name={t('overview.startingBalance')} type="number" />,
        cell: (info) => <span className="text-muted-foreground">{formatCurrency(info.getValue())}</span>,
      }),
      columnHelper.accessor('totalIncome', {
        header: (info) => <DefaultHeader info={info} name={t('overview.income')} type="number" />,
        cell: (info) => <span className="text-green-600 font-medium">+{formatCurrency(info.getValue())}</span>,
      }),
      columnHelper.accessor('totalExpenses', {
        header: (info) => <DefaultHeader info={info} name={t('overview.expenses')} type="number" />,
        cell: (info) => <span className="text-red-600 font-medium">-{formatCurrency(info.getValue())}</span>,
      }),
      columnHelper.accessor('endingBalance', {
        header: (info) => <DefaultHeader info={info} name={t('overview.endingBalance')} type="number" />,
        cell: (info) => {
          const value = info.getValue()
          return (
            <Badge variant={value >= 0 ? 'default' : 'destructive'} className="font-mono">
              {formatCurrency(value)}
            </Badge>
          )
        },
      }),
    ],
    [t, navigate]
  )

  return (
    <div className="space-y-6">
      {/* Season Half Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium select-none">{t('overview.selectSeasonHalf')}:</label>
        <Select value={selectedSeasonHalfId} onValueChange={onSeasonHalfChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder={t('overview.selectSeasonHalf')} />
          </SelectTrigger>
          <SelectContent>
            {seasonHalves.map((half) => (
              <SelectItem key={half.id} value={half.id}>
                {getSeasonHalfLabel(half)}
                {half.isActive && ' (Activa)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('overview.totalLeagueIncome')}</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('overview.totalLeagueExpenses')}</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totals.expenses)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('overview.totalLeagueSalaries')}</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.salaries)}</p>
          </div>
        </div>
      </div>

      {/* Balances Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3 select-none">{t('overview.allClubBalances')}</h2>
        {sortedBalances.length > 0 ? (
          <DataTable<ClubSeasonBalance, any> columns={columns} data={sortedBalances} />
        ) : (
          <p className="text-muted-foreground text-center py-8">{t('overview.noBalances')}</p>
        )}
      </div>
    </div>
  )
}
