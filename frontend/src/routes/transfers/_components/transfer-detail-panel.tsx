import { MousePointerClick } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Transfer, InstallmentStatus, TransferStatus } from '@/types'

const INSTALLMENT_STATUS_CLASSES: Record<InstallmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  DUE: 'bg-orange-100 text-orange-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

const STATUS_CLASSES: Record<TransferStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-orange-100 text-orange-700',
}

function formatAmount(amount: number) {
  return `$${amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

interface TransferDetailPanelProps {
  transfer: Transfer | null
  isLoading: boolean
}

export function TransferDetailPanel({ transfer, isLoading }: TransferDetailPanelProps) {
  const { t } = useTranslation('transfers')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!transfer) {
    return (
      <Card className="min-h-[400px] max-h-[calc(100vh-320px)] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <MousePointerClick className="h-10 w-10 opacity-30" />
        <p className="text-sm text-center max-w-[200px]">{t('detail.empty')}</p>
      </Card>
    )
  }

  const isLoan = transfer.type === 'LOAN_IN' || transfer.type === 'LOAN_OUT'
  const hasInstallments = transfer.installments && transfer.installments.length > 0
  const hasPlayersAsPayment = transfer.playersAsPayment && transfer.playersAsPayment.length > 0

  return (
    <Card className="overflow-y-auto max-h-[calc(100vh-320px)] min-h-[400px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base">{t('detail.player')}</CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs">
              {transfer.type.replace(/_/g, ' ')}
            </Badge>
            <Badge
              variant="secondary"
              className={cn('text-xs border-0', STATUS_CLASSES[transfer.status])}
            >
              {t(`statusLabels.${transfer.status}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Player */}
        {transfer.player && (
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm font-bold">
                {transfer.player.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{transfer.player.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {transfer.player.position && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    {transfer.player.position}
                  </Badge>
                )}
                {transfer.player.overall != null && (
                  <span className="text-xs font-bold text-primary">{transfer.player.overall}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clubs */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t('detail.clubs')}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={transfer.fromClub?.logo ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {transfer.fromClub?.name?.slice(0, 2).toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">{transfer.fromClub?.name ?? '—'}</span>
            </div>
            <span className="text-muted-foreground font-bold flex-shrink-0">→</span>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="text-sm font-medium truncate text-right">{transfer.toClub?.name ?? '—'}</span>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={transfer.toClub?.logo ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {transfer.toClub?.name?.slice(0, 2).toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t('detail.financial')}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('detail.totalAmount')}</span>
              <span className="font-semibold">{formatAmount(transfer.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('detail.paymentType')}</span>
              <span>
                {transfer.numberOfInstallments > 1 ? t('detail.installments') : t('detail.singlePayment')}
              </span>
            </div>
          </div>

          {hasInstallments && (
            <div className="mt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1 text-muted-foreground font-medium">#</th>
                    <th className="text-right py-1 text-muted-foreground font-medium">{t('detail.totalAmount')}</th>
                    <th className="text-right py-1 text-muted-foreground font-medium">{t('list.columns.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.installments!.map((inst) => (
                    <tr key={inst.id} className="border-b border-border/50">
                      <td className="py-1.5 font-medium">{inst.installmentNumber}</td>
                      <td className="py-1.5 text-right">{formatAmount(inst.amount)}</td>
                      <td className="py-1.5 text-right">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-semibold',
                            INSTALLMENT_STATUS_CLASSES[inst.status]
                          )}
                        >
                          {t(`installmentStatus.${inst.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Players as payment */}
        {hasPlayersAsPayment && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {t('detail.playersAsPayment')}
            </p>
            <div className="space-y-1.5">
              {transfer.playersAsPayment!.map((pp) => (
                <div
                  key={pp.id}
                  className="flex items-center justify-between gap-2 text-sm p-2 bg-muted/40 rounded"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {pp.player?.name?.slice(0, 2).toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{pp.player?.name ?? pp.playerId}</span>
                    {pp.player?.position && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1">
                        {pp.player.position}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium flex-shrink-0">{formatAmount(pp.valuationAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loan details */}
        {isLoan && transfer.loanDurationHalves && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t('detail.loanInfo')}</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('detail.loanDuration')}</span>
                <span>{t('detail.loanDurationHalves', { n: transfer.loanDurationHalves })}</span>
              </div>
              {transfer.loanFee != null && transfer.loanFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('detail.loanFee')}</span>
                  <span>{formatAmount(transfer.loanFee)}</span>
                </div>
              )}
              {transfer.loanSalaryPercentage != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('detail.loanSalary')}</span>
                  <span>{transfer.loanSalaryPercentage}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {transfer.notes && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t('detail.notes')}</p>
            <p className="text-sm text-foreground/80 bg-muted/40 rounded p-2">{transfer.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
