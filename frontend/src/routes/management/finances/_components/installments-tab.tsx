import { useState, useEffect } from 'react'
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
import { Loader2, CreditCard, RefreshCw } from 'lucide-react'
import { TransferService } from '@/services/transfer.service'
import type { Transfer, SeasonHalf, TransferInstallment } from '@/types'

interface InstallmentsTabProps {
  seasonHalves: SeasonHalf[]
  activeSeasonHalf: SeasonHalf | null
  onRefresh: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  DUE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

interface TransferWithInstallments {
  transfer: Transfer
  installments: TransferInstallment[]
}

export function InstallmentsTab({
  seasonHalves,
  activeSeasonHalf,
  onRefresh,
}: InstallmentsTabProps) {
  const { t } = useTranslation('finances')
  const [transfers, setTransfers] = useState<TransferWithInstallments[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPayingId, setIsPayingId] = useState<string | null>(null)
  const [isUpdatingStatuses, setIsUpdatingStatuses] = useState(false)
  const [payConfirm, setPayConfirm] = useState<{
    transferId: string
    installment: TransferInstallment
  } | null>(null)

  const fetchTransfers = async () => {
    setIsLoading(true)
    try {
      // Fetch all transfers that have installments (PURCHASE/SALE types typically)
      const response = await TransferService.getTransfers()
      const allTransfers = response.transfers || []

      // Filter transfers that have installments with DUE, OVERDUE, or PENDING status
      const withInstallments: TransferWithInstallments[] = allTransfers
        .filter((t) => t.installments && t.installments.length > 0)
        .map((t) => ({
          transfer: t,
          installments: t.installments!.sort((a, b) => a.installmentNumber - b.installmentNumber),
        }))
        .filter((t) =>
          t.installments.some((i) => i.status === 'DUE' || i.status === 'OVERDUE' || i.status === 'PENDING')
        )

      setTransfers(withInstallments)
    } catch (error) {
      console.error('Error fetching transfers:', error)
      toast.error('Error loading installments')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

  const handlePay = async () => {
    if (!payConfirm) return
    try {
      setIsPayingId(payConfirm.installment.id)
      await TransferService.payInstallment(payConfirm.transferId, payConfirm.installment.id)
      toast.success(t('installments.paySuccess'))
      setPayConfirm(null)
      await fetchTransfers()
      onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('installments.payError'))
    } finally {
      setIsPayingId(null)
    }
  }

  const handleUpdateStatuses = async () => {
    if (!activeSeasonHalf) return
    try {
      setIsUpdatingStatuses(true)
      const result = await TransferService.updateInstallmentStatuses(activeSeasonHalf.id)
      toast.success(
        t('installments.updateStatusesSuccess', {
          due: result.markedDue,
          overdue: result.markedOverdue,
        })
      )
      await fetchTransfers()
      onRefresh()
    } catch (error) {
      toast.error(t('installments.updateStatusesError'))
    } finally {
      setIsUpdatingStatuses(false)
    }
  }

  const getSeasonHalfLabel = (id: string) => {
    const half = seasonHalves.find((h) => h.id === id)
    if (!half) return id
    const halfLabel = half.halfType === 'FIRST_HALF' ? t('labels.firstHalf') : t('labels.secondHalf')
    return half.seasonNumber ? `T${half.seasonNumber} - ${halfLabel}` : halfLabel
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleUpdateStatuses}
          disabled={isUpdatingStatuses || !activeSeasonHalf}
        >
          {isUpdatingStatuses ? (
            <Loader2 className="animate-spin size-4 mr-1" />
          ) : (
            <RefreshCw className="size-4 mr-1" />
          )}
          {t('installments.updateStatuses')}
        </Button>
      </div>

      {/* Pay Confirmation Dialog */}
      <Dialog open={!!payConfirm} onOpenChange={(open) => !open && setPayConfirm(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('installments.pay')}</DialogTitle>
            <DialogDescription>{t('installments.payConfirm')}</DialogDescription>
          </DialogHeader>
          {payConfirm && (
            <div className="space-y-2 py-2 text-sm">
              <p>
                <strong>{t('installments.installmentNumber')}</strong>
                {payConfirm.installment.installmentNumber}
              </p>
              <p>
                <strong>{t('fields.amount')}: </strong>
                {formatCurrency(payConfirm.installment.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handlePay} disabled={!!isPayingId}>
              {isPayingId ? <Loader2 className="animate-spin size-4" /> : t('installments.pay')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Installments grouped by transfer */}
      {transfers.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">{t('installments.noInstallments')}</p>
      ) : (
        <div className="space-y-4">
          {transfers.map(({ transfer, installments }) => (
            <div key={transfer.id} className="rounded-xl border p-4 space-y-3">
              {/* Transfer Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {transfer.player?.name}
                    </span>
                    <Badge variant="outline">{transfer.type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transfer.fromClub?.name} → {transfer.toClub?.name}
                    <span className="ml-2">
                      ({t('fields.amount')}: {formatCurrency(transfer.totalAmount)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Installments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-2">#</th>
                      <th className="text-left py-2 px-2">{t('fields.amount')}</th>
                      <th className="text-left py-2 px-2">{t('installments.dueDate')}</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-right py-2 px-2">{t('table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((inst) => (
                      <tr key={inst.id} className="border-b last:border-0">
                        <td className="py-2 px-2">{inst.installmentNumber}</td>
                        <td className="py-2 px-2 font-mono">{formatCurrency(inst.amount)}</td>
                        <td className="py-2 px-2">
                          {getSeasonHalfLabel(inst.dueSeasonHalfId)}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[inst.status] || ''}`}
                          >
                            {t(`installments.status.${inst.status}`)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          {(inst.status === 'DUE' || inst.status === 'OVERDUE') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setPayConfirm({
                                  transferId: transfer.id,
                                  installment: inst,
                                })
                              }
                              disabled={!!isPayingId}
                            >
                              <CreditCard className="size-3 mr-1" />
                              {t('installments.pay')}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
