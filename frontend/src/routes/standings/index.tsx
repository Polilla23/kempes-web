import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal, ArrowUp, ArrowDown, Users } from 'lucide-react'
import { checkAuth } from '@/services/auth-guard'
import StandingsService, { type CompetitionStandings, type TeamStanding } from '@/services/standings.service'
import { SeasonService } from '@/services/season.service'

export const Route = createFileRoute('/standings/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: StandingsPage,
})

function StandingsPage() {
  useTranslation('common') // Hook needed for i18n but t not used yet
  const [standings, setStandings] = useState<CompetitionStandings[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null)

  useEffect(() => {
    loadStandings()
  }, [])

  const loadStandings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Primero obtener la temporada activa
      const seasonsResponse = await SeasonService.getSeasons()
      const activeSeason = seasonsResponse.seasons.find((s) => s.isActive)

      if (!activeSeason) {
        setError('No hay temporada activa')
        return
      }

      // Luego obtener standings de esa temporada
      const standingsResponse = await StandingsService.getSeasonStandings(activeSeason.id)
      setStandings(standingsResponse.data)

      // Seleccionar la primera competición por defecto
      if (standingsResponse.data.length > 0) {
        setSelectedCompetition(standingsResponse.data[0].competitionId)
      }
    } catch (err: any) {
      console.error('Error loading standings:', err)
      setError(err.message || 'Error al cargar las posiciones')
    } finally {
      setLoading(false)
    }
  }

  const getZoneColor = (zone?: string | null): string => {
    switch (zone) {
      case 'champion':
        return 'bg-yellow-500/20 border-l-4 border-l-yellow-500'
      case 'promotion':
        return 'bg-green-500/20 border-l-4 border-l-green-500'
      case 'playoff':
      case 'promotion_playoff':
        return 'bg-blue-500/20 border-l-4 border-l-blue-500'
      case 'relegation':
        return 'bg-red-500/20 border-l-4 border-l-red-500'
      default:
        return ''
    }
  }

  const getPositionIcon = (position: number, zone?: string | null): React.ReactNode => {
    if (position === 1 || zone === 'champion') {
      return <Trophy className="h-4 w-4 text-yellow-500" />
    }
    if (zone === 'promotion') {
      return <ArrowUp className="h-4 w-4 text-green-500" />
    }
    if (zone === 'relegation') {
      return <ArrowDown className="h-4 w-4 text-red-500" />
    }
    if (zone === 'playoff' || zone === 'promotion_playoff') {
      return <Medal className="h-4 w-4 text-blue-500" />
    }
    return <span className="w-4">{position}</span>
  }
  
  // Use the functions to prevent TS errors (they'll be used in rendering later)
  void getZoneColor
  void getPositionIcon

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Users className="h-12 w-12 mb-4" />
              <p className="text-lg">No hay competiciones activas</p>
              <p className="text-sm">Las tablas de posiciones aparecerán cuando haya partidos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // selectedStandings will be used when we implement detailed competition view
  const _selectedStandings = standings.find((s) => s.competitionId === selectedCompetition)
  void _selectedStandings

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tabla de Posiciones</h1>
        <p className="text-muted-foreground">
          Temporada {standings[0]?.seasonNumber || 'actual'}
        </p>
      </div>

      <Tabs
        value={selectedCompetition || ''}
        onValueChange={setSelectedCompetition}
        className="space-y-6"
      >
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(standings.length, 4)}, 1fr)` }}>
          {standings.map((competition) => (
            <TabsTrigger key={competition.competitionId} value={competition.competitionId}>
              {competition.competitionName.split(' ')[0]} {/* Muestra solo el primer nombre */}
            </TabsTrigger>
          ))}
        </TabsList>

        {standings.map((competition) => (
          <TabsContent key={competition.competitionId} value={competition.competitionId}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      {competition.competitionName}
                    </CardTitle>
                    <CardDescription>
                      {competition.matchesPlayed} de {competition.matchesTotal} partidos jugados
                      {competition.isComplete && (
                        <Badge variant="secondary" className="ml-2">
                          Finalizado
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StandingsTable standings={competition.standings} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Leyenda */}
      <Card className="mt-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/20 border-l-4 border-l-yellow-500 rounded" />
              <span>Campeón</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 border-l-4 border-l-green-500 rounded" />
              <span>Ascenso directo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border-l-4 border-l-blue-500 rounded" />
              <span>Playoff</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border-l-4 border-l-red-500 rounded" />
              <span>Descenso</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StandingsTableProps {
  standings: TeamStanding[]
}

function StandingsTable({ standings }: StandingsTableProps) {
  const getZoneColor = (zone?: string | null) => {
    switch (zone) {
      case 'champion':
        return 'bg-yellow-500/10'
      case 'promotion':
        return 'bg-green-500/10'
      case 'playoff':
      case 'promotion_playoff':
        return 'bg-blue-500/10'
      case 'relegation':
        return 'bg-red-500/10'
      default:
        return ''
    }
  }

  const getPositionBadge = (position: number, zone?: string | null) => {
    if (zone === 'champion') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{position}</Badge>
    }
    if (zone === 'promotion') {
      return <Badge className="bg-green-500 hover:bg-green-600">{position}</Badge>
    }
    if (zone === 'playoff' || zone === 'promotion_playoff') {
      return <Badge className="bg-blue-500 hover:bg-blue-600">{position}</Badge>
    }
    if (zone === 'relegation') {
      return <Badge className="bg-red-500 hover:bg-red-600">{position}</Badge>
    }
    return <Badge variant="outline">{position}</Badge>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead>Equipo</TableHead>
          <TableHead className="text-center w-12">PJ</TableHead>
          <TableHead className="text-center w-12">G</TableHead>
          <TableHead className="text-center w-12">E</TableHead>
          <TableHead className="text-center w-12">P</TableHead>
          <TableHead className="text-center w-16">GF</TableHead>
          <TableHead className="text-center w-16">GC</TableHead>
          <TableHead className="text-center w-16">DG</TableHead>
          <TableHead className="text-center w-16 font-bold">PTS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((team) => (
          <TableRow key={team.clubId} className={getZoneColor(team.zone)}>
            <TableCell className="text-center">
              {getPositionBadge(team.position, team.zone)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {team.clubLogo && <AvatarImage src={team.clubLogo} alt={team.clubName} />}
                  <AvatarFallback>{team.clubName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{team.clubName}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">{team.played}</TableCell>
            <TableCell className="text-center text-green-600">{team.won}</TableCell>
            <TableCell className="text-center text-yellow-600">{team.drawn}</TableCell>
            <TableCell className="text-center text-red-600">{team.lost}</TableCell>
            <TableCell className="text-center">{team.goalsFor}</TableCell>
            <TableCell className="text-center">{team.goalsAgainst}</TableCell>
            <TableCell className="text-center">
              <span
                className={
                  team.goalDifference > 0
                    ? 'text-green-600'
                    : team.goalDifference < 0
                    ? 'text-red-600'
                    : ''
                }
              >
                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
              </span>
            </TableCell>
            <TableCell className="text-center font-bold text-lg">{team.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
