import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Trophy } from 'lucide-react'
import type { Competition, LeagueWizardState } from '@/types/fixture'
import api from '@/services/api'

interface Step1LeagueSelectorProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
  onBack: () => void
}

export function Step1LeagueSelector({ wizardState, onUpdate, onNext, onBack }: Step1LeagueSelectorProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeagueCompetitions()
  }, [])

  const fetchLeagueCompetitions = async () => {
    try {
      setIsLoading(true)
      // TODO: Ajustar endpoint según tu API
      const response = await api.get<Competition[]>('/api/competitions')

      // Filtrar solo competiciones de tipo LEAGUE y activas
      const leagues =
        response.data?.filter((comp) => comp.competitionType.name === 'LEAGUE' && comp.isActive) || []

      setCompetitions(leagues)
    } catch (error) {
      console.error('Error fetching competitions:', error)
      toast.error('Error al cargar las ligas')
      setCompetitions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleCompetition = (competition: Competition, checked: boolean) => {
    const updatedSelections = checked
      ? [...wizardState.selectedCompetitions, competition]
      : wizardState.selectedCompetitions.filter((c) => c.id !== competition.id)

    onUpdate({
      ...wizardState,
      selectedCompetitions: updatedSelections,
    })
  }

  const isSelected = (competitionId: string) => {
    return wizardState.selectedCompetitions.some((c) => c.id === competitionId)
  }

  const handleContinue = () => {
    if (wizardState.selectedCompetitions.length === 0) {
      toast.error('Selecciona al menos una liga')
      return
    }
    onNext()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Seleccionar Ligas Activas
        </CardTitle>
        <CardDescription>Selecciona una o más ligas para las cuales deseas generar fixtures</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de competiciones */}
        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay ligas activas disponibles</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crea una liga primero en la sección de Competiciones
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all hover:border-primary/50 ${
                  isSelected(competition.id) ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Checkbox
                  id={competition.id}
                  checked={isSelected(competition.id)}
                  onCheckedChange={(checked) => handleToggleCompetition(competition, checked as boolean)}
                />
                <label
                  htmlFor={competition.id}
                  className="flex-1 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{competition.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {competition.competitionType.name} • Season {competition.seasonId}
                    </p>
                  </div>
                  <Badge variant={isSelected(competition.id) ? 'default' : 'secondary'}>
                    {isSelected(competition.id) ? 'Seleccionada' : 'Disponible'}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Resumen y botón */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="space-y-1 text-right">
              <p className="text-sm font-medium">
                Ligas seleccionadas:{' '}
                <span className="text-primary">{wizardState.selectedCompetitions.length}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Total de ligas disponibles: {competitions.length}
              </p>
            </div>
            <Button
              onClick={handleContinue}
              disabled={wizardState.selectedCompetitions.length === 0}
              className="gap-2"
            >
              Continuar
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
