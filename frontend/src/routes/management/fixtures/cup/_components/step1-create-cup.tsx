import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import type { CupWizardState } from '@/types/fixture'

interface Step1CreateCupProps {
  wizardState: CupWizardState
  onStateChange: (updates: Partial<CupWizardState>) => void
  onNext: () => void
}

export function Step1CreateCup({ wizardState, onStateChange, onNext }: Step1CreateCupProps) {
  const { t } = useTranslation('fixtures')

  const handleNumGroupsChange = (value: string) => {
    const numGroups = parseInt(value) || 2
    onStateChange({ numGroups })
  }

  const handleTeamsPerGroupChange = (value: string) => {
    const teamsPerGroup = parseInt(value) || 2
    onStateChange({ teamsPerGroup })
  }

  const handleQualifyToGoldChange = (value: string) => {
    const qualifyToGold = parseInt(value) || 1
    onStateChange({ qualifyToGold })
  }

  const handleQualifyToSilverChange = (value: string) => {
    const qualifyToSilver = parseInt(value) || 0
    onStateChange({ qualifyToSilver })
  }

  const isValid = () => {
    const { numGroups, teamsPerGroup, qualifyToGold, qualifyToSilver } = wizardState
    
    // Validaciones
    if (numGroups < 2 || numGroups > 6) return false
    if (teamsPerGroup < 2 || teamsPerGroup > 8) return false
    if (qualifyToGold < 1 || qualifyToGold > teamsPerGroup) return false
    if (qualifyToSilver < 0 || qualifyToSilver > teamsPerGroup - qualifyToGold) return false
    if (qualifyToGold + qualifyToSilver > teamsPerGroup) return false

    return true
  }

  const handleSubmit = () => {
    if (isValid()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('cup.title')}</CardTitle>
          <CardDescription>{t('cup.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Número de grupos */}
          <div className="space-y-2">
            <Label htmlFor="numGroups">{t('cup.numGroups')}</Label>
            <Input
              id="numGroups"
              type="number"
              min={2}
              max={6}
              value={wizardState.numGroups}
              onChange={(e) => handleNumGroupsChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {t('cup.validation.minGroups')}
            </p>
          </div>

          {/* Equipos por grupo */}
          <div className="space-y-2">
            <Label htmlFor="teamsPerGroup">{t('cup.teamsPerGroup')}</Label>
            <Input
              id="teamsPerGroup"
              type="number"
              min={2}
              max={8}
              value={wizardState.teamsPerGroup}
              onChange={(e) => handleTeamsPerGroupChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {t('cup.validation.minTeamsPerGroup')}
            </p>
          </div>

          {/* Clasifican a Copa de Oro */}
          <div className="space-y-2">
            <Label htmlFor="qualifyToGold">{t('cup.qualifyToGold')}</Label>
            <Input
              id="qualifyToGold"
              type="number"
              min={1}
              max={wizardState.teamsPerGroup}
              value={wizardState.qualifyToGold}
              onChange={(e) => handleQualifyToGoldChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Equipos que clasificarán a la Copa de Oro (mínimo 1)
            </p>
          </div>

          {/* Clasifican a Copa de Plata */}
          <div className="space-y-2">
            <Label htmlFor="qualifyToSilver">{t('cup.qualifyToSilver')}</Label>
            <Input
              id="qualifyToSilver"
              type="number"
              min={0}
              max={wizardState.teamsPerGroup - wizardState.qualifyToGold}
              value={wizardState.qualifyToSilver}
              onChange={(e) => handleQualifyToSilverChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Equipos que clasificarán a la Copa de Plata (puede ser 0)
            </p>
          </div>

          {/* Botón de continuar */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={!isValid()}>
              {t('cup.createAndContinue')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <strong>Total de equipos:</strong> {wizardState.numGroups * wizardState.teamsPerGroup}
          </p>
          <p className="text-sm">
            <strong>Equipos en Copa de Oro:</strong> {wizardState.numGroups * wizardState.qualifyToGold}
          </p>
          <p className="text-sm">
            <strong>Equipos en Copa de Plata:</strong> {wizardState.numGroups * wizardState.qualifyToSilver}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
