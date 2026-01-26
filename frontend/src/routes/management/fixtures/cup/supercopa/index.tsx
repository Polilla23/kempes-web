import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Crown, ArrowRight, ArrowLeft } from 'lucide-react'
import { ClubService } from '@/services/club.service'
import { SeasonService } from '@/services/season.service'
import { CompetitionTypeService } from '@/services/competition-type.service'
import CompetitionService from '@/services/competition.service'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BracketEditorContainer } from '../_components/bracket-editor'
import type { Club, Season } from '@/types'
import type { EmptyBracketStructure, AvailableTeam, BracketTeamPlacement } from '@/types/bracket-editor'

export const Route = createFileRoute('/management/fixtures/cup/supercopa/')({
  component: SupercupWizard,
})

type WizardStep = 'select-teams' | 'place-teams' | 'success'

function SupercupWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>('select-teams')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clubs, setClubs] = useState<Club[]>([])
  const [activeSeason, setActiveSeason] = useState<Season | null>(null)
  const [superTypeId, setSuperTypeId] = useState<string | null>(null)

  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set())
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

      // Obtener tipo de competicion SUPER_CUP
      const typesResponse = await CompetitionTypeService.getCompetitionTypes()
      const superType = typesResponse.competitionTypes.find((ct) => ct.name === 'SUPER_CUP')
      if (!superType) {
        setError('No se encontro el tipo de competicion Supercopa')
        setLoading(false)
        return
      }
      setSuperTypeId(superType.id)

      // Obtener todos los equipos activos
      const clubsResponse = await ClubService.getClubs()
      const activeClubs = clubsResponse.clubs.filter((c) => c.isActive)
      setClubs(activeClubs)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTeam = (clubId: string) => {
    setSelectedTeamIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(clubId)) {
        newSet.delete(clubId)
      } else {
        if (newSet.size >= 6) {
          setError('Solo puedes seleccionar 6 equipos')
          return prev
        }
        newSet.add(clubId)
      }
      setError(null)
      return newSet
    })
  }

  const handleContinueToPlacement = async () => {
    if (selectedTeamIds.size !== 6) {
      setError('Debes seleccionar exactamente 6 equipos')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Obtener estructura del bracket desde el backend
      const structure = await CompetitionService.getBracketStructure(6)
      setBracketStructure(structure)
      setStep('place-teams')
    } catch (err) {
      console.error('Error getting bracket structure:', err)
      setError('Error al obtener la estructura del bracket')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToSelection = () => {
    setStep('select-teams')
    setBracketStructure(null)
  }

  const handleConfirmPlacements = async (placements: BracketTeamPlacement[]) => {
    if (!activeSeason || !superTypeId) {
      setError('Datos de temporada o tipo de competicion no disponibles')
      return
    }

    try {
      setCreating(true)
      setError(null)

      await CompetitionService.createSupercup({
        seasonId: activeSeason.id,
        competitionTypeId: superTypeId,
        teamPlacements: placements,
      })

      setStep('success')
    } catch (err) {
      console.error('Error creating Supercopa:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la Supercopa')
    } finally {
      setCreating(false)
    }
  }

  // Convertir clubs seleccionados a AvailableTeam
  const availableTeams: AvailableTeam[] = clubs
    .filter((c) => selectedTeamIds.has(c.id))
    .map((c) => ({
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
          <AlertTitle className="text-green-800">Supercopa creada exitosamente</AlertTitle>
          <AlertDescription className="text-green-700">
            Se ha creado la Supercopa con 6 equipos participantes. Los brackets se han generado correctamente.
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
          <Button variant="ghost" onClick={handleBackToSelection} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a seleccion
          </Button>
          <h1 className="text-3xl font-bold mb-2">Supercopa - Posicionar Equipos</h1>
          <p className="text-muted-foreground">
            Arrastra los equipos a las posiciones del bracket. Los BYEs estan predefinidos (1 arriba, 1 abajo).
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
          onCancel={handleBackToSelection}
          isSubmitting={creating}
        />
      </div>
    )
  }

  // Paso 1: Seleccionar equipos
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supercopa</h1>
        <p className="text-muted-foreground">
          Paso 1: Selecciona los 6 equipos que participaran en la Supercopa (Mayores + Kempesitas).
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
        {/* Selector de equipos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Seleccionar Equipos ({selectedTeamIds.size}/6)
            </CardTitle>
            <CardDescription>Marca los 6 equipos que participaran en la Supercopa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clubs.map((club) => {
                const isSelected = selectedTeamIds.has(club.id)
                const isDisabled = !isSelected && selectedTeamIds.size >= 6

                return (
                  <div
                    key={club.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-accent'
                    }`}
                    onClick={() => !isDisabled && handleToggleTeam(club.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => handleToggleTeam(club.id)}
                    />
                    {club.logo && <img src={club.logo} alt={club.name} className="h-8 w-8 object-contain" />}
                    <Label className="cursor-pointer flex-1">{club.name}</Label>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Temporada:</strong> {activeSeason?.number}
            </p>
            <p className="text-sm">
              <strong>Equipos seleccionados:</strong> {selectedTeamIds.size}/6
            </p>
            <p className="text-sm">
              <strong>Formato:</strong> Eliminacion directa (Bracket de 8 con 2 BYEs)
            </p>
          </CardContent>
        </Card>

        {/* Botones de accion */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate({ to: '/management/fixtures/cup' })}>
            Cancelar
          </Button>
          <Button onClick={handleContinueToPlacement} disabled={selectedTeamIds.size !== 6}>
            Continuar a Posicionamiento
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SupercupWizard
