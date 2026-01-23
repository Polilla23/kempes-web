"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Sparkles, Shield, Award, TrendingUp } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const topScorers = [
  { rank: 1, player: "Erling Haaland", slug: "erling-haaland", team: "Man City", teamSlug: "man-city", manager: "BlueMoon_UK", goals: 28, matches: 23, avg: 1.22, penalties: 4 },
  { rank: 2, player: "Kylian Mbappé", slug: "kylian-mbappe", team: "Real Madrid", teamSlug: "real-madrid", manager: "CR7_Legend", goals: 24, matches: 22, avg: 1.09, penalties: 2 },
  { rank: 3, player: "Harry Kane", slug: "harry-kane", team: "Bayern", teamSlug: "bayern", manager: "MiaSanMia", goals: 22, matches: 21, avg: 1.05, penalties: 5 },
  { rank: 4, player: "Victor Osimhen", slug: "victor-osimhen", team: "Napoli", teamSlug: "napoli", manager: "AzzurriKing", goals: 21, matches: 23, avg: 0.91, penalties: 3 },
  { rank: 5, player: "Mohamed Salah", slug: "mohamed-salah", team: "Liverpool", teamSlug: "liverpool", manager: "YNWA_Steve", goals: 19, matches: 22, avg: 0.86, penalties: 4 },
  { rank: 6, player: "Vinicius Jr", slug: "vinicius-jr", team: "Real Madrid", teamSlug: "real-madrid", manager: "CR7_Legend", goals: 18, matches: 23, avg: 0.78, penalties: 0 },
  { rank: 7, player: "Marcus Rashford", slug: "marcus-rashford", team: "Man United", teamSlug: "man-united", manager: "RedDevil99", goals: 17, matches: 22, avg: 0.77, penalties: 2 },
  { rank: 8, player: "Lautaro Martínez", slug: "lautaro-martinez", team: "Inter", teamSlug: "inter", manager: "NerazzurriKing", goals: 16, matches: 21, avg: 0.76, penalties: 3 },
]

const topAssists = [
  { rank: 1, player: "Kevin De Bruyne", slug: "kevin-de-bruyne", team: "Man City", teamSlug: "man-city", manager: "BlueMoon_UK", assists: 16, matches: 20, keyPasses: 89 },
  { rank: 2, player: "Bruno Fernandes", slug: "bruno-fernandes", team: "Man United", teamSlug: "man-united", manager: "RedDevil99", assists: 12, matches: 23, keyPasses: 76 },
  { rank: 3, player: "Mohamed Salah", slug: "mohamed-salah", team: "Liverpool", teamSlug: "liverpool", manager: "YNWA_Steve", assists: 10, matches: 22, keyPasses: 65 },
  { rank: 4, player: "Bukayo Saka", slug: "bukayo-saka", team: "Arsenal", teamSlug: "arsenal", manager: "Gunner_2000", assists: 9, matches: 23, keyPasses: 58 },
  { rank: 5, player: "Kylian Mbappé", slug: "kylian-mbappe", team: "Real Madrid", teamSlug: "real-madrid", manager: "CR7_Legend", assists: 8, matches: 22, keyPasses: 52 },
]

const cleanSheets = [
  { rank: 1, player: "Alisson", slug: "alisson", team: "Liverpool", teamSlug: "liverpool", manager: "YNWA_Steve", cleanSheets: 14, matches: 23, saves: 67 },
  { rank: 2, player: "Ederson", slug: "ederson", team: "Man City", teamSlug: "man-city", manager: "BlueMoon_UK", cleanSheets: 13, matches: 22, saves: 54 },
  { rank: 3, player: "Ter Stegen", slug: "ter-stegen", team: "Barcelona", teamSlug: "barcelona", manager: "xPedro_92", cleanSheets: 12, matches: 23, saves: 72 },
  { rank: 4, player: "Mike Maignan", slug: "mike-maignan", team: "AC Milan", teamSlug: "ac-milan", manager: "RossoneriPro", cleanSheets: 11, matches: 21, saves: 63 },
  { rank: 5, player: "Thibaut Courtois", slug: "thibaut-courtois", team: "Real Madrid", teamSlug: "real-madrid", manager: "CR7_Legend", cleanSheets: 10, matches: 20, saves: 48 },
]

