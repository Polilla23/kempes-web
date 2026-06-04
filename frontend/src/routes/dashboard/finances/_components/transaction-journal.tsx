import { useState, useMemo } from 'react'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  AlertTriangle,
  Gift,
  Banknote,
  Gavel,
  ArrowLeftRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/finance-utils'
import { cn } from '@/lib/utils'
import type { FinancialTransaction, TransactionType } from '@/types'

const TYPE_ICON: Record<TransactionType, React.ReactNode> = {
  TRANSFER_INCOME: <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />,
  TRANSFER_EXPENSE: <ArrowDownLeft className="h-3.5 w-3.5 text-red-600" />,
  LOAN_FEE_INCOME: <ArrowUpRight className="h-3.5 w-3.5 text-blue-600" />,
  LOAN_FEE_EXPENSE: <ArrowDownLeft className="h-3.5 w-3.5 text-blue-600" />,
  PRIZE_INCOME: <Trophy className="h-3.5 w-3.5 text-yellow-600" />,
  FINE_EXPENSE: <AlertTriangle className="h-3.5 w-3.5 text-red-600" />,
  SALARY_EXPENSE: <Banknote className="h-3.5 w-3.5 text-orange-600" />,
  BONUS_INCOME: <Gift className="h-3.5 w-3.5 text-purple-600" />,
  AUCTION_INCOME: <Gavel className="h-3.5 w-3.5 text-green-600" />,
  AUCTION_EXPENSE: <Gavel className="h-3.5 w-3.5 text-red-600" />,
  PLAYER_SWAP_CREDIT: <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-600" />,
  PLAYER_SWAP_DEBIT: <ArrowLeftRight className="h-3.5 w-3.5 text-cyan-600" />,
}

const TYPE_LABEL: Record<TransactionType, string> = {
  TRANSFER_INCOME: 'Venta',
  TRANSFER_EXPENSE: 'Compra',
  LOAN_FEE_INCOME: 'Préstamo cobrado',
  LOAN_FEE_EXPENSE: 'Préstamo pagado',
  PRIZE_INCOME: 'Premio',
  FINE_EXPENSE: 'Multa',
  SALARY_EXPENSE: 'Salarios',
  BONUS_INCOME: 'Bono',
  AUCTION_INCOME: 'Subasta (ingreso)',
  AUCTION_EXPENSE: 'Subasta (gasto)',
  PLAYER_SWAP_CREDIT: 'Canje (recibido)',
  PLAYER_SWAP_DEBIT: 'Canje (cedido)',
}

const INCOME_TYPES: TransactionType[] = [
  'TRANSFER_INCOME',
  'LOAN_FEE_INCOME',
  'PRIZE_INCOME',
  'BONUS_INCOME',
  'AUCTION_INCOME',
  'PLAYER_SWAP_CREDIT',
]

type FilterKey =
  | 'all'
  | 'transfers'
  | 'salaries'
  | 'prizes'
  | 'fines'
  | 'bonuses'
  | 'loans'
  | 'auctions'
  | 'swaps'

const FILTER_TYPES: Record<FilterKey, TransactionType[] | null> = {
  all: null,
  transfers: ['TRANSFER_INCOME', 'TRANSFER_EXPENSE'],
  salaries: ['SALARY_EXPENSE'],
  prizes: ['PRIZE_INCOME'],
  fines: ['FINE_EXPENSE'],
  bonuses: ['BONUS_INCOME'],
  loans: ['LOAN_FEE_INCOME', 'LOAN_FEE_EXPENSE'],
  auctions: ['AUCTION_INCOME', 'AUCTION_EXPENSE'],
  swaps: ['PLAYER_SWAP_CREDIT', 'PLAYER_SWAP_DEBIT'],
}

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'Todos',
  transfers: 'Transfers',
  salaries: 'Salarios',
  prizes: 'Premios',
  fines: 'Multas',
  bonuses: 'Bonos',
  loans: 'Préstamos',
  auctions: 'Subastas',
  swaps: 'Canjes',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  })
}

