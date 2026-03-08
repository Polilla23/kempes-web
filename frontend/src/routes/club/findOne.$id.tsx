import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { checkAuth } from '../../services/auth-guard'
import { ClubService } from '@/services/club.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Users, History, DollarSign, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/club/findOne/$id')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: ClubProfilePage,
})

function ClubProfilePage() {
  const { id } = Route.useParams()
  const [club, setClub] = useState<any>(null)
  const [squad, setSquad] = useState<any>(null)
  const [titles, setTitles] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [finances, setFinances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('squad')

  // Cargar datos básicos del club + squad (tab por defecto)
  useEffect(() => {
    async function loadData() {
      try {
        const [clubRes, squadRes, titlesRes] = await Promise.all([
          ClubService.getClubById(id),
          ClubService.getClubSquad(id),
          ClubService.getClubTitles(id),
        ])
        setClub(clubRes.club)
        setSquad(squadRes)
        setTitles(titlesRes)
      } catch (err) {
        console.error('Error loading club data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  // Lazy load tabs
  useEffect(() => {
    if (activeTab === 'history' && history.length === 0) {
      ClubService.getClubHistory(id).then(setHistory).catch(console.error)
    }
    if (activeTab === 'finances' && finances.length === 0) {
      ClubService.getClubFinances(id).then(setFinances).catch(console.error)
    }
  }, [activeTab, id, history.length, finances.length])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Club no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-[5%] lg:px-[7%] xl:px-[10%] py-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={club.logo} alt={club.name} />
            <AvatarFallback className="text-2xl">{club.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{club.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {club.isActive ? (
                <Badge variant="default">Activo</Badge>
              ) : (
                <Badge variant="secondary">Inactivo</Badge>
              )}
              {titles && <span className="text-muted-foreground">{titles.total} titulo(s)</span>}
              {squad && (
                <span className="text-muted-foreground">
                  Valor: ${squad.squadValue?.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="squad">
              <Users className="h-4 w-4 mr-1" /> Plantilla
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" /> Historial
            </TabsTrigger>
            <TabsTrigger value="titles">
              <Trophy className="h-4 w-4 mr-1" /> Titulos
            </TabsTrigger>
            <TabsTrigger value="finances">
              <DollarSign className="h-4 w-4 mr-1" /> Finanzas
            </TabsTrigger>
          </TabsList>

          {/* Plantilla */}
          <TabsContent value="squad">
            {squad ? (
              <div className="space-y-6 mt-4">
                {/* Best XI */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mejor XI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {squad.bestXI?.map((p: any) => (
                        <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={p.avatar} />
                            <AvatarFallback className="text-xs">{p.fullName?.split(' ').map((n: string) => n.charAt(0)).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.fullName?.split(' ').slice(-1)[0]}</p>
                            <p className="text-xs text-muted-foreground">{p.overall}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Full squad table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plantilla completa ({squad.players?.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jugador</TableHead>
                          <TableHead className="text-center">Media</TableHead>
                          <TableHead className="text-center">Salario</TableHead>
                          <TableHead className="text-center">Kempesita</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {squad.players?.map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={p.avatar} />
                                  <AvatarFallback className="text-xs">{p.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {p.fullName}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{p.overall}</TableCell>
                            <TableCell className="text-center">${p.salary?.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              {p.isKempesita ? <Badge variant="secondary">Si</Badge> : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
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

          {/* Historial */}
          <TabsContent value="history">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Historial por temporada</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Temp</TableHead>
                        <TableHead>Competicion</TableHead>
                        <TableHead className="text-center">Pos</TableHead>
                        <TableHead className="text-center">Pts</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">G</TableHead>
                        <TableHead className="text-center">E</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">GF</TableHead>
                        <TableHead className="text-center">GC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((h: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">T{h.seasonNumber}</TableCell>
                          <TableCell>{h.competitionName}</TableCell>
                          <TableCell className="text-center font-bold">{h.finalPosition}</TableCell>
                          <TableCell className="text-center">{h.points}</TableCell>
                          <TableCell className="text-center">{h.played}</TableCell>
                          <TableCell className="text-center">{h.won}</TableCell>
                          <TableCell className="text-center">{h.drawn}</TableCell>
                          <TableCell className="text-center">{h.lost}</TableCell>
                          <TableCell className="text-center">{h.goalsFor}</TableCell>
                          <TableCell className="text-center">{h.goalsAgainst}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-6">Sin historial disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Titulos */}
          <TabsContent value="titles">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Titulos ({titles?.total || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {titles?.titles?.length > 0 ? (
                  <div className="space-y-3">
                    {titles.titles.map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{t.competitionName}</p>
                          <p className="text-sm text-muted-foreground">
                            Temporada {t.seasonNumber} - {t.type === 'LEAGUE' ? 'Liga' : 'Copa'}
                          </p>
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

          {/* Finanzas */}
          <TabsContent value="finances">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Historial financiero</CardTitle>
              </CardHeader>
              <CardContent>
                {finances.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Temp</TableHead>
                        <TableHead>Periodo</TableHead>
                        <TableHead className="text-right">Balance inicial</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">Gastos</TableHead>
                        <TableHead className="text-right">Salarios</TableHead>
                        <TableHead className="text-right">Balance final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {finances.map((f: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">T{f.seasonNumber}</TableCell>
                          <TableCell>{f.halfType === 'FIRST_HALF' ? '1ra mitad' : '2da mitad'}</TableCell>
                          <TableCell className="text-right">${f.startingBalance?.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">${f.totalIncome?.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-red-600">${f.totalExpenses?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${f.totalSalaries?.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold">${f.endingBalance?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-6">Sin datos financieros</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
