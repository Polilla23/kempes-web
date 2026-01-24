import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { ClubService } from '@/services/club.service'
import { SeasonService } from '@/services/season.service'
import { CompetitionTypeService } from '@/services/competition-type.service'
import CompetitionService from '@/services/competition.service'
import type { Club, Season } from '@/types'

export const Route = createFileRoute('/management/fixtures/cup/cindor/')({
  component: CindorCupWizard,
})

function CindorCupWizard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [clubs, setClubs] = useState<Club[]>([])
  const [activeSeason, setActiveSeason] = useState<Season | null>(null)
  const [cindorTypeId, setCindorTypeId] = useState<string | null>(null)

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
      const cindorType = typesResponse.competitionTypes.find((ct) => ct.name === 'CINDOR_CUP')
      if (!cindorType) {
        setError('No se encontro el tipo de competicion Copa Cindor')
        setLoading(false)
        return
      }
      setCindorTypeId(cindorType.id)

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

  const handleCreate = async () => {
    if (!activeSeason || !cindorTypeId || clubs.length < 2) {
      setError('Faltan datos para crear la copa')
      return
    }

    try {
      setCreating(true)
      setError(null)

      // Crear la competicion (los fixtures se generan automaticamente en el backend)
      const competitionRules = {
        type: 'CINDOR_CUP',
        activeSeason: activeSeason,
        competitionCategory: 'KEMPESITA',
        competitionType: { id: cindorTypeId, name: 'CINDOR_CUP', format: 'CUP', category: 'KEMPESITA' },
        teamIds: clubs.map((c) => c.id),
      }

      const competitionResponse = await CompetitionService.createCompetition(competitionRules)
      console.log('Competition response:', competitionResponse)

      if (!competitionResponse.competitions || competitionResponse.competitions.length === 0) {
        console.error('Empty competitions response:', competitionResponse)
        throw new Error('No se pudo crear la competicion')
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error creating Copa Cindor:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la Copa Cindor')
    } finally {
      setCreating(false)
    }
  }

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
          <AlertTitle className="text-green-800">Copa Cindor creada exitosamente</AlertTitle>
          <AlertDescription className="text-green-700">
            Se ha creado la Copa Cindor con {clubs.length} equipos participantes.
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen del Bracket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>Total de equipos:</strong> {clubs.length}
            </p>
            <p className="text-sm">
              <strong>Formato:</strong> Eliminacion directa
            </p>
            <p className="text-sm">
              <strong>Categoria:</strong> Kempesitas
            </p>
          </CardContent>
        </Card>

        {/* Botones de accion */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate({ to: '/management/fixtures/cup' })}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating || clubs.length < 2}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Copa Cindor'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CindorCupWizard
