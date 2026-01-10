import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronRight, Loader2, Trophy, AlertCircle } from 'lucide-react'
import type { LeagueWizardState, CompetitionCategory, CompetitionType } from '@/types/fixture'
import api from '@/services/api'

interface Step0CategoryAndLeaguesProps {
  wizardState: LeagueWizardState
  onUpdate: (state: LeagueWizardState) => void
  onNext: () => void
}

const AVAILABLE_LEAGUES = ['A', 'B', 'C', 'D', 'E'] as const

export function Step0CategoryAndLeagues({ wizardState, onUpdate, onNext }: Step0CategoryAndLeaguesProps) {
  const { t } = useTranslation('fixtures')
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory>(
    wizardState.selectedCategory || 'SENIOR'
  )
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(wizardState.selectedLeagues || [])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleLeague = (letter: string) => {
    setSelectedLeagues((prev) => {
      if (prev.includes(letter)) {
        return prev.filter((l) => l !== letter)
      } else {
        return [...prev, letter].sort()
      }
    })
  }

  const handleNext = async () => {
    if (selectedLeagues.length === 0) {
      setError(t('step0.errors.noLeagues'))
      return
    }

    try {
      setIsCreating(true)
      setError(null)

      console.log('📋 Ligas seleccionadas:', selectedLeagues)
      console.log('📋 Categoría seleccionada:', selectedCategory)

      // Paso 1: Buscar los CompetitionTypes existentes
      const response = await api.get<{ data: CompetitionType[] }>('/api/v1/competition-types')
      const allTypes = response.data.data || []
      console.log('📦 Todos los CompetitionTypes:', allTypes)

      // Paso 2: Identificar cuáles existen y cuáles faltan
      const existingTypesMap = new Map<string, CompetitionType>()
      const missingLeagues: string[] = []

      for (const letter of selectedLeagues) {
        const typeName = `LEAGUE_${letter}`
        const existing = allTypes.find(
          (ct: CompetitionType) => ct.name === typeName && ct.category === selectedCategory
        )

        if (existing) {
          existingTypesMap.set(letter, existing)
          console.log(`✅ Encontrado: ${typeName} (${selectedCategory})`)
        } else {
          missingLeagues.push(letter)
          console.log(`❌ Faltante: ${typeName} (${selectedCategory})`)
        }
      }

      // Paso 3: Crear los CompetitionTypes que faltan
      if (missingLeagues.length > 0) {
        console.log('📝 Creando CompetitionTypes faltantes:', missingLeagues)

        for (const letter of missingLeagues) {
          const hierarchy = selectedLeagues.indexOf(letter) + 1
          console.log(`Creando LEAGUE_${letter} con hierarchy: ${hierarchy}`)

          const createResponse = await api.post<{ data: CompetitionType; message: string }>(
            '/api/v1/competition-types',
            {
              name: `LEAGUE_${letter}`,
              category: selectedCategory,
              format: 'LEAGUE',
              hierarchy,
            }
          )

          const createdType = createResponse.data.data
          existingTypesMap.set(letter, createdType)
          console.log('✅ CompetitionType creado:', createdType)
        }
      }

      // Paso 4: Ordenar según el orden de selectedLeagues
      const orderedTypes: CompetitionType[] = []
      for (const letter of selectedLeagues) {
        const type = existingTypesMap.get(letter)
        if (type) {
          orderedTypes.push(type)
        }
      }

      console.log('🎯 CompetitionTypes finales (cantidad: ' + orderedTypes.length + '):', orderedTypes)

      // Validar que tengamos todos los tipos necesarios
      if (orderedTypes.length !== selectedLeagues.length) {
        throw new Error(
          `Error: Se esperaban ${selectedLeagues.length} tipos de competición pero solo se obtuvieron ${orderedTypes.length}`
        )
      }

      // Actualizar el wizard state
      onUpdate({
        ...wizardState,
        selectedCategory,
        selectedLeagues,
        createdCompetitionTypes: orderedTypes,
        competitionCategory: selectedCategory,
      })

      // Mostrar mensaje de éxito
      console.log('✅ CompetitionTypes gestionados correctamente')

      // Pasar automáticamente al siguiente paso
      setTimeout(() => {
        onNext()
      }, 100)
    } catch (err: any) {
      console.error('❌ Error managing CompetitionTypes:', err)
      const errorMsg =
        err.message || err.response?.data?.message || 'Error al gestionar los tipos de competición'
      setError(errorMsg)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('step0.title')}</CardTitle>
          <CardDescription>{t('step0.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de Categoría */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('step0.category.label')}</label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={selectedCategory === 'SENIOR' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('SENIOR')}
                className="flex-1"
              >
                <Trophy className="h-4 w-4 mr-2" />
                {t('step0.category.senior')}
              </Button>
              <Button
                type="button"
                variant={selectedCategory === 'KEMPESITA' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('KEMPESITA')}
                className="flex-1"
              >
                <Trophy className="h-4 w-4 mr-2" />
                {t('step0.category.kempesita')}
              </Button>
            </div>
          </div>

          {/* Selección de Ligas */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('step0.leagues.label')}</label>
            <p className="text-sm text-muted-foreground">{t('step0.leagues.description')}</p>
            <div className="grid grid-cols-5 gap-3">
              {AVAILABLE_LEAGUES.map((letter) => (
                <Button
                  key={letter}
                  type="button"
                  variant={selectedLeagues.includes(letter) ? 'default' : 'outline'}
                  onClick={() => toggleLeague(letter)}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <span className="text-2xl font-bold">Liga {letter}</span>
                  {selectedLeagues.includes(letter) && (
                    <Badge variant="secondary" className="mt-2">
                      {t('step0.leagues.selected')}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Resumen - siempre visible para evitar cambios de tamaño */}
          <Alert variant={selectedLeagues.length > 0 ? 'default' : 'default'}>
            <Trophy className="h-4 w-4" />
            <AlertDescription className="min-h-[48px] flex items-center">
              {selectedLeagues.length > 0 ? (
                <>
                  {t('step0.summary.willCreate', { count: selectedLeagues.length })}{' '}
                  <strong>{selectedLeagues.map((l) => `Liga ${l}`).join(', ')}</strong>{' '}
                  {t('step0.summary.inCategory')} <strong>{selectedCategory}</strong>
                </>
              ) : (
                <span className="text-muted-foreground">{t('step0.summary.selectLeagues')}</span>
              )}
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="button"
            onClick={handleNext}
            disabled={isCreating || selectedLeagues.length === 0}
            className="gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('step0.buttons.creating')}
              </>
            ) : (
              <>
                {t('step0.buttons.next')}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
