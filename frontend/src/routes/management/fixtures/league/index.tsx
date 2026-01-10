import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { InteractiveStepper, type StepItem } from '@/components/ui/interactive-stepper'
import { Step0CategoryAndLeagues } from './_components/step0-category-and-leagues'
import { Step1CreateLeaguesUnified } from './_components/step1-create-leagues-unified'
import { Step3TeamAssignment } from './_components/step3-team-assignment'
import { Step4FixturesPreview } from './_components/step4-fixtures-preview'
import type { LeagueWizardState } from '@/types/fixture'
import { Card } from '@/components/ui/card'

export const Route = createFileRoute('/management/fixtures/league/')({
  component: LeagueFixtureWizard,
})

function LeagueFixtureWizard() {
  const { t } = useTranslation('fixtures')
  const [wizardState, setWizardState] = useState<LeagueWizardState>({
    currentStep: 0,
    leagueCreationConfigs: [],
    selectedCompetitions: [],
    leagueConfigs: [],
    teamAssignments: {},
    availableTeams: [],
    isValid: false,
  })

  const steps: StepItem[] = [
    {
      id: 0,
      label: t('wizard.steps.categoryAndLeagues.label'),
      description: t('wizard.steps.categoryAndLeagues.description'),
    },
    {
      id: 1,
      label: t('wizard.steps.createLeagues.label'),
      description: t('wizard.steps.createLeagues.description'),
    },
    {
      id: 2,
      label: t('wizard.steps.assignTeams.label'),
      description: t('wizard.steps.assignTeams.description'),
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
        currentStep: (prev.currentStep + 1) as 0 | 1 | 2 | 3,
      }))
    }
  }

  const handleBack = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: (prev.currentStep - 1) as 0 | 1 | 2 | 3,
    }))
  }

  const handleStepClick = (stepId: number) => {
    // Solo permitir ir hacia atrás (no adelante sin validar)
    if (stepId < wizardState.currentStep) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: stepId as 0 | 1 | 2 | 3,
      }))
    }
  }

  const validateCurrentStep = (): boolean => {
    switch (wizardState.currentStep) {
      case 0:
        // Al menos una liga seleccionada y CompetitionTypes creados
        return (
          (wizardState.selectedLeagues?.length ?? 0) > 0 &&
          (wizardState.createdCompetitionTypes?.length ?? 0) > 0
        )
      case 1:
        // Al menos una liga creada
        return (wizardState.leagueCreationConfigs?.length ?? 0) > 0
      case 2:
        // Todas las ligas deben tener al menos 4 equipos
        return (
          Object.keys(wizardState.teamAssignments).length > 0 &&
          Object.keys(wizardState.teamAssignments).every(
            (leagueId) => wizardState.teamAssignments[leagueId].length >= 4
          )
        )
      default:
        return true
    }
  }

  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 0:
        return (
          <Step0CategoryAndLeagues wizardState={wizardState} onUpdate={setWizardState} onNext={handleNext} />
        )
      case 1:
        return (
          <Step1CreateLeaguesUnified
            wizardState={wizardState}
            onUpdate={setWizardState}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <Step3TeamAssignment
            wizardState={wizardState}
            onUpdate={setWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return <Step4FixturesPreview wizardState={wizardState} onBack={handleBack} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('wizard.titleLeague')}</h1>
        <p className="text-muted-foreground">{t('wizard.subtitleLeague')}</p>
      </div>

      {/* Stepper Horizontal */}
      <div className="mb-6">
        <InteractiveStepper
          steps={steps}
          currentStep={wizardState.currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Contenido del paso actual */}
      <div>{renderCurrentStep()}</div>
    </div>
  )
}

export default LeagueFixtureWizard