interface TransactionJournalProps {
  transactions: FinancialTransaction[]
  openingBalance: number
}

export function TransactionJournal({ transactions, openingBalance }: TransactionJournalProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [transactions]
  )

  // Compute running balance for all transactions (unfiltered)
  const withBalance = useMemo(() => {
    let running = openingBalance
    return sorted.map((tx) => {
      const isIncome = INCOME_TYPES.includes(tx.type)
      running = isIncome ? running + tx.amount : running - tx.amount
      return { tx, runningBalance: running, isIncome }
    })
  }, [sorted, openingBalance])

  const filteredRows = useMemo(() => {
    const types = FILTER_TYPES[activeFilter]
    if (!types) return withBalance
    return withBalance.filter((r) => types.includes(r.tx.type))
  }, [withBalance, activeFilter])

  const totals = useMemo(() => {
    const income = sorted
      .filter((tx) => INCOME_TYPES.includes(tx.type))
      .reduce((sum, tx) => sum + tx.amount, 0)
    const expense = sorted
      .filter((tx) => !INCOME_TYPES.includes(tx.type))
      .reduce((sum, tx) => sum + tx.amount, 0)
    return { income, expense }
  }, [sorted])

  const closingBalance = openingBalance + totals.income - totals.expense

  // Active filters derived from data
  const activeFilters = useMemo(() => {
    const types = new Set(sorted.map((tx) => tx.type))
    return (Object.keys(FILTER_TYPES) as FilterKey[]).filter((key) => {
      if (key === 'all') return true
      return FILTER_TYPES[key]?.some((t) => types.has(t))
    })
  }, [sorted])

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((key) => (
          <Button
            key={key}
            variant={activeFilter === key ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveFilter(key)}
          >
            {FILTER_LABELS[key]}
          </Button>
        ))}
      </div>

      {/* Journal Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background shadow-sm">
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[80px]">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Concepto</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ingreso</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Egreso</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening balance */}
              {activeFilter === 'all' && (
                <tr className="border-b bg-muted/30">
                  <td className="px-4 py-2 text-xs text-muted-foreground" colSpan={3}>
                    <em>Balance de apertura</em>
                  </td>
                  <td className="px-4 py-2" />
                  <td className="px-4 py-2" />
                  <td className="px-4 py-2 text-right font-mono font-semibold">
                    {formatCurrency(openingBalance)}
                  </td>
                </tr>
              )}

              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Sin movimientos para este filtro
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ tx, runningBalance, isIncome }) => (
                  <tr key={tx.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {TYPE_ICON[tx.type]}
                        <span className="text-xs text-muted-foreground">{TYPE_LABEL[tx.type]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs">
                      {isIncome ? (
                        <span className="text-green-600">+{formatCurrency(tx.amount)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs">
                      {!isIncome ? (
                        <span className="text-red-600">-{formatCurrency(tx.amount)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold">
                      <span className={runningBalance >= 0 ? 'text-foreground' : 'text-destructive'}>
                        {formatCurrency(runningBalance)}
                      </span>
                    </td>
                  </tr>
                ))
              )}

              {/* Closing balance */}
              {activeFilter === 'all' && (
                <tr className="border-b bg-muted/30">
                  <td className="px-4 py-2 text-xs text-muted-foreground" colSpan={3}>
                    <em>Balance de cierre</em>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-green-600">
                    +{formatCurrency(totals.income)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-red-600">
                    -{formatCurrency(totals.expense)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold">
                    <span className={closingBalance >= 0 ? 'text-foreground' : 'text-destructive'}>
                      {formatCurrency(closingBalance)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals footer */}
      <div className="flex justify-end gap-6 text-sm pr-2">
        <span className="text-muted-foreground">
          Total ingresos: <strong className="text-green-600">{formatCurrency(totals.income)}</strong>
        </span>
        <span className="text-muted-foreground">
          Total egresos: <strong className="text-red-600">{formatCurrency(totals.expense)}</strong>
        </span>
      </div>
    </div>
  )
}
