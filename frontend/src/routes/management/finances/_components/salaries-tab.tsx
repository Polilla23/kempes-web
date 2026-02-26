import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Loader2, Play } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'
import type { SeasonHalf, ProcessSalariesResponse } from '@/types'

interface SalariesTabProps {
  seasonHalves: SeasonHalf[]
  activeSeasonHalf: SeasonHalf | null
  selectedSeasonHalfId: string
  onSeasonHalfChange: (id: string) => void
  onRefresh: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

type SalaryDetail = ProcessSalariesResponse['details'][number]

export function SalariesTab({
  seasonHalves,
  activeSeasonHalf,
  selectedSeasonHalfId,
  onSeasonHalfChange,
  onRefresh,
}: SalariesTabProps) {
  const { t } = useTranslation('finances')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [lastResult, setLastResult] = useState<ProcessSalariesResponse | null>(null)

  const getSeasonHalfLabel = (half: SeasonHalf) => {
    const halfLabel = half.halfType === 'FIRST_HALF' ? t('labels.firstHalf') : t('labels.secondHalf')
    return half.seasonNumber ? `T${half.seasonNumber} - ${halfLabel}` : halfLabel
  }

  const handleProcess = async () => {
    if (!activeSeasonHalf) return
    try {
      setIsProcessing(true)
      const result = await FinanceService.processSalaries(activeSeasonHalf.id)
      setLastResult(result)
      toast.success(t('salaries.processSuccess'))
      setShowConfirm(false)
      onRefresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('salaries.processError')
      if (message.includes('already been processed')) {
        toast.error(t('salaries.alreadyProcessed'))
      } else {
        toast.error(message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const columnHelper = createColumnHelper<SalaryDetail>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('clubName', {
        header: (info) => <DefaultHeader info={info} name={t('salaries.clubName')} type="string" />,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('playerCount', {
        header: (info) => <DefaultHeader info={info} name={t('salaries.players')} type="number" />,
        cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('totalSalary', {
        header: (info) => <DefaultHeader info={info} name={t('salaries.totalSalary')} type="number" />,
        cell: (info) => (
          <span className="font-mono text-red-600 font-medium">
            -{formatCurrency(info.getValue())}
          </span>
        ),
      }),
    ],
    [t]
  )

  return (
    <div className="space-y-6">
      {/* Season Half Selector */}
      <div className="flex items-center justify-between">
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

        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!activeSeasonHalf}
        >
          <Play className="size-4 mr-1" /> {t('salaries.process')}
        </Button>
      </div>

      {/* Process Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('salaries.process')}</DialogTitle>
            <DialogDescription>{t('salaries.processConfirm')}</DialogDescription>
          </DialogHeader>
          {activeSeasonHalf && (
            <p className="text-sm">
              <strong>{t('fields.seasonHalf')}: </strong>
              {getSeasonHalfLabel(activeSeasonHalf)}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin size-4" /> : t('salaries.process')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results */}
      {lastResult && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">{t('salaries.clubsProcessed')}</p>
              <p className="text-2xl font-bold">{lastResult.clubsProcessed}</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">{t('salaries.totalPaid')}</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(lastResult.totalSalariesPaid)}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3 select-none">{t('salaries.details')}</h3>
            <DataTable<SalaryDetail, any> columns={columns} data={lastResult.details} />
          </div>
        </div>
      )}

      {!lastResult && (
        <p className="text-muted-foreground text-center py-8">{t('salaries.noSalaryData')}</p>
      )}
    </div>
  )
}
