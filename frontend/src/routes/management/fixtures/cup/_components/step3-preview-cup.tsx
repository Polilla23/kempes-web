import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, Trophy, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CupWizardState } from '@/types/fixture'

interface Step3PreviewCupProps {
  wizardState: CupWizardState
  onBack: () => void
}

export function Step3PreviewCup({ wizardState, onBack }: Step3PreviewCupProps) {
  const { t } = useTranslation('fixtures')
  const [isGenerating, setIsGenerating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      // TODO: Implementar llamada al backend para crear la copa
      // const payload = {
      //   numGroups: wizardState.numGroups,
      //   teamsPerGroup: wizardState.teamsPerGroup,
      //   qualifyToGold: wizardState.qualifyToGold,
      //   qualifyToSilver: wizardState.qualifyToSilver,
      //   groupAssignments: wizardState.groupAssignments,
      // }
      // await CupService.createCup(payload)

      // Simulación de llamada al backend
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSuccess(true)
    } catch (err) {
      console.error('Error generating cup:', err)
      setError(t('cup.errorCreating'))
    } finally {
      setIsGenerating(false)
    }
  }

  const totalTeams = wizardState.numGroups * wizardState.teamsPerGroup
  const totalGoldTeams = wizardState.numGroups * wizardState.qualifyToGold
  const totalSilverTeams = wizardState.numGroups * wizardState.qualifyToSilver

  if (success) {
    return (
      <Card className="border-green-500">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">{t('cup.cupCreated')}</h3>
            <p className="text-muted-foreground">
              La copa se ha generado exitosamente con todos los grupos y equipos asignados.
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Crear otra copa</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen de la configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Resumen de la Copa
          </CardTitle>
          <CardDescription>
            Revisa la configuración antes de generar la copa y los fixtures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{wizardState.numGroups}</div>
              <div className="text-sm text-muted-foreground">Grupos</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{totalTeams}</div>
              <div className="text-sm text-muted-foreground">Equipos Totales</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-amber-500">{totalGoldTeams}</div>
              <div className="text-sm text-muted-foreground">Copa de Oro</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-slate-400">{totalSilverTeams}</div>
              <div className="text-sm text-muted-foreground">Copa de Plata</div>
            </div>
          </div>

          <Separator />

          {/* Detalles de clasificación */}
          <div className="space-y-2">
            <h4 className="font-semibold">Clasificación</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500">Oro</Badge>
                <span>
                  Los primeros {wizardState.qualifyToGold} equipos de cada grupo ({totalGoldTeams}{' '}
                  total)
                </span>
              </div>
              {wizardState.qualifyToSilver > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-400">Plata</Badge>
                  <span>
                    Los siguientes {wizardState.qualifyToSilver} equipos de cada grupo (
                    {totalSilverTeams} total)
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grupos y equipos asignados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(wizardState.groupAssignments)
          .sort()
          .map((groupId) => {
            const teams = wizardState.groupAssignments[groupId]

            return (
              <Card key={groupId}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('cup.groupLabel', { letter: groupId })}
                  </CardTitle>
                  <CardDescription>{teams.length} equipos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teams.map((team, index) => (
                      <div
                        key={team.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                      >
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="h-5 w-5 object-contain rounded"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium truncate">{team.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botones de acción */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando Copa...
            </>
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Generar Copa
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
