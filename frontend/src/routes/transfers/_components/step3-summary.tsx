import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TransferWizardState, WizardStepProps, PlayerPaymentConfig } from '@/types/transfer-wizard'
import { calculateBalance } from '@/types/transfer-wizard'

interface Step3Props extends WizardStepProps {
  activeSeasonNumber: number
}

const PERIOD_LABELS: Record<string, string> = {
  START: 'Inicio',
  MID: 'Mitad',
  END: 'Final',
}

export function Step3Summary({ wizardState, onUpdate }: Step3Props) {
  const { t } = useTranslation('transfers')
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set())

  const balance = calculateBalance(wizardState.playersToSell, wizardState.playersAsPayment)
  const isFreeAgent = wizardState.transferType === 'FREE_AGENT'

  const fmt = (n: number) => `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`

  const handleNotesChange = (notes: string) => {
    onUpdate((prev) => ({ ...prev, notes }))
  }

  const togglePlayer = (playerId: string) => {
    setExpandedPlayers((prev) => {
      const next = new Set(prev)
      if (next.has(playerId)) next.delete(playerId)
      else next.add(playerId)
      return next
    })
  }

  const renderPlayerCard = (player: PlayerPaymentConfig, direction: 'out' | 'in') => {
    const isExpanded = expandedPlayers.has(player.playerId)
    const hasDetails =
      player.paymentType === 'INSTALLMENTS'
        ? player.installments.length > 0
        : player.valuationAmount > 0

    return (
      <div key={player.playerId} className="rounded-lg border overflow-hidden">
        {/* Header row — always visible */}
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 bg-muted/50 hover:bg-muted/70 transition-colors text-left"
          onClick={() => togglePlayer(player.playerId)}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">{player.playerName}</span>
              {player.isKempesita && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] flex-shrink-0">
                  Kempesita
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                OVR: {player.overall ?? '-'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {player.paymentType === 'SINGLE'
                ? `${t('payment.single', 'Pago único')}: ${fmt(player.valuationAmount)}`
                : `${player.numberOfInstallments} ${t('payment.installments', 'cuotas')} — ${fmt(player.valuationAmount)} total`}
            </p>
          </div>
          <span
            className={cn(
              'font-mono font-semibold text-sm flex-shrink-0 mr-1',
              direction === 'out' ? 'text-green-600' : 'text-blue-600',
            )}
          >
            {fmt(player.valuationAmount)}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {/* Expanded payment details */}
        {isExpanded && (
          <div className="px-3 py-2 border-t bg-background space-y-1">
            {!hasDetails ? (
              <p className="text-xs text-muted-foreground italic">
                {t('preview.noPaymentDetails', 'Sin detalles de pago configurados')}
              </p>
            ) : player.paymentType === 'SINGLE' ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t('payment.single', 'Pago único')}
                </span>
                <span className={cn('font-mono font-semibold', direction === 'out' ? 'text-green-600' : 'text-blue-600')}>
                  {fmt(player.valuationAmount)}
                </span>
              </div>
            ) : (
              player.installments.map((inst) => (
                <div
                  key={inst.installmentNumber}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">
                    {t('payment.installment', 'Cuota')} {inst.installmentNumber}
                    {inst.seasonNumber
                      ? ` — ${PERIOD_LABELS[inst.period] ?? inst.period} T${inst.seasonNumber}`
                      : ''}
                  </span>
                  <span className={cn('font-mono font-semibold', direction === 'out' ? 'text-green-600' : 'text-blue-600')}>
                    {fmt(inst.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Clubs — compact with exchange arrows */}
      <div className="flex items-center justify-center gap-6 py-3 px-4 border rounded-lg bg-muted/20">
        {/* Seller */}
        <div className="flex flex-col items-center gap-1">
          {wizardState.sellerClubLogo ? (
            <img
              src={wizardState.sellerClubLogo}
              alt={wizardState.sellerClubName || ''}
              className="h-10 w-10 rounded-full object-cover border-2 border-background shadow"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-medium text-center truncate max-w-[110px]">
            {isFreeAgent
              ? t('wizard.roles.freeAgent', 'Sin club')
              : (wizardState.sellerClubName ?? '—')}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {t('clubsInvolved.sellerClub', 'Vendedor')}
          </span>
        </div>

        <ArrowLeftRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

        {/* Buyer */}
        <div className="flex flex-col items-center gap-1">
          {wizardState.buyerClubLogo ? (
            <img
              src={wizardState.buyerClubLogo}
              alt={wizardState.buyerClubName || ''}
              className="h-10 w-10 rounded-full object-cover border-2 border-background shadow"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm font-medium text-center truncate max-w-[110px]">
            {wizardState.buyerClubName ?? '—'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {t('clubsInvolved.buyerClub', 'Comprador')}
          </span>
        </div>
      </div>

      {/* Players to sell — dynamic, only if non-empty */}
      {wizardState.playersToSell.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>{t('playersPanel.toSell', 'Jugadores a transferir')}</span>
          </div>
          {wizardState.playersToSell.map((p) => renderPlayerCard(p, 'out'))}
        </div>
      )}

      {/* Players as payment — dynamic, only if non-empty */}
      {wizardState.playersAsPayment.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <TrendingDown className="h-4 w-4 text-blue-500" />
            <span>{t('playersPanel.asPayment', 'Jugadores como pago')}</span>
          </div>
          {wizardState.playersAsPayment.map((p) => renderPlayerCard(p, 'in'))}
        </div>
      )}

      {/* Balance bar — compact, no background */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm flex-wrap">
        <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
        <span className="text-muted-foreground text-xs">{t('balance.selling', 'Vendo')}:</span>
        <span className="font-mono font-semibold text-green-600 text-xs">{fmt(balance.selling)}</span>
        <span className="text-muted-foreground mx-1 text-xs">—</span>
        <TrendingDown className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
        <span className="text-muted-foreground text-xs">{t('balance.receiving', 'Recibo')}:</span>
        <span className="font-mono font-semibold text-blue-600 text-xs">{fmt(balance.receiving)}</span>
        <span className="text-muted-foreground mx-1 text-xs">=</span>
        <span
          className={cn(
            'font-mono font-bold text-xs',
            balance.balance > 0
              ? 'text-green-600'
              : balance.balance < 0
                ? 'text-red-500'
                : 'text-muted-foreground',
          )}
        >
          {balance.balance > 0 ? '+' : ''}
          {fmt(balance.balance)}
        </span>
      </div>

      {/* Notes + approval — compact, pinned to bottom */}
      <div className="space-y-2 mt-auto">
        <Textarea
          placeholder={t('preview.notesPlaceholder', 'Notas adicionales...')}
          value={wizardState.notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">
            {t(
              'preview.pendingApproval',
              'Esta transferencia requerirá la aprobación del otro club antes de ejecutarse.',
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
