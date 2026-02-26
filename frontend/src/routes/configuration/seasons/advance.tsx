import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  Save,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { InteractiveStepper } from '@/components/ui/interactive-stepper'
import { SeasonService } from '@/services/season.service'
import type {
  VerifyCompetitionsResponse,
  PreviewMovementsResponse,
  SaveHistoryResponse,
  CreateNextSeasonResponse,
  CompetitionVerification,
  TeamMovement,
} from '@/types'

export const Route = createFileRoute('/configuration/seasons/advance')({
  component: AdvanceSeasonWizard,
})

function AdvanceSeasonWizard() {
  const { t } = useTranslation('seasons')
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)

  // Step data
  const [verifyData, setVerifyData] = useState<VerifyCompetitionsResponse | null>(null)
  const [movementsData, setMovementsData] = useState<PreviewMovementsResponse | null>(null)
  const [historyData, setHistoryData] = useState<SaveHistoryResponse | null>(null)
  const [createData, setCreateData] = useState<CreateNextSeasonResponse | null>(null)

  // Loading states
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoadingMovements, setIsLoadingMovements] = useState(false)
  const [isSavingHistory, setIsSavingHistory] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const steps = [
    { id: 1, label: t('advance.steps.verify.label'), description: t('advance.steps.verify.description') },
    { id: 2, label: t('advance.steps.movements.label'), description: t('advance.steps.movements.description') },
    { id: 3, label: t('advance.steps.history.label'), description: t('advance.steps.history.description') },
    { id: 4, label: t('advance.steps.create.label'), description: t('advance.steps.create.description') },
  ]

  // Step 1: Verify competitions
  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const data = await SeasonService.verifyCompetitions()
      setVerifyData(data)
    } catch {
      toast.error(t('advance.errors.verify'))
    } finally {
      setIsVerifying(false)
    }
  }

  // Step 2: Preview movements
  const handlePreviewMovements = async () => {
    setIsLoadingMovements(true)
    try {
      const data = await SeasonService.previewMovements()
      setMovementsData(data)
    } catch {
      toast.error(t('advance.errors.movements'))
    } finally {
      setIsLoadingMovements(false)
    }
  }

  // Step 3: Save history
  const handleSaveHistory = async () => {
    setIsSavingHistory(true)
    try {
      const data = await SeasonService.saveSeasonHistory()
      setHistoryData(data)
      toast.success(
        data.alreadyExisted ? t('advance.history.alreadySaved') : t('advance.history.saved')
      )
    } catch {
      toast.error(t('advance.errors.history'))
    } finally {
      setIsSavingHistory(false)
    }
  }

  // Step 4: Create next season
  const handleCreateNextSeason = async () => {
    setIsCreating(true)
    try {
      const data = await SeasonService.createNextSeason()
      setCreateData(data)
      toast.success(t('advance.create.success', { number: data.newSeason.number }))
    } catch {
      toast.error(t('advance.errors.create'))
    } finally {
      setIsCreating(false)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    if (step === 1 && !verifyData) handleVerify()
    if (step === 2 && !movementsData) handlePreviewMovements()
  }

  const canAdvance = () => {
    switch (currentStep) {
      case 1:
        return verifyData?.allCompleted === true
      case 2:
        return movementsData !== null
      case 3:
        return historyData !== null
      case 4:
        return createData !== null
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      const next = currentStep + 1
      setCurrentStep(next)
      if (next === 1 && !verifyData) handleVerify()
      if (next === 2 && !movementsData) handlePreviewMovements()
    }
  }

  // Auto-load step 1 data
  if (!verifyData && !isVerifying && currentStep === 1) {
    handleVerify()
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col gap-6 h-full max-w-5xl w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/configuration/seasons/' })}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('advance.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('advance.description')}</p>
          </div>
        </div>

        {/* Stepper */}
        <InteractiveStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
        />

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Step1Verify
              data={verifyData}
              isLoading={isVerifying}
              onRetry={handleVerify}
              t={t}
            />
          )}
          {currentStep === 2 && (
            <Step2Movements
              data={movementsData}
              isLoading={isLoadingMovements}
              t={t}
            />
          )}
          {currentStep === 3 && (
            <Step3History
              data={historyData}
              isLoading={isSavingHistory}
              onSave={handleSaveHistory}
              t={t}
            />
          )}
          {currentStep === 4 && (
            <Step4Create
              data={createData}
              isLoading={isCreating}
              seasonNumber={verifyData?.season?.number}
              onCreate={handleCreateNextSeason}
              onGoToSeasons={() => navigate({ to: '/configuration/seasons/' })}
              t={t}
            />
          )}
        </div>

        {/* Navigation buttons */}
        {!createData && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              {t('advance.steps.verify.label') && 'Back'}
            </Button>
            {currentStep < 4 && (
              <Button onClick={handleNext} disabled={!canAdvance()}>
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// STEP COMPONENTS
// ============================================

function Step1Verify({
  data,
  isLoading,
  onRetry,
  t,
}: {
  data: VerifyCompetitionsResponse | null
  isLoading: boolean
  onRetry: () => void
  t: (key: string, opts?: any) => string
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <Button onClick={onRetry}>{t('advance.verify.title')}</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.allCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {data.allCompleted
              ? t('advance.verify.allComplete')
              : t('advance.verify.hasIncomplete')}
          </CardTitle>
          <CardDescription>
            {t('fields.seasonLabel', { number: data.season.number })}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-2">
        {data.competitions.map((comp) => (
          <CompetitionRow key={comp.id} comp={comp} t={t} />
        ))}
      </div>
    </div>
  )
}

function CompetitionRow({
  comp,
  t,
}: {
  comp: CompetitionVerification
  t: (key: string, opts?: any) => string
}) {
  const progress = comp.totalMatches > 0
    ? Math.round((comp.completedMatches / comp.totalMatches) * 100)
    : 0

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className="font-medium">{comp.name}</span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">
                {t('advance.verify.matches', {
                  completed: comp.completedMatches,
                  total: comp.totalMatches,
                })}
              </span>
              {comp.hasPostSeason && (
                <Badge variant={comp.postSeasonComplete ? 'default' : 'outline'} className="text-xs">
                  {t('advance.verify.postSeason')}: {comp.postSeasonComplete ? t('advance.verify.complete') : t('advance.verify.incomplete')}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  progress === 100 ? 'bg-green-500' : 'bg-primary'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">{progress}%</span>
            {comp.pendingMatches === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Step2Movements({
  data,
  isLoading,
  t,
}: {
  data: PreviewMovementsResponse | null
  isLoading: boolean
  t: (key: string, opts?: any) => string
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  const getMovementIcon = (type: string) => {
    if (type === 'CHAMPION') return <Trophy className="h-4 w-4 text-yellow-500" />
    if (type.includes('PROMOTION')) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (type.includes('RELEGATION')) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getMovementBadgeVariant = (type: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (type === 'CHAMPION') return 'default'
    if (type.includes('PROMOTION')) return 'secondary'
    if (type.includes('RELEGATION')) return 'destructive'
    return 'outline'
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{data.summary.champions}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.champions')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <ArrowUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{data.summary.promotions}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.promotions')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <ArrowDown className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{data.summary.relegations}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.relegations')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Minus className="h-6 w-6 text-gray-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{data.summary.stayed}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.stayed')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="py-0">
          <div className="divide-y">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 py-3 text-sm font-medium text-muted-foreground">
              <span>{t('advance.movements.club')}</span>
              <span>{t('advance.movements.from')}</span>
              <span>{t('advance.movements.to')}</span>
              <span className="w-36 text-center">{t('advance.movements.type')}</span>
              <span className="w-12 text-center">#</span>
            </div>
            {data.movements.map((m, i) => (
              <div
                key={`${m.clubId}-${i}`}
                className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 py-2.5 items-center text-sm"
              >
                <span className="flex items-center gap-2">
                  {getMovementIcon(m.movementType)}
                  <span className="font-medium">{m.clubName}</span>
                </span>
                <span className="text-muted-foreground">{m.fromLeague}</span>
                <span className="text-muted-foreground">{m.toLeague || '-'}</span>
                <span className="w-36 text-center">
                  <Badge variant={getMovementBadgeVariant(m.movementType)} className="text-xs">
                    {t(`advance.movements.movementTypes.${m.movementType}`)}
                  </Badge>
                </span>
                <span className="w-12 text-center text-muted-foreground">{m.finalPosition}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Step3History({
  data,
  isLoading,
  onSave,
  t,
}: {
  data: SaveHistoryResponse | null
  isLoading: boolean
  onSave: () => void
  t: (key: string, opts?: any) => string
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('advance.history.title')}</CardTitle>
          <CardDescription>{t('advance.history.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!data ? (
            <Button onClick={onSave} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('advance.history.saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('advance.history.save')}
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  {data.alreadyExisted
                    ? t('advance.history.alreadySaved')
                    : t('advance.history.saved')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{t('advance.history.movements')}</span>
                  <Badge variant="secondary">{data.movementsSaved}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{t('advance.history.clubHistory')}</span>
                  <Badge variant="secondary">{data.clubHistorySaved}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{t('advance.history.playerStats')}</span>
                  <Badge variant="secondary">{data.playerStatsSaved}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{t('advance.history.coefKempes')}</span>
                  <Badge variant="secondary">{data.coefKempesSaved}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Step4Create({
  data,
  isLoading,
  seasonNumber,
  onCreate,
  onGoToSeasons,
  t,
}: {
  data: CreateNextSeasonResponse | null
  isLoading: boolean
  seasonNumber?: number
  onCreate: () => void
  onGoToSeasons: () => void
  t: (key: string, opts?: any) => string
}) {
  const nextNumber = (seasonNumber || 0) + 1

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('advance.create.title')}</CardTitle>
          <CardDescription>{t('advance.create.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  {t('advance.create.confirm', {
                    current: seasonNumber,
                    next: nextNumber,
                  })}
                </p>
              </div>
              <Button
                onClick={onCreate}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('advance.create.creating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('advance.create.button', { number: nextNumber })}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="py-8">
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold">
                  {t('advance.create.success', { number: data.newSeason.number })}
                </h3>
              </div>
              <Button onClick={onGoToSeasons} variant="outline">
                {t('advance.create.goToSeasons')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvanceSeasonWizard
