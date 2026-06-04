import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, DollarSign } from 'lucide-react'
import { checkAuth } from '../../../services/auth-guard'
import { FinanceService } from '@/services/finance.service'
import { TransferService } from '@/services/transfer.service'
import { SeasonHalfService } from '@/services/season-half.service'
import MeService from '@/services/me.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BalanceHeroCard } from './_components/balance-hero-card'
import { BalanceWaterfall } from './_components/balance-waterfall'
import { IncomeExpenseBreakdown } from './_components/income-expense-breakdown'
import { InstallmentsSection } from './_components/installments-section'
import { TransactionJournal } from './_components/transaction-journal'
import type { ClubSeasonBalance, FinancialTransaction, Transfer, SeasonHalf } from '@/types'

export const Route = createFileRoute('/dashboard/finances/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: MyFinancesPage,
})

function MyFinancesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [clubId, setClubId] = useState<string | null>(null)
  const [seasonHalves, setSeasonHalves] = useState<SeasonHalf[]>([])
  const [selectedSeasonHalfId, setSelectedSeasonHalfId] = useState<string>('')
  const [balance, setBalance] = useState<ClubSeasonBalance | null>(null)
  const [previousBalance, setPreviousBalance] = useState<ClubSeasonBalance | null>(null)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const [meResult, halvesResult, activeResult] = await Promise.allSettled([
        MeService.getClub(),
        SeasonHalfService.getSeasonHalves(),
        SeasonHalfService.getActiveSeasonHalf(),
      ])

      const club = meResult.status === 'fulfilled' ? meResult.value : null
      const halves = halvesResult.status === 'fulfilled' ? halvesResult.value.seasonHalves ?? [] : []
      const active = activeResult.status === 'fulfilled' ? activeResult.value.seasonHalf ?? null : null

      setClubId(club?.id ?? null)
      setSeasonHalves(halves)

      const activeId = active?.id ?? halves[0]?.id ?? ''
      setSelectedSeasonHalfId(activeId)

      if (club?.id && activeId) {
        await loadFinancialData(club.id, activeId, halves)
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const loadFinancialData = async (cId: string, shId: string, halves: SeasonHalf[]) => {
    const [balanceResult, transactionsResult, transfersResult] = await Promise.allSettled([
      FinanceService.getClubBalance(cId, shId),
      FinanceService.getTransactionsByClub(cId, shId),
      TransferService.getTransfers(),
    ])

    const newBalance = balanceResult.status === 'fulfilled' ? balanceResult.value.balance ?? null : null
    setBalance(newBalance)
    setTransactions(
      transactionsResult.status === 'fulfilled' ? transactionsResult.value.transactions : []
    )
    setTransfers(
      transfersResult.status === 'fulfilled' ? transfersResult.value.transfers : []
    )

    // Load previous period balance for comparison
    if (newBalance) {
      const currentIndex = halves.findIndex((h) => h.id === shId)
      const prevHalf = currentIndex > 0 ? halves[currentIndex - 1] : null
      if (prevHalf) {
        try {
          const prevRes = await FinanceService.getClubBalance(cId, prevHalf.id)
          setPreviousBalance(prevRes.balance ?? null)
        } catch {
          setPreviousBalance(null)
        }
      } else {
        setPreviousBalance(null)
      }
    }
  }

  const handleSeasonHalfChange = async (id: string) => {
    setSelectedSeasonHalfId(id)
    if (clubId) {
      await loadFinancialData(clubId, id, seasonHalves)
    }
  }

  const getSeasonHalfLabel = (half: SeasonHalf) => {
    const halfLabel = half.halfType === 'FIRST_HALF' ? 'Primera mitad' : 'Segunda mitad'
    return half.seasonNumber ? `T${half.seasonNumber} - ${halfLabel}` : halfLabel
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando finanzas...</p>
        </div>
      </div>
    )
  }

  if (!clubId) {
    return (
      <div className="flex flex-col w-full px-[5%] lg:px-[7%] xl:px-[10%] py-6">
        <p className="text-muted-foreground">No tenés un club asignado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full px-[5%] lg:px-[7%] xl:px-[10%] py-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-bold select-none">Mis Finanzas</h1>
        </div>

        <Select value={selectedSeasonHalfId} onValueChange={handleSeasonHalfChange}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Seleccionar período" />
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

      {/* Hero Balance */}
      <BalanceHeroCard balance={balance} previousBalance={previousBalance} />

      {/* Waterfall */}
      {balance && <BalanceWaterfall balance={balance} />}

      {/* Income/Expense Breakdown */}
      {transactions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Desglose del período</h2>
          <IncomeExpenseBreakdown transactions={transactions} />
        </div>
      )}

      {/* Installments: Por Cobrar / Por Pagar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-green-600">Por Cobrar</h2>
          <InstallmentsSection
            transfers={transfers}
            direction="receivable"
            userClubId={clubId}
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-red-600">Por Pagar</h2>
          <InstallmentsSection
            transfers={transfers}
            direction="payable"
            userClubId={clubId}
          />
        </div>
      </div>

      {/* Transaction Journal */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Movimientos del período</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Sin movimientos en este período</p>
        ) : (
          <TransactionJournal
            transactions={transactions}
            openingBalance={balance?.startingBalance ?? 0}
          />
        )}
      </div>
    </div>
  )
}
