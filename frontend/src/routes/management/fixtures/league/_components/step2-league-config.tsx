import { useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Settings } from 'lucide-react'
import type { LeagueWizardState, LeagueConfig } from '@/types/fixture'
import { LeagueConfigForm } from './league-config-form'

interface Step2LeagueConfigProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
  onBack: () => void
}

export function Step2LeagueConfig({ wizardState, onUpdate, onNext, onBack }: Step2LeagueConfigProps) {
  const [currentLeagueIndex, setCurrentLeagueIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const currentCompetition = wizardState.selectedCompetitions[currentLeagueIndex]
  const totalLeagues = wizardState.selectedCompetitions.length
  const progress = ((currentLeagueIndex + 1) / totalLeagues) * 100

  // Simular carga inicial
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  })

  const handleSaveConfig = (config: LeagueConfig) => {
    const updatedConfigs = [...wizardState.leagueConfigs]

    // Buscar si ya existe config para esta liga
    const existingIndex = updatedConfigs.findIndex((c) => c.competitionId === config.competitionId)

    if (existingIndex >= 0) {
      updatedConfigs[existingIndex] = config
    } else {
      updatedConfigs.push(config)
    }

    onUpdate({
      ...wizardState,
      leagueConfigs: updatedConfigs,
    })

    // Si es la última liga, ir al siguiente paso
    if (currentLeagueIndex === totalLeagues - 1) {
      onNext()
    } else {
      // Ir a la siguiente liga
      setCurrentLeagueIndex((prev) => prev + 1)
    }
  }

  const handlePreviousLeague = () => {
    if (currentLeagueIndex > 0) {
      setCurrentLeagueIndex((prev) => prev - 1)
    } else {
      onBack()
    }
  }

  // Obtener configuración existente si ya fue configurada
  const existingConfig = wizardState.leagueConfigs.find((c) => c.competitionId === currentCompetition.id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <Skeleton className="h-7 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Configuración de Ligas
              </CardTitle>
              <CardDescription className="mt-2">
                Configura las reglas para cada liga seleccionada
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {currentLeagueIndex + 1} / {totalLeagues}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Formulario de configuración de la liga actual */}
      <LeagueConfigForm
        competition={currentCompetition}
        existingConfig={existingConfig}
        onSave={handleSaveConfig}
        onBack={handlePreviousLeague}
        isFirst={currentLeagueIndex === 0}
        isLast={currentLeagueIndex === totalLeagues - 1}
      />
    </div>
  )
}
