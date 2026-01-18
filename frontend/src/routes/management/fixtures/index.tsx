import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Trophy, Users, Loader2, AlertCircle, PlayCircle, Biohazard } from 'lucide-react'
import { SeasonService } from '@/services/season.service'
import CompetitionService from '@/services/competition.service'
import api from '@/services/api'

export const Route = createFileRoute('/management/fixtures/')({
  component: FixturesPage,
})

interface Match {
  id: string
  matchdayOrder: number
  status: 'PENDIENTE' | 'FINALIZADO' | 'CANCELADO'
  homeClubId: string | null
  awayClubId: string | null
  homeClubGoals: number
  awayClubGoals: number
  competitionId: string
  homeClub: {
    id: string
    name: string
    logo: string | null
  } | null
  awayClub: {
    id: string
    name: string
    logo: string | null
  } | null
  competition: {
    id: string
    name: string
    competitionType: {
      id: string
      name: string
      category: string
      hierarchy: number
    }
    season: {
      id: string
      number: number
    }
  }
}

interface MatchesByMatchday {
  matchday: number
  competitionName: string
  matches: Match[]
}

interface CovidPlayer {
  id: string
  name: string
  lastName: string
  overall: number
}

interface CovidData {
  matchId: string
  homeTeamCovids: CovidPlayer[]
  awayTeamCovids: CovidPlayer[]
}

function FixturesPage() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('')
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('')
  const [groupedMatches, setGroupedMatches] = useState<MatchesByMatchday[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [covidDialogOpen, setCovidDialogOpen] = useState(false)
  const [selectedMatchCovids, setSelectedMatchCovids] = useState<CovidData | null>(null)

  const loadSeasons = async () => {
    try {
      const response = await SeasonService.getSeasons()
      setSeasons(response.seasons)
      
      // Auto-seleccionar temporada activa
      const activeSeason = response.seasons.find(s => s.isActive)
      if (activeSeason) {
        setSelectedSeasonId(activeSeason.id)
      }
    } catch (err) {
      console.error('Error loading seasons:', err)
      setError('Error al cargar temporadas')
    }
  }

  const loadCompetitions = async () => {
    if (!selectedSeasonId) return
    
    try {
      const response = await CompetitionService.getCompetitions()
      const allCompetitions = response?.data || []
      const filtered = allCompetitions.filter((c: any) => c.seasonId === selectedSeasonId)
      setCompetitions(filtered)
    } catch (err) {
      console.error('Error loading competitions:', err)
      setError('Error al cargar competiciones')
    }
  }

  const loadMatches = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (selectedCompetitionId) {
        params.append('competitionId', selectedCompetitionId)
      } else if (selectedSeasonId) {
        params.append('seasonId', selectedSeasonId)
      }
      
      const response = await api.get<{ data: Match[] }>(`/api/v1/fixtures?${params.toString()}`)
      const fetchedMatches = response.data?.data || []
      
      // Agrupar por fecha y competición
      groupMatchesByMatchday(fetchedMatches)
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Error al cargar partidos')
    } finally {
      setIsLoading(false)
    }
  }

  const groupMatchesByMatchday = (matchList: Match[]) => {
    const grouped = new Map<string, MatchesByMatchday>()
    
    matchList.forEach(match => {
      const key = `${match.competition.id}-${match.matchdayOrder}`
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          matchday: match.matchdayOrder,
          competitionName: match.competition.name,
          matches: []
        })
      }
      
      grouped.get(key)!.matches.push(match)
    })
    
    setGroupedMatches(Array.from(grouped.values()))
  }

  // Cargar temporadas al montar
  useEffect(() => {
    loadSeasons()
  }, [])

  // Cargar competiciones cuando cambia la temporada
  useEffect(() => {
    if (selectedSeasonId) {
      loadCompetitions()
      setSelectedCompetitionId('') // Reset competition selection
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeasonId])

  // Cargar matches cuando cambia el filtro
  useEffect(() => {
    if (selectedSeasonId || selectedCompetitionId) {
      loadMatches()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeasonId, selectedCompetitionId])

  const handleShowCovids = async (match: Match) => {
    try {
      const response = await api.get<{ data: CovidData }>(`/api/v1/fixtures/${match.id}/covids`)
      const covidData = response.data?.data
      
      if (covidData) {
        setSelectedMatchCovids(covidData)
        setCovidDialogOpen(true)
      }
    } catch (err) {
      console.error('Error loading COVID data:', err)
      setError('Error al cargar datos de COVID')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FINALIZADO':
        return <Badge variant="default">Finalizado</Badge>
      case 'CANCELADO':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Gestión de Fixtures
          </CardTitle>
          <CardDescription>
            Visualiza y gestiona los partidos de tus competiciones
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de Temporada */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Temporada</label>
              <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una temporada" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season.id} value={season.id}>
                      Temporada {season.number} {season.isActive ? '(Activa)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Competición */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Competición</label>
              <Select 
                value={selectedCompetitionId} 
                onValueChange={setSelectedCompetitionId}
                disabled={!selectedSeasonId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las competiciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las competiciones</SelectItem>
                  {competitions.map(comp => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando partidos...</span>
          </CardContent>
        </Card>
      )}

      {/* Matches Display */}
      {!isLoading && groupedMatches.length === 0 && selectedSeasonId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay partidos para los filtros seleccionados</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && groupedMatches.map((group, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              Fecha {group.matchday} - {group.competitionName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.matches.map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    {/* Match Info */}
                    <div className="flex-1 grid grid-cols-3 items-center gap-4">
                      {/* Home Team */}
                      <div className="text-right">
                        <div className="font-semibold">{match.homeClub?.name || 'TBD'}</div>
                      </div>

                      {/* Score/Status */}
                      <div className="text-center">
                        {match.status === 'FINALIZADO' ? (
                          <div className="text-2xl font-bold">
                            {match.homeClubGoals} - {match.awayClubGoals}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {getStatusBadge(match.status)}
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="text-left">
                        <div className="font-semibold">{match.awayClub?.name || 'TBD'}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* COVID Button - Solo para MAYORES */}
                      {match.competition.competitionType.category === 'SENIOR' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowCovids(match)}
                          className="gap-2"
                        >
                          <Biohazard className="h-4 w-4" />
                          COVID
                        </Button>
                      )}

                      {/* Load Events Button */}
                      <Button
                        variant="default"
                        size="sm"
                        disabled={match.status !== 'PENDIENTE'}
                        className="gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Cargar Eventos
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* COVID Dialog */}
      <Dialog open={covidDialogOpen} onOpenChange={setCovidDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Biohazard className="h-5 w-5 text-destructive" />
              Jugadores COVID-19
            </DialogTitle>
            <DialogDescription>
              Jugadores que no pueden jugar este partido por COVID
            </DialogDescription>
          </DialogHeader>
          
          {selectedMatchCovids && (
            <div className="space-y-6">
              {/* Home Team COVIDs */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Equipo Local
                </h3>
                {selectedMatchCovids.homeTeamCovids.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay jugadores con COVID</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jugador</TableHead>
                        <TableHead className="text-center">Overall</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMatchCovids.homeTeamCovids.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            {player.name} {player.lastName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{player.overall}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <Separator />

              {/* Away Team COVIDs */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Equipo Visitante
                </h3>
                {selectedMatchCovids.awayTeamCovids.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay jugadores con COVID</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jugador</TableHead>
                        <TableHead className="text-center">Overall</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMatchCovids.awayTeamCovids.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            {player.name} {player.lastName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{player.overall}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
