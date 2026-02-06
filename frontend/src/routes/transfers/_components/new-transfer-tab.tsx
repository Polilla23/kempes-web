import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserClub } from '@/services/home.service'
import type { Club, Player, SeasonHalf, CreateTransferInput } from '@/types'
import {
  type TransferWizardState,
  type TransferWizardStep,
  INITIAL_WIZARD_STATE,
  TRANSFER_TYPE_CONFIGS,
} from '@/types/transfer-wizard'
import { TransferService } from '@/services/transfer.service'
import { Step1TypeAndClubs } from './step1-type-and-clubs'
import { Step2Details } from './step2-details'
import { Step3Summary } from './step3-summary'

interface NewTransferTabProps {
  userClub: UserClub
  clubs: Club[]
  players: Player[]
  seasonHalves: SeasonHalf[]
  onTransferCreated: () => void
}

// Steps configuration (3 steps now)
const STEPS = [
  { key: 'typeAndClubs', number: 0 },
  { key: 'details', number: 1 },
  { key: 'summary', number: 2 },
] as const

export function NewTransferTab({
  userClub,
  clubs,
  players,
  seasonHalves,
  onTransferCreated,
}: NewTransferTabProps) {
  const { t } = useTranslation('transfers')
  const [wizardState, setWizardState] = useState<TransferWizardState>({
    ...INITIAL_WIZARD_STATE,
    activeSeasonNumber: null, // Will be set from seasonHalves
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get active season number from seasonHalves
  useEffect(() => {
    if (seasonHalves.length > 0) {
      // Find the current/active season half
      const activeHalf = seasonHalves.find((sh) => sh.isActive) || seasonHalves[0]
      if (activeHalf) {
        setWizardState((prev) => ({
          ...prev,
          activeSeasonNumber: activeHalf.season?.seasonNumber || 1,
        }))
      }
    }
  }, [seasonHalves])

  // Get players for seller and buyer clubs
  const sellerPlayers = useMemo(() => {
    if (!wizardState.sellerClubId) return []
    return players.filter((p) => p.actualClubId === wizardState.sellerClubId && p.isActive)
  }, [players, wizardState.sellerClubId])

  const buyerPlayers = useMemo(() => {
    if (!wizardState.buyerClubId) return []
    return players.filter((p) => p.actualClubId === wizardState.buyerClubId && p.isActive)
  }, [players, wizardState.buyerClubId])

  // Validate current step
  const validateStep = (step: TransferWizardStep): boolean => {
    switch (step) {
      case 0: // Type + Clubs
        if (!wizardState.transferType) return false
        const config = TRANSFER_TYPE_CONFIGS[wizardState.transferType]
        // If it requires another club, both must be set
        if (config.requiresOtherClub) {
          return Boolean(wizardState.sellerClubId && wizardState.buyerClubId)
        }
        // For transfers that don't require another club (FREE_AGENT, INACTIVE_STATUS)
        return Boolean(wizardState.userRole)

      case 1: // Details
        // Must have at least one player selected
        return (
          wizardState.playersToSell.length > 0 ||
          wizardState.playersAsPayment.length > 0
        )

      case 2: // Summary
        return true

      default:
        return false
    }
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(wizardState.currentStep)) {
      const nextStep = (wizardState.currentStep + 1) as TransferWizardStep
      if (nextStep <= 2) {
        setWizardState((prev) => ({
          ...prev,
          currentStep: nextStep,
        }))
      }
    }
  }

  // Handle back step
  const handleBack = () => {
    if (wizardState.currentStep > 0) {
      const prevStep = (wizardState.currentStep - 1) as TransferWizardStep
      setWizardState((prev) => ({
        ...prev,
        currentStep: prevStep,
      }))
    }
  }

  // Handle confirm (submit transfer)
  const handleConfirm = async () => {
    if (!wizardState.transferType) return

    // Must have at least one player to sell
    if (wizardState.playersToSell.length === 0) {
      toast.error(t('validation.selectMainPlayer'))
      return
    }

    setIsSubmitting(true)
    try {
      // For each player being sold, create a transfer
      for (const playerConfig of wizardState.playersToSell) {
        const transferInput: CreateTransferInput = {
          type: wizardState.transferType,
          playerId: playerConfig.playerId,
          fromClubId: wizardState.sellerClubId || '',
          toClubId: wizardState.buyerClubId || '',
          initiatorClubId: userClub.id,
          totalAmount: playerConfig.valuationAmount,
          numberOfInstallments:
            playerConfig.paymentType === 'SINGLE' ? 1 : playerConfig.numberOfInstallments,
          notes: wizardState.notes || undefined,
        }

        // Add installments if paying in installments
        if (
          playerConfig.paymentType === 'INSTALLMENTS' &&
          playerConfig.installments.length > 0
        ) {
          // We need to map installments to use dueSeasonHalfId
          // For now, we'll use a placeholder since the backend might need this mapping
          transferInput.installments = playerConfig.installments.map((inst) => ({
            amount: inst.amount,
            dueSeasonHalfId: inst.dueSeasonHalfId || findSeasonHalfId(inst.period, inst.seasonNumber),
          }))
        }

        // Add players as payment
        if (wizardState.playersAsPayment.length > 0) {
          transferInput.playersAsPayment = wizardState.playersAsPayment.map((p) => ({
            playerId: p.playerId,
            valuationAmount: p.valuationAmount,
          }))
        }

        // Handle different transfer types
        if (
          wizardState.transferType === 'LOAN_IN' ||
          wizardState.transferType === 'LOAN_OUT'
        ) {
          const loanInput = {
            playerId: playerConfig.playerId,
            fromClubId: wizardState.sellerClubId || '',
            toClubId: wizardState.buyerClubId || '',
            loanDurationHalves: wizardState.loanDetails?.durationHalves || 2,
            loanFee: wizardState.loanDetails?.loanFee || 0,
            loanSalaryPercentage: wizardState.loanDetails?.salaryPercentage || 50,
            numberOfInstallments:
              playerConfig.paymentType === 'SINGLE'
                ? 1
                : playerConfig.numberOfInstallments,
            notes: wizardState.notes || undefined,
          }
          await TransferService.createLoan(loanInput)
        } else if (wizardState.transferType === 'AUCTION') {
          const auctionInput = {
            playerId: playerConfig.playerId,
            toClubId: wizardState.buyerClubId || '',
            auctionPrice: playerConfig.valuationAmount,
            notes: wizardState.notes || undefined,
          }
          await TransferService.createAuction(auctionInput)
        } else if (wizardState.transferType === 'FREE_AGENT') {
          const freeAgentInput = {
            playerId: playerConfig.playerId,
            toClubId: wizardState.buyerClubId || userClub.id,
            signingFee: playerConfig.valuationAmount,
            freeClubId: wizardState.sellerClubId || '',
            notes: wizardState.notes || undefined,
          }
          await TransferService.signFreeAgent(freeAgentInput)
        } else if (wizardState.transferType === 'INACTIVE_STATUS') {
          await TransferService.markPlayerInactive(playerConfig.playerId, userClub.id)
        } else {
          // Standard transfer (PURCHASE, SALE)
          await TransferService.createTransfer(transferInput)
        }
      }

      toast.success(t('create.success'))

      // Reset wizard and refresh
      setWizardState({
        ...INITIAL_WIZARD_STATE,
        activeSeasonNumber: wizardState.activeSeasonNumber,
      })
      onTransferCreated()
    } catch (error) {
      console.error('Error creating transfer:', error)
      toast.error(t('create.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to find season half ID from period and season number
  const findSeasonHalfId = (period: string, seasonNumber: number): string => {
    // Map period to half type
    const halfType = period === 'START' || period === 'MID' ? 'FIRST_HALF' : 'SECOND_HALF'
    const seasonHalf = seasonHalves.find(
      (sh) => sh.season?.seasonNumber === seasonNumber && sh.type === halfType
    )
    return seasonHalf?.id || ''
  }

  // Reset wizard
  const handleReset = () => {
    setWizardState({
      ...INITIAL_WIZARD_STATE,
      activeSeasonNumber: wizardState.activeSeasonNumber,
    })
  }

  // Current step info
  const currentStepInfo = STEPS[wizardState.currentStep]
  const isFirstStep = wizardState.currentStep === 0
  const isLastStep = wizardState.currentStep === 2
  const canProceed = validateStep(wizardState.currentStep)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          <span>{t('wizard.title')}</span>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => {
              const isActive = idx === wizardState.currentStep
              const isCompleted = idx < wizardState.currentStep

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isCompleted
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Badge
                      variant={isActive ? 'secondary' : 'outline'}
                      className={cn(
                        'h-6 w-6 rounded-full p-0 flex items-center justify-center',
                        isCompleted && 'bg-primary text-primary-foreground'
                      )}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                    </Badge>
                    <span className="hidden sm:inline">
                      {t(`wizard.steps.${step.key}.label`, step.key)}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'w-8 h-0.5 mx-1',
                        idx < wizardState.currentStep ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t(`wizard.steps.${currentStepInfo.key}.description`, currentStepInfo.key)}
        </p>
      </CardHeader>

      <CardContent>
        {/* Step content */}
        <div className="min-h-[450px]">
          {wizardState.currentStep === 0 && (
            <Step1TypeAndClubs
              wizardState={wizardState}
              onUpdate={setWizardState}
              onNext={handleNext}
              userClubId={userClub.id}
              userClubName={userClub.name}
              userClubLogo={userClub.logo || null}
            />
          )}
          {wizardState.currentStep === 1 && (
            <Step2Details
              wizardState={wizardState}
              onUpdate={setWizardState}
              onNext={handleNext}
              onBack={handleBack}
              sellerPlayers={sellerPlayers}
              buyerPlayers={buyerPlayers}
              activeSeasonNumber={wizardState.activeSeasonNumber || 1}
            />
          )}
          {wizardState.currentStep === 2 && (
            <Step3Summary
              wizardState={wizardState}
              onUpdate={setWizardState}
              onNext={handleNext}
              onBack={handleBack}
              activeSeasonNumber={wizardState.activeSeasonNumber || 1}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div>
            {!isFirstStep && (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('wizard.buttons.back')}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {wizardState.currentStep > 0 && (
              <Button variant="ghost" onClick={handleReset} disabled={isSubmitting}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {t('buttons.cancel', 'Reiniciar')}
              </Button>
            )}

            {!isLastStep ? (
              <Button onClick={handleNext} disabled={!canProceed || isSubmitting}>
                {t('wizard.buttons.next')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleConfirm} disabled={isSubmitting || !canProceed}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    {t('wizard.buttons.confirm')}
                  </span>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t('wizard.buttons.confirm')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
