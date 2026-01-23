"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Trophy,
  Target,
  Shirt,
  TrendingUp,
  Star,
  Calendar,
  MapPin,
  Flag,
  Ruler,
  Weight,
  ArrowRightLeft,
  Clock
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

// Mock player data - in a real app this would come from props/API
const playerData = {
  name: "Erling Haaland",
  position: "DC",
  positionFull: "Delantero Centro",
  rating: 94,
  nationality: "Noruega",
  nationalityFlag: "🇳🇴",
  age: 25,
  height: "1.95m",
  weight: "88kg",
  birthDate: "21 Jul 2000",
  foot: "Izquierdo",
  currentTeam: {
    name: "River Plate",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_Club_Atl%C3%A9tico_River_Plate.svg",
    league: "Liga Mayores"
  },
  marketValue: "€180M",
  contractUntil: "Jun 2030",
  stats: {
    matches: 15,
    goals: 24,
    assists: 5,
    yellowCards: 2,
    redCards: 0,
    minutesPlayed: 1320,
    goalsPerMatch: 1.6
  },
  attributes: {
    pace: 89,
    shooting: 95,
    passing: 70,
    dribbling: 80,
    defending: 45,
    physical: 91
  },
  transferHistory: [
    {
      date: "14 Ene 2026",
      type: "Compra",
      from: "Manchester City",
      fromLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      to: "River Plate",
      toLogo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_Club_Atl%C3%A9tico_River_Plate.svg",
      fee: "€180M"
    },
    {
      date: "Jul 2022",
      type: "Compra",
      from: "Borussia Dortmund",
      fromLogo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
      to: "Manchester City",
      toLogo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      fee: "€60M"
    }
  ],
  recentMatches: [
    { opponent: "Boca Juniors", result: "3-1", goals: 2, assists: 0, date: "12 Ene" },
    { opponent: "San Lorenzo", result: "2-2", goals: 1, assists: 1, date: "5 Ene" },
    { opponent: "Racing", result: "4-0", goals: 3, assists: 0, date: "29 Dic" },
    { opponent: "Independiente", result: "2-1", goals: 1, assists: 1, date: "22 Dic" },
  ]
}

const AttributeBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-bold", value >= 85 ? "text-green-500" : value >= 70 ? "text-amber-500" : "text-red-500")}>
        {value}
      </span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
)

export function PlayerPageContent({ playerSlug }: { playerSlug: string }) {
  // In a real app, you'd fetch player data based on the slug
  const player = playerData

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="bg-transparent">
          <Link href="/transfers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a transferencias
          </Link>
        </Button>

        {/* Player Header */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
            
            <CardContent className="relative p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Player Avatar/Rating */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center border-2 border-primary/30">
                    <div className="text-center">
                      <span className="text-3xl md:text-4xl font-black text-primary">{player.rating}</span>
                      <p className="text-xs text-muted-foreground mt-1">{player.position}</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-2xl">{player.nationalityFlag}</div>
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{player.name}</h1>
                    <Badge className="bg-primary/10 text-primary">{player.positionFull}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={player.currentTeam.logo || "/placeholder.svg"}
                        alt={player.currentTeam.name}
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{player.currentTeam.name}</p>
                        <p className="text-xs text-muted-foreground">{player.currentTeam.league}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flag className="w-4 h-4" />
                      <span>{player.nationality}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{player.age} años ({player.birthDate})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Ruler className="w-4 h-4" />
                      <span>{player.height}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Shirt className="w-4 h-4" />
                      <span>Pie {player.foot}</span>
                    </div>
                  </div>
                </div>

                {/* Market Value */}
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Valor de mercado</p>
                  <p className="text-2xl md:text-3xl font-black text-primary">{player.marketValue}</p>
                  <p className="text-xs text-muted-foreground mt-1">Contrato hasta {player.contractUntil}</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Season Stats */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <CardTitle>Estadísticas Temporada 8</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <p className="text-3xl font-black text-foreground">{player.stats.matches}</p>
                    <p className="text-sm text-muted-foreground">Partidos</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-xl">
                    <p className="text-3xl font-black text-green-500">{player.stats.goals}</p>
                    <p className="text-sm text-muted-foreground">Goles</p>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-xl">
                    <p className="text-3xl font-black text-blue-500">{player.stats.assists}</p>
                    <p className="text-sm text-muted-foreground">Asistencias</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-xl">
                    <p className="text-3xl font-black text-primary">{player.stats.goalsPerMatch}</p>
                    <p className="text-sm text-muted-foreground">Goles/Partido</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">{player.stats.minutesPlayed}'</p>
                      <p className="text-xs text-muted-foreground">Minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 rounded-lg">
                    <div className="w-3 h-4 bg-amber-500 rounded-sm" />
                    <div>
                      <p className="font-semibold text-foreground">{player.stats.yellowCards}</p>
                      <p className="text-xs text-muted-foreground">Amarillas</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 rounded-lg">
                    <div className="w-3 h-4 bg-red-500 rounded-sm" />
                    <div>
                      <p className="font-semibold text-foreground">{player.stats.redCards}</p>
                      <p className="text-xs text-muted-foreground">Rojas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle>Últimos Partidos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {player.recentMatches.map((match, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-16">{match.date}</span>
                        <span className="text-sm font-medium text-foreground">vs {match.opponent}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "font-mono",
                            match.result.startsWith("3") || match.result.startsWith("4") || match.result.startsWith("2-1") || match.result.startsWith("2-0")
                              ? "border-green-500/50 text-green-500"
                              : match.result.includes("-") && match.result.split("-")[0] === match.result.split("-")[1]
                              ? "border-amber-500/50 text-amber-500"
                              : "border-red-500/50 text-red-500"
                          )}
                        >
                          {match.result}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-500 font-semibold">{match.goals}⚽</span>
                          <span className="text-blue-500 font-semibold">{match.assists}🅰️</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transfer History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                  <CardTitle>Historial de Transferencias</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {player.transferHistory.map((transfer, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={transfer.fromLogo || "/placeholder.svg"}
                            alt={transfer.from}
                            className="w-8 h-8 object-contain"
                          />
                          <span className="text-sm text-muted-foreground hidden sm:block">{transfer.from}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ArrowRightLeft className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={transfer.toLogo || "/placeholder.svg"}
                            alt={transfer.to}
                            className="w-8 h-8 object-contain"
                          />
                          <span className="text-sm text-muted-foreground hidden sm:block">{transfer.to}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{transfer.fee}</p>
                        <p className="text-xs text-muted-foreground">{transfer.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Attributes */}
          <div className="space-y-6">
            {/* Player Attributes */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <CardTitle>Atributos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <AttributeBar label="Ritmo" value={player.attributes.pace} color="bg-green-500" />
                <AttributeBar label="Disparo" value={player.attributes.shooting} color="bg-green-500" />
                <AttributeBar label="Pase" value={player.attributes.passing} color="bg-amber-500" />
                <AttributeBar label="Regate" value={player.attributes.dribbling} color="bg-amber-500" />
                <AttributeBar label="Defensa" value={player.attributes.defending} color="bg-red-500" />
                <AttributeBar label="Físico" value={player.attributes.physical} color="bg-green-500" />
              </CardContent>
            </Card>

            {/* Overall Rating Card */}
            <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <span className="text-4xl font-black text-primary">{player.rating}</span>
                </div>
                <p className="font-semibold text-foreground">Rating General</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Categoría: <span className="text-primary font-semibold">Élite</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