// Chart data
const goalsChartData = topScorers.slice(0, 6).map(p => ({
  name: p.player.split(" ").pop(),
  goles: p.goals,
  promedio: Math.round(p.avg * 100) / 100
}))

const goalsPerRoundData = [
  { fecha: "1", goles: 45 },
  { fecha: "2", goles: 52 },
  { fecha: "3", goles: 48 },
  { fecha: "4", goles: 61 },
  { fecha: "5", goles: 55 },
  { fecha: "6", goles: 67 },
  { fecha: "7", goles: 58 },
  { fecha: "8", goles: 72 },
  { fecha: "9", goles: 63 },
  { fecha: "10", goles: 69 },
]

export function StatsPageContent() {
  const [statType, setStatType] = useState<"goals" | "assists" | "cleansheets" | "teams">("goals")
  const [category, setCategory] = useState("mayores")
  const [competition, setCompetition] = useState("all")
  const [season, setSeason] = useState("8")

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>
              <p className="text-sm text-muted-foreground">Rankings y estadísticas de la temporada</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[120px] bg-card border-border">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mayores">Mayores</SelectItem>
                <SelectItem value="menores">Menores</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={competition} onValueChange={setCompetition}>
              <SelectTrigger className="w-[140px] bg-card border-border">
                <SelectValue placeholder="Competencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="liga">Solo Liga</SelectItem>
                <SelectItem value="copa">Solo Copa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[130px] bg-card border-border">
                <SelectValue placeholder="Temporada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">Temporada 8</SelectItem>
                <SelectItem value="7">Temporada 7</SelectItem>
                <SelectItem value="6">Temporada 6</SelectItem>
                <SelectItem value="all">Histórico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Goleadores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={goalsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="goles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Goles por Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={goalsPerRoundData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Line type="monotone" dataKey="goles" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Stat Type Tabs */}
        <Tabs value={statType} onValueChange={(v) => setStatType(v as typeof statType)}>
          <TabsList className="bg-card border border-border h-auto flex-wrap">
            <TabsTrigger value="goals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Target className="w-4 h-4" /> Goleadores
            </TabsTrigger>
            <TabsTrigger value="assists" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Sparkles className="w-4 h-4" /> Asistencias
            </TabsTrigger>
            <TabsTrigger value="cleansheets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Shield className="w-4 h-4" /> Vallas invictas
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Award className="w-4 h-4" /> Equipos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats Content */}
        {statType === "goals" && (
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Tabla de Goleadores</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4 w-12">#</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Jugador</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Equipo</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">PJ</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">Goles</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3 hidden md:table-cell">Penal</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3 hidden md:table-cell">Prom.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.map((player, index) => (
                      <tr key={player.rank} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          {index < 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                              index === 1 ? "bg-gray-400/20 text-gray-300" :
                              "bg-amber-700/20 text-amber-600"
                            }`}>
                              {player.rank}
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium pl-2">{player.rank}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/players/${player.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {player.player.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-semibold text-foreground hover:text-primary transition-colors">{player.player}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/team/${player.teamSlug}`} className="hover:opacity-80 transition-opacity">
                            <p className="font-medium text-foreground hover:text-primary transition-colors">{player.team}</p>
                            <p className="text-xs text-muted-foreground">{player.manager}</p>
                          </Link>
                        </td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground">{player.matches}</td>
                        <td className="text-center py-4 px-3">
                          <span className="font-bold text-2xl text-primary">{player.goals}</span>
                        </td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground hidden md:table-cell">{player.penalties}</td>
                        <td className="text-center py-4 px-3 hidden md:table-cell">
                          <span className="text-sm font-medium text-emerald-400">{player.avg.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {statType === "assists" && (
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Tabla de Asistencias</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4 w-12">#</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Jugador</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Equipo</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">PJ</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">Asist.</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3 hidden md:table-cell">Pases clave</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAssists.map((player, index) => (
                      <tr key={player.rank} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          {index < 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                              index === 1 ? "bg-gray-400/20 text-gray-300" :
                              "bg-amber-700/20 text-amber-600"
                            }`}>
                              {player.rank}
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium pl-2">{player.rank}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/players/${player.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {player.player.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-semibold text-foreground hover:text-primary transition-colors">{player.player}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/team/${player.teamSlug}`} className="hover:opacity-80 transition-opacity">
                            <p className="font-medium text-foreground hover:text-primary transition-colors">{player.team}</p>
                            <p className="text-xs text-muted-foreground">{player.manager}</p>
                          </Link>
                        </td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground">{player.matches}</td>
                        <td className="text-center py-4 px-3">
                          <span className="font-bold text-2xl text-primary">{player.assists}</span>
                        </td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground hidden md:table-cell">{player.keyPasses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {statType === "cleansheets" && (
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Vallas Invictas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4 w-12">#</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Arquero</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Equipo</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">PJ</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">Vallas</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3 hidden md:table-cell">Atajadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cleanSheets.map((player, index) => (
                      <tr key={player.rank} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          {index < 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                              index === 1 ? "bg-gray-400/20 text-gray-300" :
                              "bg-amber-700/20 text-amber-600"
                            }`}>
                              {player.rank}
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium pl-2">{player.rank}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/players/${player.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {player.player.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-semibold text-foreground hover:text-primary transition-colors">{player.player}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/team/${player.teamSlug}`} className="hover:opacity-80 transition-opacity">
                            <p className="font-medium text-foreground hover:text-primary transition-colors">{player.team}</p>
                            <p className="text-xs text-muted-foreground">{player.manager}</p>
                          </Link>
                        </td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground">{player.matches}</td>
                        <td className="text-center py-4 px-3">
                          <span className="font-bold text-2xl text-primary">{player.cleanSheets}</span>
                        </td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground hidden md:table-cell">{player.saves}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {statType === "teams" && (
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>Estadísticas por Equipo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4 w-12">#</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Equipo</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">GF</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">GC</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3 hidden md:table-cell">Posesión</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3 hidden md:table-cell">Tiros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rank: 1, team: "Man City", teamSlug: "man-city", manager: "BlueMoon_UK", goalsFor: 68, goalsAgainst: 18, possession: 67.2, shots: 412 },
                      { rank: 2, team: "Real Madrid", teamSlug: "real-madrid", manager: "CR7_Legend", goalsFor: 62, goalsAgainst: 22, possession: 61.5, shots: 378 },
                      { rank: 3, team: "Liverpool", teamSlug: "liverpool", manager: "YNWA_Steve", goalsFor: 58, goalsAgainst: 24, possession: 58.8, shots: 356 },
                      { rank: 4, team: "Bayern", teamSlug: "bayern", manager: "MiaSanMia", goalsFor: 71, goalsAgainst: 31, possession: 63.1, shots: 425 },
                      { rank: 5, team: "Barcelona", teamSlug: "barcelona", manager: "xPedro_92", goalsFor: 54, goalsAgainst: 20, possession: 65.4, shots: 342 },
                    ].map((teamData, index) => (
                      <tr key={teamData.rank} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="text-muted-foreground font-medium">{teamData.rank}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/team/${teamData.teamSlug}`} className="hover:opacity-80 transition-opacity">
                            <p className="font-medium text-foreground hover:text-primary transition-colors">{teamData.team}</p>
                            <p className="text-xs text-muted-foreground">{teamData.manager}</p>
                          </Link>
                        </td>
                        <td className="text-center py-4 px-3">
                          <span className="font-bold text-lg text-success">{teamData.goalsFor}</span>
                        </td>
                        <td className="text-center py-4 px-3">
                          <span className="font-bold text-lg text-destructive">{teamData.goalsAgainst}</span>
                        </td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground hidden md:table-cell">{teamData.possession}%</td>
                        <td className="text-center py-4 px-3 text-sm text-muted-foreground hidden md:table-cell">{teamData.shots}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
