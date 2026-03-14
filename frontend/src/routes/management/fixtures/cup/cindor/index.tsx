import { useState, useEffect, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Users, ArrowRight, ArrowLeft } from 'lucide-react'
import { ClubService } from '@/services/club.service'
import { SeasonService } from '@/services/season.service'
import { CompetitionTypeService } from '@/services/competition-type.service'
import CompetitionService from '@/services/competition.service'
import { BracketEditorContainer } from '../_components/bracket-editor'
import type { Club, Season } from '@/types'
import type { EmptyBracketStructure, AvailableTeam, BracketTeamPlacement } from '@/types/bracket-editor'

export const Route = createFileRoute('/management/fixtures/cup/cindor/')({
  component: CindorCupWizard,
})

type WizardStep = 'preview' | 'place-teams' | 'success'

function CindorCupWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>('preview')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clubs, setClubs] = useState<Club[]>([])
  const [activeSeason, setActiveSeason] = useState<Season | null>(null)
  const [cindorTypeId, setCindorTypeId] = useState<string | null>(null)
  const [bracketStructure, setBracketStructure] = useState<EmptyBracketStructure | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener temporada activa
      const seasonsResponse = await SeasonService.getSeasons()
      const season = seasonsResponse.seasons.find((s) => s.isActive)
      if (!season) {
        setError('No hay temporada activa configurada')
        setLoading(false)
        return
      }
      setActiveSeason(season)

      // Obtener tipo de competicion CINDOR_CUP
      const typesResponse = await CompetitionTypeService.getCompetitionTypes()
      const cindorType = typesResponse.competitionTypes.find((ct) => ct.name === 'CINDOR_CUP' && ct.category === 'KEMPESITA')
      if (!cindorType) {
        setError('No se encontro el tipo de competicion Copa Cindor')
        setLoading(false)
        return
      }
      setCindorTypeId(cindorType.id)

      // Obtener todos los equipos activos
      const clubsResponse = await ClubService.getClubs()
      const activeClubs = clubsResponse.clubs
        .filter((c) => c.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))
      setClubs(activeClubs)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Calcular info del bracket
  const bracketInfo = useMemo(() => {
    const teamCount = clubs.length
    if (teamCount < 2) return null

    let bracketSize = 2
    while (bracketSize < teamCount) {
      bracketSize *= 2
    }
    const byeCount = bracketSize - teamCount
    const byesUpper = Math.ceil(byeCount / 2)
    const byesLower = Math.floor(byeCount / 2)

    return {
      teamCount,
      bracketSize,
      byeCount,
      byesUpper,
      byesLower,
      firstRoundMatches: bracketSize / 2,
    }
  }, [clubs.length])

  const handleContinueToPlacement = async () => {
    if (!bracketInfo || clubs.length < 2) {
      setError('Se necesitan al menos 2 equipos')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Obtener estructura del bracket desde el backend
      const structure = await CompetitionService.getBracketStructure(clubs.length)
      setBracketStructure(structure)
      setStep('place-teams')
    } catch (err) {
      console.error('Error getting bracket structure:', err)
      setError('Error al obtener la estructura del bracket')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPreview = () => {
    setStep('preview')
    setBracketStructure(null)
  }

  const handleConfirmPlacements = async (placements: BracketTeamPlacement[]) => {
    if (!activeSeason || !cindorTypeId) {
      setError('Datos de temporada o tipo de competicion no disponibles')
      return
    }

    try {
      setCreating(true)
      setError(null)

      await CompetitionService.createCindor({
        seasonId: activeSeason.id,
        competitionTypeId: cindorTypeId,
        teamPlacements: placements,
      })

      setStep('success')
    } catch (err) {
      console.error('Error creating Copa Cindor:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la Copa Cindor')
    } finally {
      setCreating(false)
    }
  }

  // Convertir clubs a AvailableTeam
  const availableTeams: AvailableTeam[] = clubs.map((c) => ({
    id: c.id,
    name: c.name,
    logo: c.logo || null,
    isAssigned: false,
  }))

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando datos...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pantalla de exito
  if (step === 'success') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Copa Cindor creada exitosamente</AlertTitle>
          <AlertDescription className="text-green-700">
            Se ha creado la Copa Cindor con {clubs.length} equipos participantes. Los brackets se han generado
            correctamente con distribucion balanceada de BYEs.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate({ to: '/fixtures' })}>Ver Fixtures</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/management/fixtures/cup' })}>
            Crear otra copa
          </Button>
        </div>
      </div>
    )
  }

  // Paso 2: Posicionar equipos en el bracket
  if (step === 'place-teams' && bracketStructure) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBackToPreview} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al resumen
          </Button>
          <h1 className="text-3xl font-bold mb-2">Copa Cindor - Posicionar Equipos</h1>
          <p className="text-muted-foreground">
            Arrastra los equipos a las posiciones del bracket. Los BYEs estan distribuidos balanceadamente (
            {bracketInfo?.byesUpper} arriba, {bracketInfo?.byesLower} abajo).
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <BracketEditorContainer
          structure={bracketStructure}
          teams={availableTeams}
          onConfirm={handleConfirmPlacements}
          onCancel={handleBackToPreview}
          isSubmitting={creating}
        />
      </div>
    )
  }

  // Paso 1: Preview de la copa
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Copa Cindor</h1>
        <p className="text-muted-foreground">
          Eliminacion directa para categoria Kempesitas. Participan todos los equipos activos.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Info de temporada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temporada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Temporada {activeSeason?.number}</p>
          </CardContent>
        </Card>

        {/* Equipos participantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipos Participantes ({clubs.length})
            </CardTitle>
            <CardDescription>Todos los equipos activos participaran en la Copa Cindor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {clubs.map((club) => (
                <div key={club.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  {club.logo && <img src={club.logo} alt={club.name} className="h-6 w-6 object-contain" />}
                  <span className="text-sm truncate">{club.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumen del bracket */}
        {bracketInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estructura del Bracket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Total de equipos:</strong> {bracketInfo.teamCount}
              </p>
              <p className="text-sm">
                <strong>Tamaño del bracket:</strong> {bracketInfo.bracketSize}
              </p>
              <p className="text-sm">
                <strong>BYEs necesarios:</strong> {bracketInfo.byeCount}
                {bracketInfo.byeCount > 0 && (
                  <span className="text-muted-foreground ml-2">
                    ({bracketInfo.byesUpper} en llave superior, {bracketInfo.byesLower} en llave inferior)
                  </span>
                )}
              </p>
              <p className="text-sm">
                <strong>Partidos en primera ronda:</strong> {bracketInfo.firstRoundMatches}
              </p>
              <p className="text-sm">
                <strong>Categoria:</strong> Kempesitas
              </p>
            </CardContent>
          </Card>
        )}

        {/* Botones de accion */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate({ to: '/management/fixtures/cup' })}>
            Cancelar
          </Button>
          <Button onClick={handleContinueToPlacement} disabled={clubs.length < 2}>
            Continuar a Posicionamiento
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CindorCupWizard
