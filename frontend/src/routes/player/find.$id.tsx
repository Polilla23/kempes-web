import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { checkAuth } from '../../services/auth-guard'
import { PlayerService } from '@/services/player.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, TrendingUp, ArrowRightLeft, BarChart3, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/player/find/$id')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: PlayerProfilePage,
})

function PlayerProfilePage() {
  const { id } = Route.useParams()
  const [player, setPlayer] = useState<any>(null)
  const [career, setCareer] = useState<any>(null)
  const [seasonStats, setSeasonStats] = useState<any[]>([])
  const [titles, setTitles] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('career')

  useEffect(() => {
    async function loadData() {
      try {
        const [playerRes, careerRes] = await Promise.all([
          PlayerService.getPlayerById(id),
          PlayerService.getPlayerCareer(id),
        ])
        setPlayer(playerRes.player)
        setCareer(careerRes)
      } catch (err) {
        console.error('Error loading player data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  useEffect(() => {
    if (activeTab === 'season-stats' && seasonStats.length === 0) {
      PlayerService.getPlayerSeasonStats(id).then(setSeasonStats).catch(console.error)
    }
    if (activeTab === 'titles' && titles.length === 0) {
      PlayerService.getPlayerTitles(id).then(setTitles).catch(console.error)
    }
    if (activeTab === 'transfers' && transfers.length === 0) {
      PlayerService.getPlayerTransfers(id).then(setTransfers).catch(console.error)
    }
  }, [activeTab, id, seasonStats.length, titles.length, transfers.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Jugador no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={player.avatar} alt={`${player.name} ${player.lastName}`} />
            <AvatarFallback className="text-2xl">
              {player.name?.charAt(0)}{player.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {player.name} {player.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="outline">OVR {player.overall}</Badge>
              <span className="text-muted-foreground">
                Salario: ${player.salary?.toLocaleString()}
              </span>
              {player.isKempesita && <Badge variant="secondary">Kempesita</Badge>}
              {player.actualClub && (
                <span className="text-muted-foreground">
                  Club: {player.actualClub.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="career">
              <BarChart3 className="h-4 w-4 mr-1" /> Carrera
            </TabsTrigger>
            <TabsTrigger value="season-stats">
              <TrendingUp className="h-4 w-4 mr-1" /> Stats por temporada
            </TabsTrigger>
            <TabsTrigger value="titles">
              <Trophy className="h-4 w-4 mr-1" /> Titulos
            </TabsTrigger>
            <TabsTrigger value="transfers">
              <ArrowRightLeft className="h-4 w-4 mr-1" /> Transferencias
            </TabsTrigger>
          </TabsList>

          {/* Carrera */}
          <TabsContent value="career">
            {career ? (
              <div className="space-y-6 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Carrera por club</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Club</TableHead>
                          <TableHead className="text-center">Temporadas</TableHead>
                          <TableHead className="text-center">PJ</TableHead>
                          <TableHead className="text-center">G</TableHead>
                          <TableHead className="text-center">A</TableHead>
                          <TableHead className="text-center">TA</TableHead>
                          <TableHead className="text-center">TR</TableHead>
                          <TableHead className="text-center">MVP</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {career.careerByClub?.map((c: any) => (
                          <TableRow key={c.club.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={c.club.logo} />
                                  <AvatarFallback className="text-xs">{c.club.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {c.club.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              T{c.fromSeason}{c.toSeason !== c.fromSeason ? `-T${c.toSeason}` : ''}
                            </TableCell>
                            <TableCell className="text-center">{c.totalAppearances}</TableCell>
                            <TableCell className="text-center">{c.totalGoals}</TableCell>
                            <TableCell className="text-center">{c.totalAssists}</TableCell>
                            <TableCell className="text-center">{c.totalYellowCards}</TableCell>
                            <TableCell className="text-center">{c.totalRedCards}</TableCell>
                            <TableCell className="text-center">{c.totalMvps}</TableCell>
                          </TableRow>
                        ))}
                        {/* Totals row */}
                        {career.careerTotals && (
                          <TableRow className="font-bold border-t-2">
                            <TableCell colSpan={2}>TOTALES</TableCell>
                            <TableCell className="text-center">{career.careerTotals.appearances}</TableCell>
                            <TableCell className="text-center">{career.careerTotals.goals}</TableCell>
                            <TableCell className="text-center">{career.careerTotals.assists}</TableCell>
                            <TableCell className="text-center">{career.careerTotals.yellowCards}</TableCell>
                            <TableCell className="text-center">{career.careerTotals.redCards}</TableCell>
                            <TableCell className="text-center">{career.careerTotals.mvps}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>

          {/* Stats por temporada */}
          <TabsContent value="season-stats">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Estadisticas por temporada</CardTitle>
              </CardHeader>
              <CardContent>
                {seasonStats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Temp</TableHead>
                        <TableHead>Competicion</TableHead>
                        <TableHead>Club</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">G</TableHead>
                        <TableHead className="text-center">A</TableHead>
                        <TableHead className="text-center">TA</TableHead>
                        <TableHead className="text-center">TR</TableHead>
                        <TableHead className="text-center">MVP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seasonStats.map((s: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">T{s.seasonNumber}</TableCell>
                          <TableCell>{s.competitionName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={s.club?.logo} />
                                <AvatarFallback className="text-xs">{s.club?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {s.club?.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{s.appearances}</TableCell>
                          <TableCell className="text-center">{s.goals}</TableCell>
                          <TableCell className="text-center">{s.assists}</TableCell>
                          <TableCell className="text-center">{s.yellowCards}</TableCell>
                          <TableCell className="text-center">{s.redCards}</TableCell>
                          <TableCell className="text-center">{s.mvps}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-6">Sin estadisticas disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Titulos */}
          <TabsContent value="titles">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Titulos ganados</CardTitle>
              </CardHeader>
              <CardContent>
                {titles.length > 0 ? (
                  <div className="space-y-3">
                    {titles.map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <div className="flex items-center gap-2">
                          {t.club && (
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={t.club.logo} />
                              <AvatarFallback className="text-xs">{t.club.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <p className="font-medium">{t.competitionName}</p>
                            <p className="text-sm text-muted-foreground">
                              Temporada {t.seasonNumber} - {t.type === 'LEAGUE' ? 'Liga' : 'Copa'}
                              {t.club && ` con ${t.club.name}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">Sin titulos</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transferencias */}
          <TabsContent value="transfers">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Historial de transferencias</CardTitle>
              </CardHeader>
              <CardContent>
                {transfers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>De</TableHead>
                        <TableHead>A</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers.map((t: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {t.date ? new Date(t.date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{t.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {t.fromClub ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={t.fromClub.logo} />
                                  <AvatarFallback className="text-xs">{t.fromClub.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {t.fromClub.name}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {t.toClub ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={t.toClub.logo} />
                                  <AvatarFallback className="text-xs">{t.toClub.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {t.toClub.name}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            ${t.totalAmount?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={t.status === 'COMPLETED' ? 'default' : 'secondary'}>
                              {t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-6">Sin transferencias registradas</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
