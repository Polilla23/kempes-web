import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ArrowRight,
  Building2,
  User,
  Calendar,
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TransferWizardState, WizardStepProps, PlayerPaymentConfig } from '@/types/transfer-wizard'
import { TRANSFER_TYPE_CONFIGS, calculateBalance } from '@/types/transfer-wizard'

interface Step3Props extends WizardStepProps {
  activeSeasonNumber: number
}

export function Step3Summary({
  wizardState,
  onUpdate,
  onNext,
  onBack,
  activeSeasonNumber,
}: Step3Props) {
  const { t } = useTranslation('transfers')

  // Get transfer type info
  const typeConfig = wizardState.transferType
    ? TRANSFER_TYPE_CONFIGS[wizardState.transferType]
    : null

  // Calculate totals
  const balance = calculateBalance(wizardState.playersToSell, wizardState.playersAsPayment)

  // Collect all installments from all players
  const allInstallments = [
    ...wizardState.playersToSell.flatMap((p) =>
      p.installments.map((inst) => ({
        ...inst,
        playerName: `${p.playerName} ${p.playerLastName}`,
        direction: 'receive' as const, // Seller receives money
      }))
    ),
    ...wizardState.playersAsPayment.flatMap((p) =>
      p.installments.map((inst) => ({
        ...inst,
        playerName: `${p.playerName} ${p.playerLastName}`,
        direction: 'pay' as const, // Buyer pays money
      }))
    ),
  ].sort((a, b) => {
    // Sort by season, then by period
    if (a.seasonNumber !== b.seasonNumber) return a.seasonNumber - b.seasonNumber
    const periodOrder = { START: 0, MID: 1, END: 2 }
    return periodOrder[a.period] - periodOrder[b.period]
  })

  // Handle notes change
  const handleNotesChange = (notes: string) => {
    onUpdate((prev) => ({ ...prev, notes }))
  }

  // Get period label
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'START':
        return t('periodSelector.start', 'Inicio')
      case 'MID':
        return t('periodSelector.mid', 'Mitad')
      case 'END':
        return t('periodSelector.end', 'Final')
      default:
        return period
    }
  }

  // Render player card in summary
  const renderPlayerSummary = (player: PlayerPaymentConfig, direction: 'out' | 'in') => (
    <div
      key={player.playerId}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">
            {player.playerName} {player.playerLastName}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {player.playerPosition && <span>{player.playerPosition}</span>}
            <span>OVR: {player.overall || '-'}</span>
            {player.isKempesita && (
              <Badge variant="secondary" className="text-xs">
                K
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'font-mono font-semibold',
            direction === 'out' ? 'text-green-600' : 'text-blue-600'
          )}
        >
          ${player.valuationAmount.toLocaleString()}
        </p>
        {player.paymentType === 'INSTALLMENTS' && (
          <Badge variant="outline" className="text-xs">
            {player.numberOfInstallments} {t('payment.installments', 'cuotas')}
          </Badge>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header: Clubs with arrow */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-6">
          <div className="flex items-center justify-center gap-8">
            {/* Seller */}
            <div className="flex flex-col items-center gap-2">
              {wizardState.sellerClubLogo ? (
                <img
                  src={wizardState.sellerClubLogo}
                  alt={wizardState.sellerClubName || ''}
                  className="h-16 w-16 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center border-4 border-primary/20 shadow-lg">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <span className="font-semibold text-center">
                {wizardState.sellerClubName}
              </span>
              <Badge variant="outline" className="text-xs">
                {t('clubsInvolved.sellerClub', 'Vendedor')}
              </Badge>
            </div>

            {/* Arrow with players count */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background shadow">
                <span className="text-sm font-medium">
                  {wizardState.playersToSell.length} jugador(es)
                </span>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              {wizardState.playersAsPayment.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background shadow">
                  <ArrowRight className="h-5 w-5 rotate-180 text-blue-500" />
                  <span className="text-sm font-medium">
                    {wizardState.playersAsPayment.length} jugador(es)
                  </span>
                </div>
              )}
            </div>

            {/* Buyer */}
            <div className="flex flex-col items-center gap-2">
              {wizardState.buyerClubLogo ? (
                <img
                  src={wizardState.buyerClubLogo}
                  alt={wizardState.buyerClubName || ''}
                  className="h-16 w-16 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center border-4 border-primary/20 shadow-lg">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <span className="font-semibold text-center">
                {wizardState.buyerClubName}
              </span>
              <Badge variant="outline" className="text-xs">
                {t('clubsInvolved.buyerClub', 'Comprador')}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Transfer info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Players being transferred */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('preview.giving', 'Jugadores Transferidos')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wizardState.playersToSell.length > 0 ? (
              <div className="space-y-3">
                {wizardState.playersToSell.map((player) =>
                  renderPlayerSummary(player, 'out')
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('preview.noPlayersGiven', 'Sin jugadores')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Players as payment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('preview.receiving', 'Jugadores como Pago')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wizardState.playersAsPayment.length > 0 ? (
              <div className="space-y-3">
                {wizardState.playersAsPayment.map((player) =>
                  renderPlayerSummary(player, 'in')
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('preview.noPlayersReceived', 'Sin jugadores')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      {allInstallments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('preview.paymentSchedule', 'Cronograma de Pagos')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {allInstallments.map((inst, index) => (
                  <div
                    key={`${inst.id}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{inst.installmentNumber}</Badge>
                      <div>
                        <p className="text-sm font-medium">{inst.playerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {getPeriodLabel(inst.period)} T{inst.seasonNumber}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'font-mono font-semibold',
                        inst.direction === 'receive' ? 'text-green-600' : 'text-blue-600'
                      )}
                    >
                      {inst.direction === 'receive' ? '+' : '-'}$
                      {inst.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Balance Summary */}
      <Card
        className={cn(
          'border-2',
          balance.balance > 0
            ? 'border-green-200 bg-green-50/50'
            : balance.balance < 0
              ? 'border-red-200 bg-red-50/50'
              : 'border-gray-200'
        )}
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('balance.selling', 'Total Venta')}
              </p>
              <p className="text-xl font-mono font-bold text-green-600">
                ${balance.selling.toLocaleString()}
              </p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('balance.receiving', 'Total Recibido')}
              </p>
              <p className="text-xl font-mono font-bold text-blue-600">
                ${balance.receiving.toLocaleString()}
              </p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('balance.balance', 'Balance Neto')}
              </p>
              <p
                className={cn(
                  'text-xl font-mono font-bold',
                  balance.balance > 0
                    ? 'text-green-600'
                    : balance.balance < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                )}
              >
                {balance.balance > 0 ? '+' : ''}${balance.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('preview.notes', 'Notas')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('preview.notesPlaceholder', 'Agregar notas adicionales...')}
            value={wizardState.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Pending approval warning */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
        <Clock className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">{t('pending.title', 'Pendiente de Aprobación')}</p>
          <p className="text-sm opacity-80">
            {t('preview.pendingApproval', 'Esta transferencia requerirá la aprobación del otro club antes de ejecutarse.')}
          </p>
        </div>
      </div>
    </div>
  )
}
