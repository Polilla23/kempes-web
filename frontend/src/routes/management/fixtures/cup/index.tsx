import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { InteractiveStepper, type StepItem } from '@/components/ui/interactive-stepper'
import { Step1CreateCup } from './_components/step1-create-cup'
import { Step2TeamAssignmentCup } from './_components/step2-team-assignment-cup'
import { Step3PreviewCup } from './_components/step3-preview-cup'
import type { CupWizardState } from '@/types/fixture'
import { Card } from '@/components/ui/card'

export const Route = createFileRoute('/management/fixtures/cup/')({
  component: CupFixtureWizard,
})

function CupFixtureWizard() {
  const { t } = useTranslation('fixtures')
  const [wizardState, setWizardState] = useState<CupWizardState>({
    currentStep: 1,
    numGroups: 4,
    teamsPerGroup: 4,
    qualifyToGold: 2,
    qualifyToSilver: 1,
    groupAssignments: {},
    availableTeams: [],
    isValid: false,
  })

  const steps: StepItem[] = [
    {
      id: 1,
      label: t('cup.title'),
      description: t('cup.description'),
    },
    {
      id: 2,
      label: t('wizard.steps.assignTeams.label'),
      description: 'Asignar equipos a cada grupo',
    },
    {
      id: 3,
      label: t('wizard.steps.preview.label'),
      description: t('wizard.steps.preview.description'),
    },
  ]

  const handleNext = () => {
    if (validateCurrentStep()) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep + 1) as 1 | 2 | 3,
      }))
    }
  }

  const handleBack = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: (prev.currentStep - 1) as 1 | 2 | 3,
    }))
  }

  const handleStepClick = (stepId: number) => {
    if (stepId < wizardState.currentStep) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: stepId as 1 | 2 | 3,
      }))
    }
  }

  const handleStateChange = (updates: Partial<CupWizardState>) => {
    setWizardState((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const validateCurrentStep = (): boolean => {
    switch (wizardState.currentStep) {
      case 1: {
        return (
          wizardState.numGroups >= 2 &&
          wizardState.teamsPerGroup >= 2 &&
          wizardState.qualifyToGold + wizardState.qualifyToSilver > 0
        )
      }
      case 2: {
        const totalTeamsNeeded = wizardState.numGroups * wizardState.teamsPerGroup
        const totalAssigned = Object.values(wizardState.groupAssignments).reduce(
          (sum, teams) => sum + teams.length,
          0
        )
        return totalAssigned === totalTeamsNeeded
      }
      default:
        return true
    }
  }

  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 1:
        return (
          <Step1CreateCup
            wizardState={wizardState}
            onStateChange={handleStateChange}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <Step2TeamAssignmentCup
            wizardState={wizardState}
            onStateChange={handleStateChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return <Step3PreviewCup wizardState={wizardState} onBack={handleBack} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('wizard.titleCup')}</h1>
        <p className="text-muted-foreground">{t('wizard.subtitleCup')}</p>
      </div>

      <Card className="p-6 mb-8">
        <InteractiveStepper steps={steps} currentStep={wizardState.currentStep} onStepClick={handleStepClick} />
      </Card>

      <div className="mt-8">{renderCurrentStep()}</div>
    </div>
  )
}

export default CupFixtureWizard
