import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/finance-utils'
import type { ClubSeasonBalance } from '@/types'

interface BalanceHeroCardProps {
  balance: ClubSeasonBalance | null
  previousBalance: ClubSeasonBalance | null
}

export function BalanceHeroCard({ balance, previousBalance }: BalanceHeroCardProps) {
  if (!balance) return null

  const current = balance.endingBalance
  const prev = previousBalance?.endingBalance ?? null
  const change = prev != null ? current - prev : null
  const changePct = prev != null && prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : null

  const isPositive = change != null && change > 0
  const isNegative = change != null && change < 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Balance actual</p>
            <p
              className={`text-4xl font-bold tracking-tight ${
                current >= 0 ? 'text-foreground' : 'text-destructive'
              }`}
            >
              {formatCurrency(current)}
            </p>
          </div>

          {change != null && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                isPositive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                  : isNegative
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : isNegative ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <Minus className="h-5 w-5" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {change >= 0 ? '+' : ''}{formatCurrency(change)}
                </p>
                {changePct != null && (
                  <p className="text-xs">
                    {changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}% vs período anterior
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
