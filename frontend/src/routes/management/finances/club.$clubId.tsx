import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import { DefaultHeader } from '@/components/table/table-header'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Banknote,
  Plus,
  Loader2,
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'
import { SeasonHalfService } from '@/services/season-half.service'
import type {
  FinancialTransaction,
  ClubSeasonBalance,
  SeasonHalf,
  TransactionType,
} from '@/types'
import api from '@/services/api'

export const Route = createFileRoute('/management/finances/club/$clubId')({
  component: ClubFinanceDetail,
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function ClubFinanceDetail() {
  const { clubId } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('finances')

  const [isLoading, setIsLoading] = useState(true)
  const [clubName, setClubName] = useState('')
  const [balance, setBalance] = useState<ClubSeasonBalance | null>(null)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [seasonHalves, setSeasonHalves] = useState<SeasonHalf[]>([])
  const [selectedSeasonHalfId, setSelectedSeasonHalfId] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Modal state
  const [isFineOpen, setIsFineOpen] = useState(false)
  const [isBonusOpen, setIsBonusOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fineForm, setFineForm] = useState({ amount: 0, description: '' })
  const [bonusForm, setBonusForm] = useState({ amount: 0, description: '' })

  const fetchClub = async () => {
    try {
      const response = await api.get<{ data: { id: string; name: string } }>(`/api/v1/clubs/${clubId}`)
      setClubName(response.data?.data?.name || '')
    } catch (error) {
      console.error('Error fetching club:', error)
    }
  }

  const fetchSeasonHalves = async () => {
    try {
      const [halvesRes, activeRes] = await Promise.all([
        SeasonHalfService.getSeasonHalves(),
        SeasonHalfService.getActiveSeasonHalf(),
      ])
      setSeasonHalves(halvesRes.seasonHalves || [])
      const active = activeRes.seasonHalf
      if (active) {
        setSelectedSeasonHalfId(active.id)
      } else if (halvesRes.seasonHalves.length > 0) {
        setSelectedSeasonHalfId(halvesRes.seasonHalves[0].id)
      }
    } catch (error) {
      console.error('Error fetching season halves:', error)
    }
  }

  const fetchBalance = async (seasonHalfId: string) => {
    try {
      const response = await FinanceService.getClubBalance(clubId, seasonHalfId)
      setBalance(response.balance || null)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance(null)
    }
  }

  const fetchTransactions = async (seasonHalfId: string) => {
    try {
      const response = await FinanceService.getTransactionsByClub(clubId, seasonHalfId)
      setTransactions(response.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchClub(), fetchSeasonHalves()])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [clubId])

  useEffect(() => {
    if (selectedSeasonHalfId) {
      fetchBalance(selectedSeasonHalfId)
      fetchTransactions(selectedSeasonHalfId)
    }
  }, [selectedSeasonHalfId, clubId])

  const handleRecordFine = async () => {
    try {
      setIsSubmitting(true)
      await FinanceService.recordFine({
        clubId,
        amount: fineForm.amount,
        description: fineForm.description,
        seasonHalfId: selectedSeasonHalfId || undefined,
      })
      toast.success(t('fines.create.success'))
      setIsFineOpen(false)
      setFineForm({ amount: 0, description: '' })
      if (selectedSeasonHalfId) {
        await Promise.all([fetchBalance(selectedSeasonHalfId), fetchTransactions(selectedSeasonHalfId)])
      }
    } catch (error) {
      toast.error(t('fines.create.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecordBonus = async () => {
    try {
      setIsSubmitting(true)
      await FinanceService.recordBonus({
        clubId,
        amount: bonusForm.amount,
        description: bonusForm.description,
        seasonHalfId: selectedSeasonHalfId || undefined,
      })
      toast.success(t('bonuses.create.success'))
      setIsBonusOpen(false)
      setBonusForm({ amount: 0, description: '' })
      if (selectedSeasonHalfId) {
        await Promise.all([fetchBalance(selectedSeasonHalfId), fetchTransactions(selectedSeasonHalfId)])
      }
    } catch (error) {
      toast.error(t('bonuses.create.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSeasonHalfLabel = (half: SeasonHalf) => {
    const halfLabel = half.halfType === 'FIRST_HALF' ? t('labels.firstHalf') : t('labels.secondHalf')
    return half.seasonNumber ? `T${half.seasonNumber} - ${halfLabel}` : halfLabel
  }

  const isIncome = (type: TransactionType) => {
    return [
      'TRANSFER_INCOME',
      'LOAN_FEE_INCOME',
      'PRIZE_INCOME',
      'BONUS_INCOME',
      'AUCTION_INCOME',
      'PLAYER_SWAP_CREDIT',
    ].includes(type)
  }

  const filteredTransactions = useMemo(() => {
    if (typeFilter === 'all') return transactions
    return transactions.filter((tx) => tx.type === typeFilter)
  }, [transactions, typeFilter])

  const columnHelper = createColumnHelper<FinancialTransaction>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('createdAt', {
        header: (info) => <DefaultHeader info={info} name={t('table.date')} type="string" />,
        cell: (info) => (
          <span className="text-muted-foreground text-sm">
            {new Date(info.getValue()).toLocaleDateString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('type', {
        header: (info) => <DefaultHeader info={info} name={t('table.type')} type="string" />,
        cell: (info) => {
          const type = info.getValue()
          const income = isIncome(type)
          return (
            <Badge variant={income ? 'default' : 'destructive'} className="text-xs">
              {t(`transactionTypes.${type}`)}
            </Badge>
          )
        },
      }),
      columnHelper.accessor('description', {
        header: (info) => <DefaultHeader info={info} name={t('table.description')} type="string" />,
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor('amount', {
        header: (info) => <DefaultHeader info={info} name={t('table.amount')} type="number" />,
        cell: (info) => {
          const amount = info.getValue()
          const income = amount >= 0
          return (
            <span className={`font-mono font-medium ${income ? 'text-green-600' : 'text-red-600'}`}>
              {income ? '+' : ''}
              {formatCurrency(amount)}
            </span>
          )
        },
      }),
    ],
    [t]
  )

  if (isLoading) {
    return <ClubAndUserTableSkeleton rows={8} />
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between w-full mt-8 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/management/finances' })}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold select-none">
                {clubName || t('clubDetail.title')}
              </h1>
              <p className="text-sm text-muted-foreground">{t('clubDetail.title')}</p>
            </div>
          </div>

          {balance && (
            <Badge
              variant={balance.endingBalance >= 0 ? 'default' : 'destructive'}
              className="text-lg font-mono px-4 py-1"
            >
              {formatCurrency(balance.endingBalance)}
            </Badge>
          )}
        </div>

        {/* Season Half Selector */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium select-none">{t('fields.seasonHalf')}:</label>
            <Select value={selectedSeasonHalfId} onValueChange={setSelectedSeasonHalfId}>
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFineOpen(true)}>
              <Banknote className="size-4 mr-1" /> {t('clubDetail.recordFine')}
            </Button>
            <Button variant="outline" onClick={() => setIsBonusOpen(true)}>
              <Plus className="size-4 mr-1" /> {t('clubDetail.recordBonus')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {balance && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full mb-6">
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xs text-muted-foreground">{t('clubDetail.starting')}</p>
              <p className="text-lg font-bold">{formatCurrency(balance.startingBalance)}</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xs text-muted-foreground">{t('clubDetail.income')}</p>
              <p className="text-lg font-bold text-green-600">+{formatCurrency(balance.totalIncome)}</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xs text-muted-foreground">{t('clubDetail.expenses')}</p>
              <p className="text-lg font-bold text-red-600">-{formatCurrency(balance.totalExpenses)}</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xs text-muted-foreground">{t('clubDetail.salariesAmount')}</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(balance.totalSalaries)}</p>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <p className="text-xs text-muted-foreground">{t('clubDetail.ending')}</p>
              <p className={`text-lg font-bold ${balance.endingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance.endingBalance)}
              </p>
            </div>
          </div>
        )}

        {/* Type Filter + Transaction Table */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold select-none">{t('clubDetail.transactionHistory')}</h2>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={t('clubDetail.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('clubDetail.allTypes')}</SelectItem>
                <SelectItem value="TRANSFER_INCOME">{t('transactionTypes.TRANSFER_INCOME')}</SelectItem>
                <SelectItem value="TRANSFER_EXPENSE">{t('transactionTypes.TRANSFER_EXPENSE')}</SelectItem>
                <SelectItem value="LOAN_FEE_INCOME">{t('transactionTypes.LOAN_FEE_INCOME')}</SelectItem>
                <SelectItem value="LOAN_FEE_EXPENSE">{t('transactionTypes.LOAN_FEE_EXPENSE')}</SelectItem>
                <SelectItem value="PRIZE_INCOME">{t('transactionTypes.PRIZE_INCOME')}</SelectItem>
                <SelectItem value="FINE_EXPENSE">{t('transactionTypes.FINE_EXPENSE')}</SelectItem>
                <SelectItem value="SALARY_EXPENSE">{t('transactionTypes.SALARY_EXPENSE')}</SelectItem>
                <SelectItem value="BONUS_INCOME">{t('transactionTypes.BONUS_INCOME')}</SelectItem>
                <SelectItem value="AUCTION_INCOME">{t('transactionTypes.AUCTION_INCOME')}</SelectItem>
                <SelectItem value="AUCTION_EXPENSE">{t('transactionTypes.AUCTION_EXPENSE')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredTransactions.length > 0 ? (
            <DataTable<FinancialTransaction, any> columns={columns} data={filteredTransactions} />
          ) : (
            <p className="text-muted-foreground text-center py-8">{t('transactions.noTransactions')}</p>
          )}
        </div>

        {/* Fine Dialog */}
        <Dialog open={isFineOpen} onOpenChange={setIsFineOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('fines.create.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>{t('fields.amount')}</Label>
                <Input
                  type="number"
                  min={1}
                  value={fineForm.amount}
                  onChange={(e) => setFineForm({ ...fineForm, amount: parseInt(e.target.value) || 0 })}
                  placeholder={t('placeholders.amount')}
                />
              </div>
              <div>
                <Label>{t('fields.description')}</Label>
                <Input
                  value={fineForm.description}
                  onChange={(e) => setFineForm({ ...fineForm, description: e.target.value })}
                  placeholder={t('placeholders.description')}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleRecordFine}
                disabled={isSubmitting || fineForm.amount <= 0 || !fineForm.description}
              >
                {isSubmitting ? <Loader2 className="animate-spin size-4" /> : t('fines.create.title')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bonus Dialog */}
        <Dialog open={isBonusOpen} onOpenChange={setIsBonusOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('bonuses.create.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>{t('fields.amount')}</Label>
                <Input
                  type="number"
                  min={1}
                  value={bonusForm.amount}
                  onChange={(e) => setBonusForm({ ...bonusForm, amount: parseInt(e.target.value) || 0 })}
                  placeholder={t('placeholders.amount')}
                />
              </div>
              <div>
                <Label>{t('fields.description')}</Label>
                <Input
                  value={bonusForm.description}
                  onChange={(e) => setBonusForm({ ...bonusForm, description: e.target.value })}
                  placeholder={t('placeholders.description')}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleRecordBonus}
                disabled={isSubmitting || bonusForm.amount <= 0 || !bonusForm.description}
              >
                {isSubmitting ? <Loader2 className="animate-spin size-4" /> : t('bonuses.create.title')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ClubFinanceDetail
