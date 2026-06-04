import { ArrowDown, ArrowUp, Equal, Banknote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/finance-utils'
import type { ClubSeasonBalance } from '@/types'

interface BalanceWaterfallProps {
  balance: ClubSeasonBalance
}

export function BalanceWaterfall({ balance }: BalanceWaterfallProps) {
  const steps = [
    {
      label: 'Balance inicial',
      value: balance.startingBalance,
      prefix: '',
      colorClass: 'text-foreground',
      icon: <Banknote className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: 'Ingresos',
      value: balance.totalIncome,
      prefix: '+',
      colorClass: 'text-green-600',
      icon: <ArrowUp className="h-4 w-4 text-green-600" />,
    },
    {
      label: 'Egresos',
      value: balance.totalExpenses,
      prefix: '-',
      colorClass: 'text-red-600',
      icon: <ArrowDown className="h-4 w-4 text-red-600" />,
    },
    {
      label: 'Salarios',
      value: balance.totalSalaries,
      prefix: '-',
      colorClass: 'text-orange-600',
      icon: <ArrowDown className="h-4 w-4 text-orange-600" />,
    },
    {
      label: 'Balance final',
      value: balance.endingBalance,
      prefix: '',
      colorClass: balance.endingBalance >= 0 ? 'text-foreground font-bold' : 'text-destructive font-bold',
      icon: <Equal className="h-4 w-4 text-muted-foreground" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {steps.map((step, i) => (
        <Card key={i} className={i === steps.length - 1 ? 'col-span-2 sm:col-span-1' : ''}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              {step.icon}
              <p className="text-xs text-muted-foreground">{step.label}</p>
            </div>
            <p className={`text-base font-semibold font-mono ${step.colorClass}`}>
              {step.prefix}{formatCurrency(step.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
