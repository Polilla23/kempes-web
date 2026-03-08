import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, AlertCircle, Coins, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Player } from '@/types'
import type {
  PlayerPaymentConfig,
  InstallmentConfig,
  SeasonPeriod,
} from '@/types/transfer-wizard'
import {
  generateCorrelativeInstallments,
  MAX_INSTALLMENTS,
  MIN_INSTALLMENTS,
} from '@/types/transfer-wizard'

interface PlayerPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player | null
  onSave: (config: PlayerPaymentConfig) => void
  activeSeasonNumber: number
  selectedPeriod: SeasonPeriod
  existingConfig?: PlayerPaymentConfig // For editing
}

export function PlayerPaymentModal({
  open,
  onOpenChange,
  player,
  onSave,
  activeSeasonNumber,
  selectedPeriod,
  existingConfig,
}: PlayerPaymentModalProps) {
  const { t } = useTranslation('transfers')

  // Form state
  const [valuationAmount, setValuationAmount] = useState<number>(0)
  const [paymentType, setPaymentType] = useState<'SINGLE' | 'INSTALLMENTS'>('SINGLE')
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(2)
  const [installments, setInstallments] = useState<InstallmentConfig[]>([])

  // Initialize form when player changes or modal opens
  useEffect(() => {
    if (open && player) {
      if (existingConfig) {
        // Editing existing config
        setValuationAmount(existingConfig.valuationAmount)
        setPaymentType(existingConfig.paymentType)
        setNumberOfInstallments(existingConfig.numberOfInstallments)
        setInstallments(existingConfig.installments)
      } else {
        // New player - reset form
        setValuationAmount(0)
        setPaymentType('SINGLE')
        setNumberOfInstallments(2)
        setInstallments([])
      }
    }
  }, [open, player, existingConfig])

  // Handle generate installments
  const handleGenerateInstallments = () => {
    const generated = generateCorrelativeInstallments(
      valuationAmount,
      numberOfInstallments,
      selectedPeriod,
      activeSeasonNumber
    )
    setInstallments(generated)
  }

  // Handle installment amount change
  const handleInstallmentAmountChange = (id: string, amount: number) => {
    setInstallments((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, amount } : inst))
    )
  }

  // Handle installment period change
  const handleInstallmentPeriodChange = (id: string, period: SeasonPeriod) => {
    setInstallments((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst
        const periodLabel =
          period === 'START' ? 'Inicio' : period === 'MID' ? 'Mitad' : 'Final'
        return {
          ...inst,
          period,
          dueSeasonHalfLabel: `${periodLabel} T${inst.seasonNumber}`,
        }
      })
    )
  }

  // Handle installment season change
  const handleInstallmentSeasonChange = (id: string, seasonNumber: number) => {
    setInstallments((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst
        const periodLabel =
          inst.period === 'START' ? 'Inicio' : inst.period === 'MID' ? 'Mitad' : 'Final'
        return {
          ...inst,
          seasonNumber,
          dueSeasonHalfLabel: `${periodLabel} T${seasonNumber}`,
        }
      })
    )
  }

  // Calculate sum of installments
  const installmentsSum = installments.reduce((sum, inst) => sum + inst.amount, 0)
  const isSumValid = paymentType === 'SINGLE' || installmentsSum === valuationAmount

  // Handle save
  const handleSave = () => {
    if (!player) return

    const config: PlayerPaymentConfig = {
      playerId: player.id,
      playerName: player.fullName,
      playerPosition: player.position || undefined,
      overall: player.overall,
      salary: player.salary,
      isKempesita: player.isKempesita,
      valuationAmount,
      paymentType,
      numberOfInstallments: paymentType === 'SINGLE' ? 1 : numberOfInstallments,
      installments: paymentType === 'SINGLE' ? [] : installments,
    }

    onSave(config)
    onOpenChange(false)
  }

  if (!player) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {t('paymentModal.title', 'Configurar Pago')}
          </DialogTitle>
          <DialogDescription>
            {/* Player info */}
            <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {player.fullName}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span>OVR: {player.overall || '-'}</span>
                  {player.isKempesita && (
                    <Badge variant="secondary" className="text-xs">
                      K
                    </Badge>
                  )}
                  {player.position && <span>- {player.position}</span>}
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Value input */}
          <div className="space-y-2">
            <Label htmlFor="valuation">{t('paymentModal.value', 'Valor')}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="valuation"
                type="number"
                min={0}
                value={valuationAmount || ''}
                onChange={(e) => setValuationAmount(Number(e.target.value) || 0)}
                className="pl-7 text-right font-mono"
                placeholder="0"
              />
            </div>
          </div>

          {/* Payment type */}
          <div className="space-y-3">
            <Label>{t('paymentModal.paymentType', 'Forma de Pago')}</Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as 'SINGLE' | 'INSTALLMENTS')}
              className="grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="single"
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all',
                  paymentType === 'SINGLE'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-gray-300'
                )}
              >
                <RadioGroupItem value="SINGLE" id="single" className="sr-only" />
                <span className="font-medium">{t('paymentModal.total', 'Total')}</span>
                {paymentType === 'SINGLE' && <Check className="h-4 w-4 text-primary" />}
              </Label>
              <Label
                htmlFor="installments"
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all',
                  paymentType === 'INSTALLMENTS'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-gray-300'
                )}
              >
                <RadioGroupItem value="INSTALLMENTS" id="installments" className="sr-only" />
                <span className="font-medium">
                  {t('paymentModal.installments', 'Cuotas')}
                </span>
                {paymentType === 'INSTALLMENTS' && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </Label>
            </RadioGroup>
          </div>

          {/* Installments configuration */}
          {paymentType === 'INSTALLMENTS' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Number of installments + Generate button */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label>{t('payment.numberOfInstallments', 'Cuotas')}</Label>
                  <Select
                    value={numberOfInstallments.toString()}
                    onValueChange={(v) => setNumberOfInstallments(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: MAX_INSTALLMENTS - MIN_INSTALLMENTS + 1 },
                        (_, i) => MIN_INSTALLMENTS + i
                      ).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateInstallments}
                  disabled={valuationAmount <= 0}
                >
                  {t('paymentModal.generate', 'Generar')}
                </Button>
              </div>

              {/* Installments list */}
              {installments.length > 0 && (
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-3 space-y-3">
                    {installments.map((inst, index) => (
                      <Card key={inst.id} className="border-muted">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="shrink-0">
                              #{inst.installmentNumber}
                            </Badge>
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              {/* Amount */}
                              <Input
                                type="number"
                                min={0}
                                value={inst.amount || ''}
                                onChange={(e) =>
                                  handleInstallmentAmountChange(
                                    inst.id,
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="text-right font-mono text-sm"
                              />
                              {/* Period */}
                              <Select
                                value={inst.period}
                                onValueChange={(v) =>
                                  handleInstallmentPeriodChange(inst.id, v as SeasonPeriod)
                                }
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="START">
                                    {t('periodSelector.start', 'Inicio')}
                                  </SelectItem>
                                  <SelectItem value="MID">
                                    {t('periodSelector.mid', 'Mitad')}
                                  </SelectItem>
                                  <SelectItem value="END">
                                    {t('periodSelector.end', 'Final')}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {/* Season */}
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground">T</span>
                                <Input
                                  type="number"
                                  min={activeSeasonNumber}
                                  value={inst.seasonNumber}
                                  onChange={(e) =>
                                    handleInstallmentSeasonChange(
                                      inst.id,
                                      Number(e.target.value) || activeSeasonNumber
                                    )
                                  }
                                  className="text-center text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Sum validation */}
              {installments.length > 0 && (
                <div
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    isSumValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  )}
                >
                  <span className="text-sm font-medium">
                    {t('paymentModal.sum', 'Suma')}: ${installmentsSum.toLocaleString()} /{' '}
                    {t('installmentsEditor.expected', 'Total')}: $
                    {valuationAmount.toLocaleString()}
                  </span>
                  {isSumValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('paymentModal.cancel', 'Cancelar')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={valuationAmount <= 0 || !isSumValid}
          >
            <Check className="h-4 w-4 mr-2" />
            {t('paymentModal.save', 'Guardar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
