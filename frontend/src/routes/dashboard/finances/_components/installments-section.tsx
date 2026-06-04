import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/finance-utils'
import type { Transfer, InstallmentStatus } from '@/types'

const STATUS_CLASSES: Record<InstallmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  DUE: 'bg-orange-100 text-orange-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<InstallmentStatus, string> = {
  PENDING: 'Pendiente',
  DUE: 'A pagar',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
}

interface InstallmentsSectionProps {
  transfers: Transfer[]
  direction: 'receivable' | 'payable'
  userClubId: string
}

export function InstallmentsSection({ transfers, direction, userClubId }: InstallmentsSectionProps) {
  const pendingInstallments = transfers.flatMap((tr) => {
    const isReceivable = direction === 'receivable'
      ? tr.fromClubId === userClubId
      : tr.toClubId === userClubId

    if (!isReceivable) return []

    return (tr.installments ?? [])
      .filter((inst) => inst.status !== 'PAID')
      .map((inst) => ({
        inst,
        transfer: tr,
        counterparty: direction === 'receivable' ? tr.toClub : tr.fromClub,
      }))
  })

  if (pendingInstallments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {direction === 'receivable' ? 'Sin cuotas pendientes por cobrar' : 'Sin cuotas pendientes por pagar'}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {pendingInstallments.map(({ inst, transfer, counterparty }) => (
        <div
          key={inst.id}
          className="flex items-center justify-between gap-3 p-3 rounded-lg border text-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{transfer.player?.fullName ?? '—'}</p>
            <p className="text-xs text-muted-foreground">
              {counterparty?.name ?? '—'} · Cuota {inst.installmentNumber}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-mono font-semibold text-sm">{formatCurrency(inst.amount)}</span>
            <span
              className={cn('px-2 py-0.5 rounded text-[10px] font-semibold', STATUS_CLASSES[inst.status])}
            >
              {STATUS_LABELS[inst.status]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
