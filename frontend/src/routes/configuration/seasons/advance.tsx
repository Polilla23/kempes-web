import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
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
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InteractiveStepper } from '@/components/ui/interactive-stepper'
import { SeasonService } from '@/services/season.service'
import { cn } from '@/lib/utils'
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

  // Detect available categories
  const categories = useMemo(() => {
    const cats = new Set(data.movements.map(m => m.category))
    return Array.from(cats).sort() // KEMPESITA before SENIOR alphabetically
  }, [data.movements])

  const defaultTab = categories.includes('SENIOR') ? 'SENIOR' : categories[0] || 'SENIOR'

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList>
        {categories.map(cat => (
          <TabsTrigger key={cat} value={cat} className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {cat === 'SENIOR' ? t('advance.movements.mayores') : t('advance.movements.kempesitas')}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map(cat => (
        <TabsContent key={cat} value={cat}>
          <CategoryMovements movements={data.movements} category={cat} t={t} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function CategoryMovements({
  movements: allMovements,
  category,
  t,
}: {
  movements: TeamMovement[]
  category: string
  t: (key: string, opts?: any) => string
}) {
  const { divisions, transfers, summary } = useMemo(() => {
    const categoryMovements = allMovements.filter(m => m.category === category)

    const summary = {
      champions: categoryMovements.filter(m => m.movementType === 'CHAMPION').length,
      promotions: categoryMovements.filter(m => m.movementType.includes('PROMOTION')).length,
      relegations: categoryMovements.filter(m => m.movementType.includes('RELEGATION')).length,
      stayed: categoryMovements.filter(m => m.movementType === 'STAYED').length,
    }

    // Group by fromLeague, sort by league name (LEAGUE_A < LEAGUE_B < ...)
    const divisionMap = new Map<string, TeamMovement[]>()
    categoryMovements.forEach(m => {
      const key = m.fromLeague
      if (!divisionMap.has(key)) divisionMap.set(key, [])
      divisionMap.get(key)!.push(m)
    })

    const divisions = Array.from(divisionMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, teams]) => ({
        name,
        teams: teams.sort((a, b) => a.finalPosition - b.finalPosition),
      }))

    // Build transfers between adjacent divisions
    const transfers: { from: string; to: string; descending: TeamMovement[]; ascending: TeamMovement[] }[] = []
    for (let i = 0; i < divisions.length - 1; i++) {
      const upper = divisions[i]
      const lower = divisions[i + 1]
      transfers.push({
        from: upper.name,
        to: lower.name,
        descending: upper.teams.filter(m => m.movementType.includes('RELEGATION')),
        ascending: lower.teams.filter(m => m.movementType.includes('PROMOTION')),
      })
    }

    return { divisions, transfers, summary }
  }, [allMovements, category])

  const getRowBg = (type: string) => {
    if (type === 'CHAMPION') return 'bg-amber-50 dark:bg-amber-950/20'
    if (type.includes('PROMOTION')) return 'bg-green-50 dark:bg-green-950/20'
    if (type.includes('RELEGATION')) return 'bg-red-50 dark:bg-red-950/20'
    return ''
  }

  const getMovementIcon = (type: string, reason: string) => {
    if (type === 'CHAMPION') return <Trophy className="h-4 w-4 text-yellow-500" />
    if (reason === 'Subcampeón') return <span className="text-sm">🥈</span>
    if (reason.startsWith('3°')) return <span className="text-sm">🥉</span>
    if (type.includes('PROMOTION')) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (type.includes('RELEGATION')) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getBadgeVariant = (type: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (type === 'CHAMPION') return 'default'
    if (type.includes('PROMOTION')) return 'secondary'
    if (type.includes('RELEGATION')) return 'destructive'
    return 'outline'
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{summary.champions}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.champions')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <ArrowUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{summary.promotions}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.promotions')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <ArrowDown className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{summary.relegations}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.relegations')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Minus className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <div className="text-2xl font-bold">{summary.stayed}</div>
            <div className="text-xs text-muted-foreground">{t('advance.movements.stayed')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Division Cards with Transfer Zones */}
      {divisions.map((div, divIdx) => (
        <div key={div.name}>
          {/* Division Card */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-foreground text-background px-4 py-2.5 flex items-center gap-2 text-sm font-semibold">
              <span>⚽</span>
              <span>{div.name}</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                {div.teams.length} {t('advance.movements.teams')}
              </span>
            </div>
            <div className="divide-y">
              {div.teams.map(team => (
                <div
                  key={team.clubId}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm',
                    getRowBg(team.movementType)
                  )}
                >
                  <span className="w-6 text-center text-xs font-semibold text-muted-foreground">
                    {team.finalPosition}
                  </span>
                  <span className="w-5 flex items-center justify-center">
                    {getMovementIcon(team.movementType, team.reason)}
                  </span>
                  <span
                    className={cn(
                      'flex-1 font-medium',
                      team.movementType === 'STAYED' && 'text-muted-foreground'
                    )}
                  >
                    {team.clubName}
                  </span>
                  <Badge variant={getBadgeVariant(team.movementType)} className="text-xs">
                    {t(`advance.movements.movementTypes.${team.movementType}`)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Zone between adjacent divisions */}
          {divIdx < divisions.length - 1 && transfers[divIdx] &&
            (transfers[divIdx].descending.length > 0 || transfers[divIdx].ascending.length > 0) && (
            <div className="bg-gradient-to-b from-red-50 via-background to-green-50 dark:from-red-950/20 dark:via-background dark:to-green-950/20 border-x border-border px-6 py-4 my-0">
              <div className="flex justify-center gap-8 flex-wrap">
                {transfers[divIdx].descending.length > 0 && (
                  <div className="text-center">
                    <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                      ↓ {t('advance.movements.descendTo', { league: transfers[divIdx].to })}
                    </div>
                    <div className="flex gap-3 justify-center">
                      {transfers[divIdx].descending.map(m => (
                        <div
                          key={m.clubId}
                          className="bg-background border-2 border-red-300 dark:border-red-800 rounded-lg px-4 py-2 text-center"
                        >
                          <div className="font-semibold text-sm">{m.clubName}</div>
                          <div className="text-xs text-red-600">
                            {t(`advance.movements.movementTypes.${m.movementType}`)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {transfers[divIdx].ascending.length > 0 && (
                  <div className="text-center">
                    <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                      ↑ {t('advance.movements.ascendTo', { league: transfers[divIdx].from })}
                    </div>
                    <div className="flex gap-3 justify-center">
                      {transfers[divIdx].ascending.map(m => (
                        <div
                          key={m.clubId}
                          className="bg-background border-2 border-green-300 dark:border-green-800 rounded-lg px-4 py-2 text-center"
                        >
                          <div className="font-semibold text-sm">{m.clubName}</div>
                          <div className="text-xs text-green-600">
                            {t(`advance.movements.movementTypes.${m.movementType}`)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
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
