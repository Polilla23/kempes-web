"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Calendar, Medal, Star, TrendingUp, Goal, Shield, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const teamData = {
  name: "River Plate",
  manager: "xPedro_92",
  division: "Primera División Mayores",
  season: 8,
  position: 1,
  rating: 84,
  formation: "4-3-3",
  stats: {
    played: 18,
    won: 14,
    drawn: 3,
    lost: 1,
    goalsFor: 42,
    goalsAgainst: 12,
    cleanSheets: 10,
    form: ["W", "W", "D", "W", "W"],
  },
  seasonStats: {
    possession: 58,
    passAccuracy: 87,
    shotsPerGame: 14.2,
    tackles: 22.5,
    yellowCards: 28,
    redCards: 2,
  },
  // Trophy categories with specific counts and images
  trophyCategories: [
    { 
      name: "Liga Primera División", 
      count: 2, 
      seasons: [4, 7], 
      type: "liga",
      image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=100&h=100&fit=crop"
    },
    { 
      name: "Liga Segunda División", 
      count: 1, 
      seasons: [2], 
      type: "liga",
      image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=100&h=100&fit=crop"
    },
    { 
      name: "Copa Kempes", 
      count: 1, 
      seasons: [6], 
      type: "copa-kempes",
      image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=100&h=100&fit=crop"
    },
    { 
      name: "Copa de Oro", 
      count: 1, 
      seasons: [5], 
      type: "copa-oro",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&h=100&fit=crop"
    },
    { 
      name: "Copa de Plata", 
      count: 1, 
      seasons: [3], 
      type: "copa-plata",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=100&h=100&fit=crop"
    },
  ],
  squad: [
    { id: "1", name: "Ederson", position: "POR", rating: 88, goals: 0, assists: 1, matches: 18, nationality: "🇧🇷", salary: 200000, status: "Titular" },
    { id: "2", name: "Kyle Walker", position: "LD", rating: 84, goals: 1, assists: 3, matches: 17, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", salary: 180000, status: "Titular" },
    { id: "3", name: "Rúben Dias", position: "DFC", rating: 87, goals: 2, assists: 0, matches: 18, nationality: "🇵🇹", salary: 240000, status: "Titular" },
    { id: "4", name: "John Stones", position: "DFC", rating: 85, goals: 1, assists: 1, matches: 16, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", salary: 200000, status: "Titular" },
    { id: "5", name: "Josko Gvardiol", position: "LI", rating: 84, goals: 3, assists: 2, matches: 18, nationality: "🇭🇷", salary: 160000, status: "Titular" },
    { id: "6", name: "Rodri", position: "MCD", rating: 91, goals: 5, assists: 8, matches: 18, nationality: "🇪🇸", salary: 340000, status: "Titular" },
    { id: "7", name: "Kevin De Bruyne", position: "MC", rating: 91, goals: 7, assists: 14, matches: 17, nationality: "🇧🇪", salary: 380000, status: "Titular" },
    { id: "8", name: "Bernardo Silva", position: "MC", rating: 88, goals: 4, assists: 6, matches: 18, nationality: "🇵🇹", salary: 280000, status: "Titular" },
    { id: "9", name: "Phil Foden", position: "EI", rating: 88, goals: 9, assists: 5, matches: 18, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", salary: 290000, status: "Titular" },
    { id: "10", name: "Erling Haaland", position: "DC", rating: 91, goals: 22, assists: 4, matches: 18, nationality: "🇳🇴", salary: 450000, status: "Titular" },
    { id: "11", name: "Jeremy Doku", position: "ED", rating: 83, goals: 3, assists: 7, matches: 15, nationality: "🇧🇪", salary: 150000, status: "Titular" },
    { id: "12", name: "Ortega", position: "POR", rating: 82, goals: 0, assists: 0, matches: 3, nationality: "🇦🇷", salary: 100000, status: "Suplente" },
    { id: "13", name: "Akanji", position: "DFC", rating: 84, goals: 0, assists: 0, matches: 8, nationality: "🇨🇭", salary: 140000, status: "Suplente" },
    { id: "14", name: "Kovacic", position: "MC", rating: 84, goals: 2, assists: 3, matches: 12, nationality: "🇭🇷", salary: 180000, status: "Suplente" },
    { id: "15", name: "Grealish", position: "EI", rating: 84, goals: 2, assists: 2, matches: 10, nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", salary: 220000, status: "Suplente" },
    { id: "16", name: "Julián Álvarez", position: "DC", rating: 85, goals: 6, assists: 3, matches: 14, nationality: "🇦🇷", salary: 220000, status: "Cedido" },
  ],
  bestXI: {
    formation: "4-3-3",
    players: {
      GK: { name: "Ederson", rating: 88 },
      LB: { name: "Gvardiol", rating: 84 },
      CB1: { name: "Dias", rating: 87 },
      CB2: { name: "Stones", rating: 85 },
      RB: { name: "Walker", rating: 84 },
      CDM: { name: "Rodri", rating: 91 },
      CM1: { name: "De Bruyne", rating: 91 },
      CM2: { name: "B. Silva", rating: 88 },
      LW: { name: "Foden", rating: 88 },
      ST: { name: "Haaland", rating: 91 },
      RW: { name: "Doku", rating: 83 },
    }
  },
  recentMatches: [
    { opponent: "Boca Juniors", home: true, result: "W", score: "3-1", date: "15 Ene", competition: "Liga" },
    { opponent: "Racing", home: false, result: "W", score: "2-0", date: "12 Ene", competition: "Liga" },
    { opponent: "Independiente", home: true, result: "D", score: "1-1", date: "8 Ene", competition: "Copa Kempes" },
    { opponent: "San Lorenzo", home: false, result: "W", score: "4-2", date: "5 Ene", competition: "Liga" },
    { opponent: "Vélez", home: true, result: "W", score: "2-1", date: "2 Ene", competition: "Liga" },
  ],
}

const FormBadge = ({ result }: { result: string }) => {
  const colors = {
    W: "bg-success text-success-foreground",
    D: "bg-warning text-warning-foreground",
    L: "bg-destructive text-destructive-foreground",
  }
  return (
    <span className={cn("w-7 h-7 rounded text-xs font-bold flex items-center justify-center", colors[result as keyof typeof colors])}>
      {result}
    </span>
  )
}

const trophyColors: Record<string, { bg: string; text: string; border: string }> = {
  "liga": { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  "copa-kempes": { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  "copa-oro": { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  "copa-plata": { bg: "bg-slate-400/10", text: "text-slate-400", border: "border-slate-400/30" },
}

function FootballPitch() {
  const { bestXI } = teamData
  
  // 4-3-3 formation positions (percentage based)
  const positions = {
    GK: { top: "85%", left: "50%" },
    LB: { top: "65%", left: "15%" },
    CB1: { top: "68%", left: "35%" },
    CB2: { top: "68%", left: "65%" },
    RB: { top: "65%", left: "85%" },
    CDM: { top: "50%", left: "50%" },
    CM1: { top: "38%", left: "30%" },
    CM2: { top: "38%", left: "70%" },
    LW: { top: "18%", left: "15%" },
    ST: { top: "12%", left: "50%" },
    RW: { top: "18%", left: "85%" },
  }

  return (
    <div className="relative w-full aspect-[3/4] max-w-md mx-auto bg-gradient-to-b from-green-600 to-green-700 rounded-xl overflow-hidden">
      {/* Field markings */}
      <div className="absolute inset-0">
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full" />
        
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
        
        {/* Penalty areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-t-0 border-white/30" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-b-0 border-white/30" />
        
        {/* Goal areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-2 border-t-0 border-white/30" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-2 border-b-0 border-white/30" />
        
        {/* Field border */}
        <div className="absolute inset-2 border-2 border-white/30 rounded-lg" />
      </div>

      {/* Players */}
      {Object.entries(positions).map(([pos, coords]) => {
        const player = bestXI.players[pos as keyof typeof bestXI.players]
        if (!player) return null
        
        return (
          <div
            key={pos}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-600">
              <span className="text-xs font-bold text-red-600">{player.rating}</span>
            </div>
            <span className="text-[10px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded whitespace-nowrap">
              {player.name}
            </span>
          </div>
        )
      })}

      {/* Formation label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full">
        <span className="text-xs font-semibold text-white">{bestXI.formation}</span>
      </div>
    </div>
  )
}

export function TeamPageContent({ teamSlug }: { teamSlug: string }) {
  const totalTrophies = teamData.trophyCategories.reduce((acc, cat) => acc + cat.count, 0)

  return (
    <div className="p-6">
      {/* Team Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Team Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-card rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold text-primary border border-border">
            {teamData.name.substring(0, 3).toUpperCase()}
          </div>

          {/* Team Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{teamData.name}</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30">#{teamData.position}</Badge>
            </div>
            <p className="text-muted-foreground mb-1">
              Manager: <Link href={`/user/${teamData.manager}`} className="text-primary font-medium hover:underline">{teamData.manager}</Link>
            </p>
            <p className="text-muted-foreground">
              {teamData.division} &bull; Temporada {teamData.season}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Rating: <span className="text-foreground font-bold">{teamData.rating}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">
                  Títulos: <span className="text-foreground font-bold">{totalTrophies}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Formación: <span className="text-foreground font-bold">{teamData.formation}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col items-end gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Forma actual</p>
            <div className="flex gap-1">
              {teamData.stats.form.map((result, i) => (
                <FormBadge key={i} result={result} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="squad">Plantilla</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="trophies">Palmarés</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Best XI */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Mejor XI</CardTitle>
                    <p className="text-sm text-muted-foreground">Basado en la formación del manager</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <FootballPitch />
              </CardContent>
            </Card>

            {/* Quick Stats & Recent */}
            <div className="space-y-6">
              {/* Season Stats */}
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Esta Temporada</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-success">{teamData.stats.won}</p>
                      <p className="text-xs text-muted-foreground">Ganados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">{teamData.stats.drawn}</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">{teamData.stats.lost}</p>
                      <p className="text-xs text-muted-foreground">Perdidos</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Goal className="w-4 h-4 text-success" />
                      <div>
                        <p className="font-bold text-foreground">{teamData.stats.goalsFor}</p>
                        <p className="text-xs text-muted-foreground">Goles a favor</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-bold text-foreground">{teamData.stats.cleanSheets}</p>
                        <p className="text-xs text-muted-foreground">Vallas invictas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Matches */}
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Últimos Partidos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {teamData.recentMatches.slice(0, 5).map((match, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                        <FormBadge result={match.result} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {match.home ? "vs" : "@"} {match.opponent}
                          </p>
                          <p className="text-xs text-muted-foreground">{match.competition} &bull; {match.date}</p>
                        </div>
                        <span className="font-bold text-foreground">{match.score}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Squad Table Below Formation */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Plantilla del Club</CardTitle>
                  <p className="text-sm text-muted-foreground">{teamData.squad.length} jugadores</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium text-muted-foreground bg-muted/30">
                      <th className="py-3 px-4 text-left">Jugador</th>
                      <th className="py-3 px-2 text-center">Nac</th>
                      <th className="py-3 px-2 text-center">POS</th>
                      <th className="py-3 px-2 text-center">MED</th>
                      <th className="py-3 px-2 text-center">PJ</th>
                      <th className="py-3 px-2 text-center">G</th>
                      <th className="py-3 px-2 text-center">A</th>
                      <th className="py-3 px-3 text-right">Salario</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teamData.squad.map((player) => (
                      <tr key={player.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <Link href={`/player/${player.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {player.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-medium">{player.name}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-center text-lg">{player.nationality}</td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className="text-xs">{player.position}</Badge>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-primary">{player.rating}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{player.matches}</td>
                        <td className="py-3 px-2 text-center">{player.goals}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{player.assists}</td>
                        <td className="py-3 px-3 text-right text-muted-foreground">€{player.salary.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center">
                          <Badge 
                            variant={player.status === "Cedido" ? "secondary" : "outline"}
                            className={player.status === "Cedido" ? "bg-warning/20 text-warning border-warning/30" : ""}
                          >
                            {player.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Squad Tab */}
        <TabsContent value="squad">
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Plantilla Completa</CardTitle>
                  <p className="text-sm text-muted-foreground">{teamData.squad.length} jugadores</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium text-muted-foreground bg-muted/30">
                      <th className="py-3 px-4 text-left">Jugador</th>
                      <th className="py-3 px-2 text-center">Nac</th>
                      <th className="py-3 px-2 text-center">POS</th>
                      <th className="py-3 px-2 text-center">MED</th>
                      <th className="py-3 px-2 text-center">PJ</th>
                      <th className="py-3 px-2 text-center">G</th>
                      <th className="py-3 px-2 text-center">A</th>
                      <th className="py-3 px-3 text-right">Salario</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teamData.squad.map((player) => (
                      <tr key={player.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <Link href={`/player/${player.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {player.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-medium">{player.name}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-center text-lg">{player.nationality}</td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className="text-xs">{player.position}</Badge>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-primary">{player.rating}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{player.matches}</td>
                        <td className="py-3 px-2 text-center">{player.goals}</td>
                        <td className="py-3 px-2 text-center text-muted-foreground">{player.assists}</td>
                        <td className="py-3 px-3 text-right text-muted-foreground">€{player.salary.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center">
                          <Badge 
                            variant={player.status === "Cedido" ? "secondary" : "outline"}
                            className={player.status === "Cedido" ? "bg-warning/20 text-warning border-warning/30" : ""}
                          >
                            {player.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{teamData.seasonStats.possession}%</p>
                <p className="text-xs text-muted-foreground">Posesión</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{teamData.seasonStats.passAccuracy}%</p>
                <p className="text-xs text-muted-foreground">Precisión pases</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{teamData.seasonStats.shotsPerGame}</p>
                <p className="text-xs text-muted-foreground">Tiros/partido</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{teamData.seasonStats.tackles}</p>
                <p className="text-xs text-muted-foreground">Entradas/partido</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-warning">{teamData.seasonStats.yellowCards}</p>
                <p className="text-xs text-muted-foreground">Amarillas</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-destructive">{teamData.seasonStats.redCards}</p>
                <p className="text-xs text-muted-foreground">Rojas</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trophies Tab */}
        <TabsContent value="trophies">
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Palmarés Completo</CardTitle>
                  <p className="text-sm text-muted-foreground">{totalTrophies} títulos en la historia del club</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamData.trophyCategories.map((category, index) => {
                  const colors = trophyColors[category.type] || trophyColors.liga
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "rounded-xl border p-5 hover:shadow-lg transition-all",
                        colors.bg,
                        colors.border
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Trophy Image */}
                        <div className="relative">
                          <img 
                            src={category.image || "/placeholder.svg"} 
                            alt={category.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className={cn(
                            "absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                            colors.bg,
                            colors.text,
                            "border-2 border-card"
                          )}>
                            {category.count}
                          </div>
                        </div>
                        
                        {/* Trophy Info */}
                        <div className="flex-1">
                          <h3 className={cn("font-semibold", colors.text)}>{category.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.count === 1 ? "1 título" : `${category.count} títulos`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {category.seasons.map((season) => (
                              <Badge key={season} variant="outline" className="text-[10px] px-1.5">
                                T{season}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Trophy Summary */}
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Resumen de Títulos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {teamData.trophyCategories.filter(c => c.type === "liga").reduce((acc, c) => acc + c.count, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Ligas</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {teamData.trophyCategories.filter(c => c.type === "copa-kempes").reduce((acc, c) => acc + c.count, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Copa Kempes</p>
                  </div>
                  <div className="text-center p-4 bg-amber-500/5 rounded-lg">
                    <p className="text-2xl font-bold text-amber-500">
                      {teamData.trophyCategories.filter(c => c.type === "copa-oro").reduce((acc, c) => acc + c.count, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Copa de Oro</p>
                  </div>
                  <div className="text-center p-4 bg-slate-400/5 rounded-lg">
                    <p className="text-2xl font-bold text-slate-400">
                      {teamData.trophyCategories.filter(c => c.type === "copa-plata").reduce((acc, c) => acc + c.count, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Copa de Plata</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
