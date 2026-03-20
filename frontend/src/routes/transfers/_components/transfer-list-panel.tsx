import { Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Transfer, TransferType, TransferStatus } from '@/types'

const TYPE_BADGE_CLASSES: Record<TransferType, string> = {
  PURCHASE: 'bg-green-100 text-green-700 border-green-300',
  SALE: 'bg-blue-100 text-blue-700 border-blue-300',
  LOAN_IN: 'bg-purple-100 text-purple-700 border-purple-300',
  LOAN_OUT: 'bg-amber-100 text-amber-700 border-amber-300',
  AUCTION: 'bg-red-100 text-red-700 border-red-300',
  FREE_AGENT: 'bg-teal-100 text-teal-700 border-teal-300',
  INACTIVE_STATUS: 'bg-gray-100 text-gray-700 border-gray-300',
  RETURN_FROM_LOAN: 'bg-slate-100 text-slate-700 border-slate-300',
}

const STATUS_BADGE_CLASSES: Record<TransferStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  ACTIVE: 'bg-green-100 text-green-700 border-green-300',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-300',
  CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  PARTIALLY_PAID: 'bg-orange-100 text-orange-700 border-orange-300',
}

const TYPE_I18N_KEY: Record<TransferType, string> = {
  PURCHASE: 'typeCards.purchase.title',
  SALE: 'typeCards.sale.title',
  LOAN_IN: 'typeCards.loanIn.title',
  LOAN_OUT: 'typeCards.loanOut.title',
  AUCTION: 'typeCards.auction.title',
  FREE_AGENT: 'typeCards.freeAgent.title',
  INACTIVE_STATUS: 'typeCards.inactive.title',
  RETURN_FROM_LOAN: 'typeCards.returnFromLoan.title',
}

function formatAmount(amount: number) {
  return `$${amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

interface TransferListPanelProps {
  transfers: Transfer[]
  selectedId: string | null
  onSelect: (id: string) => void
  isFiltered: boolean
}

export function TransferListPanel({ transfers, selectedId, onSelect, isFiltered }: TransferListPanelProps) {
  const { t } = useTranslation('transfers')

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('list.columns.type')} · {transfers.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex-1 p-0 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[400px]">
        {transfers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground px-4">
            <Inbox className="h-8 w-8 opacity-40" />
            <p className="text-sm text-center">
              {isFiltered ? t('list.emptyFiltered') : t('list.empty')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transfers.map((transfer) => (
              <button
                key={transfer.id}
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                  selectedId === transfer.id && 'bg-muted/70 ring-1 ring-inset ring-primary/30'
                )}
                onClick={() => onSelect(transfer.id)}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold border flex-shrink-0',
                        TYPE_BADGE_CLASSES[transfer.type]
                      )}
                    >
                      {t(TYPE_I18N_KEY[transfer.type])}
                    </span>
                    <span className="text-sm font-medium truncate">{transfer.player?.name ?? '-'}</span>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold border flex-shrink-0',
                      STATUS_BADGE_CLASSES[transfer.status]
                    )}
                  >
                    {t(`statusLabels.${transfer.status}`)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">
                    {transfer.fromClub?.name ?? '—'} → {transfer.toClub?.name ?? '—'}
                  </span>
                  <span className="flex-shrink-0 ml-2 font-medium">{formatAmount(transfer.totalAmount)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{formatDate(transfer.createdAt)}</p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
