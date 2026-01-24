import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Crown, X } from 'lucide-react'
import { ClubService } from '@/services/club.service'
import { SeasonService } from '@/services/season.service'
import { CompetitionTypeService } from '@/services/competition-type.service'
import CompetitionService from '@/services/competition.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Club, Season } from '@/types'

export const Route = createFileRoute('/management/fixtures/cup/supercopa/')({
  component: SupercupWizard,
})

function SupercupWizard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [clubs, setClubs] = useState<Club[]>([])
  const [activeSeason, setActiveSeason] = useState<Season | null>(null)
  const [superTypeId, setSuperTypeId] = useState<string | null>(null)

  const [selectedTeams, setSelectedTeams] = useState<Club[]>([])

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

  const handleSelectTeam = (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId)
    if (!club) return

    if (selectedTeams.length >= 6) {
      setError('Ya tienes 6 equipos seleccionados')
      return
    }

    if (selectedTeams.find((t) => t.id === clubId)) {
      setError('Este equipo ya esta seleccionado')
      return
    }

    setSelectedTeams([...selectedTeams, club])
    setError(null)
  }

  const handleRemoveTeam = (clubId: string) => {
    setSelectedTeams(selectedTeams.filter((t) => t.id !== clubId))
  }

  const handleCreate = async () => {
    if (!activeSeason || !superTypeId || selectedTeams.length !== 6) {
      setError('Debes seleccionar exactamente 6 equipos')
      return
    }

    try {
      setCreating(true)
      setError(null)

      // Crear la competicion (los fixtures se generan automaticamente en el backend)
      const competitionRules = {
        type: 'SUPER_CUP',
        activeSeason: activeSeason,
        // Sin competitionCategory - la Supercopa es mixta (Mayores + Kempesitas)
        competitionType: { id: superTypeId, name: 'SUPER_CUP', format: 'CUP' },
        teamIds: selectedTeams.map((c) => c.id),
      }

      const competitionResponse = await CompetitionService.createCompetition(competitionRules)
      console.log('Competition response:', competitionResponse)

      if (!competitionResponse.competitions || competitionResponse.competitions.length === 0) {
        console.error('Empty competitions response:', competitionResponse)
        throw new Error('No se pudo crear la competicion')
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error creating Supercopa:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la Supercopa')
    } finally {
      setCreating(false)
    }
  }

  const availableTeams = clubs.filter((c) => !selectedTeams.find((t) => t.id === c.id))

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando datos...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Supercopa creada exitosamente</AlertTitle>
          <AlertDescription className="text-green-700">
            Se ha creado la Supercopa con 6 equipos participantes.
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supercopa</h1>
        <p className="text-muted-foreground">
          Eliminacion directa con 6 equipos seleccionados manualmente. Participan Mayores y Kempesitas juntos.
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
              Seleccionar Equipos ({selectedTeams.length}/6)
            </CardTitle>
            <CardDescription>Elige exactamente 6 equipos para la Supercopa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Equipos seleccionados */}
            <div>
              <Label className="text-sm font-medium">Equipos seleccionados:</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTeams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay equipos seleccionados</p>
                ) : (
                  selectedTeams.map((club) => (
                    <div
                      key={club.id}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full"
                    >
                      {club.logo && <img src={club.logo} alt={club.name} className="h-5 w-5 object-contain" />}
                      <span className="text-sm">{club.name}</span>
                      <button
                        onClick={() => handleRemoveTeam(club.id)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selector de equipo */}
            {selectedTeams.length < 6 && (
              <div>
                <Label className="text-sm font-medium">Agregar equipo:</Label>
                <Select onValueChange={handleSelectTeam}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona un equipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        <div className="flex items-center gap-2">
                          {club.logo && <img src={club.logo} alt={club.name} className="h-5 w-5 object-contain" />}
                          <span>{club.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              <strong>Equipos:</strong> {selectedTeams.length}/6
            </p>
            <p className="text-sm">
              <strong>Formato:</strong> Eliminacion directa (Mixta: Mayores + Kempesitas)
            </p>
          </CardContent>
        </Card>

        {/* Botones de accion */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate({ to: '/management/fixtures/cup' })}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating || selectedTeams.length !== 6}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Supercopa'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SupercupWizard
