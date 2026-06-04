import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Loader2, Play, Info, Users, DollarSign, BarChart2 } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'
import { SalaryClubRow } from './salary-club-row'
import { formatCurrency } from '@/lib/finance-utils'
import type { SeasonHalf, ProcessSalariesResponse, SalaryProcessingPreview } from '@/types'

interface SalariesTabProps {
  seasonHalves: SeasonHalf[]
  activeSeasonHalf: SeasonHalf | null
  selectedSeasonHalfId: string
  onSeasonHalfChange: (id: string) => void
  onRefresh: () => void
}

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
  const [preview, setPreview] = useState<SalaryProcessingPreview | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [expandedClubs, setExpandedClubs] = useState<Set<string>>(new Set())

  const getSeasonHalfLabel = (half: SeasonHalf) => {
    const halfLabel = half.halfType === 'FIRST_HALF' ? t('labels.firstHalf') : t('labels.secondHalf')
    return half.seasonNumber ? `T${half.seasonNumber} - ${halfLabel}` : halfLabel
  }

  useEffect(() => {
    if (!activeSeasonHalf) return
    const fetchPreview = async () => {
      setIsLoadingPreview(true)
      try {
        const res = await FinanceService.getSalaryProcessingPreview(activeSeasonHalf.id)
        setPreview(res.preview ?? null)
      } catch {
        setPreview(null)
      } finally {
        setIsLoadingPreview(false)
      }
    }
    fetchPreview()
  }, [activeSeasonHalf])

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

  const toggleClub = (clubId: string) => {
    setExpandedClubs((prev) => {
      const next = new Set(prev)
      if (next.has(clubId)) {
        next.delete(clubId)
      } else {
        next.add(clubId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Season Half Selector + Process Button */}
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

        <Button onClick={() => setShowConfirm(true)} disabled={!activeSeasonHalf}>
          <Play className="size-4 mr-1" /> {t('salaries.process')}
        </Button>
      </div>

      {/* Info Banner */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t('salaryPreview.infoBanner')}</AlertDescription>
      </Alert>

      {/* Preview Section */}
      {isLoadingPreview && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {!isLoadingPreview && preview && (
        <div className="space-y-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 rounded-xl border p-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaryPreview.clubsToProcess')}</p>
                <p className="text-2xl font-bold">{preview.clubsToProcess}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border p-4">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaryPreview.totalAmount')}</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(preview.totalSalaryAmount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border p-4">
              <div className="rounded-full bg-muted p-3">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaryPreview.averagePerClub')}</p>
                <p className="text-2xl font-bold">{formatCurrency(preview.averagePerClub)}</p>
              </div>
            </div>
          </div>

          {/* Expandable Club Table */}
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('salaries.clubName')}</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('salaries.players')}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('salaryPreview.grossSalary')}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('salaryPreview.loanAdjustments')}</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('salaryPreview.finalSalary')}</th>
                </tr>
              </thead>
              <tbody>
                {preview.clubs.map((club) => (
                  <SalaryClubRow
                    key={club.clubId}
                    club={club}
                    isExpanded={expandedClubs.has(club.clubId)}
                    onToggle={() => toggleClub(club.clubId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoadingPreview && !preview && !lastResult && (
        <p className="text-muted-foreground text-center py-8">{t('salaries.noSalaryData')}</p>
      )}

      {/* Last Processing Result */}
      {lastResult && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-base font-semibold">{t('salaries.details')}</h3>
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
        </div>
      )}

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
    </div>
  )
}
