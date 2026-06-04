import { formatCurrency } from '@/lib/finance-utils'
import type { FinancialTransaction, TransactionType } from '@/types'

const INCOME_TYPES: TransactionType[] = [
  'TRANSFER_INCOME',
  'LOAN_FEE_INCOME',
  'PRIZE_INCOME',
  'BONUS_INCOME',
  'AUCTION_INCOME',
  'PLAYER_SWAP_CREDIT',
]

const EXPENSE_TYPES: TransactionType[] = [
  'TRANSFER_EXPENSE',
  'LOAN_FEE_EXPENSE',
  'FINE_EXPENSE',
  'SALARY_EXPENSE',
  'AUCTION_EXPENSE',
  'PLAYER_SWAP_DEBIT',
]

const TYPE_LABELS: Record<TransactionType, string> = {
  TRANSFER_INCOME: 'Ingresos por ventas',
  LOAN_FEE_INCOME: 'Cuotas de préstamos',
  PRIZE_INCOME: 'Premios',
  BONUS_INCOME: 'Bonos',
  AUCTION_INCOME: 'Subastas (ingreso)',
  PLAYER_SWAP_CREDIT: 'Jugadores recibidos',
  TRANSFER_EXPENSE: 'Gastos por compras',
  LOAN_FEE_EXPENSE: 'Cuotas cedidas',
  FINE_EXPENSE: 'Multas',
  SALARY_EXPENSE: 'Salarios',
  AUCTION_EXPENSE: 'Subastas (gasto)',
  PLAYER_SWAP_DEBIT: 'Jugadores cedidos',
}

function CategoryBar({ label, amount, max }: { label: string; amount: number; max: number }) {
  const pct = max > 0 ? (amount / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium font-mono">{formatCurrency(amount)}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

interface IncomeExpenseBreakdownProps {
  transactions: FinancialTransaction[]
}

export function IncomeExpenseBreakdown({ transactions }: IncomeExpenseBreakdownProps) {
  const incomeByType: Partial<Record<TransactionType, number>> = {}
  const expenseByType: Partial<Record<TransactionType, number>> = {}

  for (const tx of transactions) {
    if (INCOME_TYPES.includes(tx.type)) {
      incomeByType[tx.type] = (incomeByType[tx.type] ?? 0) + tx.amount
    } else if (EXPENSE_TYPES.includes(tx.type)) {
      expenseByType[tx.type] = (expenseByType[tx.type] ?? 0) + tx.amount
    }
  }

  const maxIncome = Math.max(...Object.values(incomeByType).map((v) => v ?? 0), 1)
  const maxExpense = Math.max(...Object.values(expenseByType).map((v) => v ?? 0), 1)

  const incomeEntries = INCOME_TYPES.filter((t) => incomeByType[t])
  const expenseEntries = EXPENSE_TYPES.filter((t) => expenseByType[t])

  if (incomeEntries.length === 0 && expenseEntries.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-green-600">Desglose de Ingresos</h3>
        {incomeEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ingresos en este período</p>
        ) : (
          incomeEntries.map((type) => (
            <CategoryBar
              key={type}
              label={TYPE_LABELS[type]}
              amount={incomeByType[type] ?? 0}
              max={maxIncome}
            />
          ))
        )}
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-red-600">Desglose de Egresos</h3>
        {expenseEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin egresos en este período</p>
        ) : (
          expenseEntries.map((type) => (
            <CategoryBar
              key={type}
              label={TYPE_LABELS[type]}
              amount={expenseByType[type] ?? 0}
              max={maxExpense}
            />
          ))
        )}
      </div>
    </div>
  )
}
