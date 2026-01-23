"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Plus,
  Minus,
  Trophy,
  ImageIcon,
  AlertCircle,
  Calendar,
  Shield,
  Clock,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock pending matches for the logged-in user
const pendingMatches = [
  {
    id: "1",
    competition: "Primera División",
    competitionType: "liga",
    matchday: "Fecha 19",
    homeTeam: "River Plate",
    homeTeamLogo: "RIV",
    awayTeam: "Racing Club",
    awayTeamLogo: "RAC",
    isUserHome: false,
    deadline: "3 días",
    priority: "high",
  },
  {
    id: "2",
    competition: "Copa Kempes",
    competitionType: "copa-kempes",
    matchday: "Cuartos de Final",
    homeTeam: "Racing Club",
    homeTeamLogo: "RAC",
    awayTeam: "Boca Juniors",
    awayTeamLogo: "BOC",
    isUserHome: true,
    deadline: "5 días",
    priority: "medium",
  },
  {
    id: "3",
    competition: "Primera División",
    competitionType: "liga",
    matchday: "Fecha 15",
    homeTeam: "Racing Club",
    homeTeamLogo: "RAC",
    awayTeam: "San Lorenzo",
    awayTeamLogo: "SLO",
    isUserHome: true,
    deadline: "Vencido",
    priority: "urgent",
  },
  {
    id: "4",
    competition: "Copa de Oro",
    competitionType: "copa-oro",
    matchday: "Octavos de Final",
    homeTeam: "Estudiantes",
    homeTeamLogo: "EST",
    awayTeam: "Racing Club",
    awayTeamLogo: "RAC",
    isUserHome: false,
    deadline: "10 días",
    priority: "low",
  },
  {
    id: "5",
    competition: "Primera División",
    competitionType: "liga",
    matchday: "Fecha 20",
    homeTeam: "Racing Club",
    homeTeamLogo: "RAC",
    awayTeam: "Independiente",
    awayTeamLogo: "IND",
    isUserHome: true,
    deadline: "12 días",
    priority: "low",
  },
]

const getCompetitionColors = (type: string) => {
  switch (type) {
    case "copa-oro":
      return "bg-gold/10 text-gold border-gold/30"
    case "copa-plata":
      return "bg-silver/20 text-foreground border-silver/40"
    case "copa-kempes":
      return "bg-primary/10 text-primary border-primary/30"
    default:
      return "bg-muted text-muted-foreground border-transparent"
  }
}

const getPriorityColors = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-destructive/10 text-destructive border-destructive/30"
    case "high":
      return "bg-warning/10 text-warning border-warning/30"
    case "medium":
      return "bg-primary/10 text-primary border-primary/30"
    default:
      return "bg-muted text-muted-foreground border-transparent"
  }
}

export function SubmitResultPageContent() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  const selectedMatchData = pendingMatches.find((m) => m.id === selectedMatch)

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Subir Resultado</h1>
              <p className="text-muted-foreground">Selecciona el partido y sube el resultado</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Match Selection Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle className="text-foreground">Tus Partidos Pendientes</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Todas las competencias</p>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {pendingMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => {
                      setSelectedMatch(match.id)
                      setHomeScore(0)
                      setAwayScore(0)
                    }}
                    className={cn(
                      "w-full text-left bg-secondary/50 border rounded-xl p-4 transition-all hover:border-primary/50",
                      selectedMatch === match.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    )}
                  >
                    {/* Competition & Deadline */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] gap-1", getCompetitionColors(match.competitionType))}
                      >
                        {match.competitionType.includes("copa") ? (
                          <Trophy className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {match.competition}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] gap-1", getPriorityColors(match.priority))}>
                        <Clock className="w-3 h-3" />
                        {match.deadline}
                      </Badge>
                    </div>

                    {/* Matchday */}
                    <p className="text-xs text-muted-foreground mb-2">{match.matchday}</p>

                    {/* Teams */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-8 h-8 rounded flex items-center justify-center text-xs font-bold border",
                            match.isUserHome
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {match.homeTeamLogo}
                        </div>
                        <span className={cn("text-sm font-medium", match.isUserHome && "text-primary")}>
                          {match.homeTeam}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium", !match.isUserHome && "text-primary")}>
                          {match.awayTeam}
                        </span>
                        <div
                          className={cn(
                            "w-8 h-8 rounded flex items-center justify-center text-xs font-bold border",
                            !match.isUserHome
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {match.awayTeamLogo}
                        </div>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedMatch === match.id && (
                      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-primary/20 text-primary text-xs font-medium">
                        <Check className="w-4 h-4" />
                        Seleccionado
                      </div>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Result Form */}
          <div className="lg:col-span-3">
            {selectedMatchData ? (
              <Card className="bg-card border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs gap-1 mb-2", getCompetitionColors(selectedMatchData.competitionType))}
                      >
                        {selectedMatchData.competition} - {selectedMatchData.matchday}
                      </Badge>
                      <CardTitle className="text-foreground">Registrar Resultado</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Input */}
                  <div className="bg-secondary/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-4">
                      {/* Home Team */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold border",
                              selectedMatchData.isUserHome
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {selectedMatchData.homeTeamLogo}
                          </div>
                          <div>
                            <p className={cn("font-semibold", selectedMatchData.isUserHome && "text-primary")}>
                              {selectedMatchData.homeTeam}
                            </p>
                            <p className="text-xs text-muted-foreground">Local</p>
                          </div>
                        </div>

                        {/* Score Control */}
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                            className="h-12 w-12 rounded-full bg-transparent"
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                          <span className="text-6xl font-bold text-primary w-20 text-center tabular-nums">
                            {homeScore}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setHomeScore(homeScore + 1)}
                            className="h-12 w-12 rounded-full bg-transparent"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* VS Divider */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl font-bold text-muted-foreground">VS</div>
                        <div className="w-px h-16 bg-border" />
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="text-right">
                            <p className={cn("font-semibold", !selectedMatchData.isUserHome && "text-primary")}>
                              {selectedMatchData.awayTeam}
                            </p>
                            <p className="text-xs text-muted-foreground">Visitante</p>
                          </div>
                          <div
                            className={cn(
                              "w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold border",
                              !selectedMatchData.isUserHome
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {selectedMatchData.awayTeamLogo}
                          </div>
                        </div>

                        {/* Score Control */}
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                            className="h-12 w-12 rounded-full bg-transparent"
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                          <span className="text-6xl font-bold text-primary w-20 text-center tabular-nums">
                            {awayScore}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAwayScore(awayScore + 1)}
                            className="h-12 w-12 rounded-full bg-transparent"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Goal Scorers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Goleadores {selectedMatchData.homeTeam}</Label>
                      <Textarea
                        placeholder="Ej: Haaland 23', 45' / Foden 67'"
                        className="bg-secondary border-border min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Goleadores {selectedMatchData.awayTeam}</Label>
                      <Textarea placeholder="Ej: Mbappé 12', 78'" className="bg-secondary border-border min-h-[80px]" />
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Captura de pantalla (obligatorio)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-secondary/30">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <ImageIcon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm text-foreground font-medium mb-1">Arrastra tu captura aquí</p>
                      <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
                      <p className="text-xs text-muted-foreground mt-2">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Notas adicionales (opcional)</Label>
                    <Textarea
                      placeholder="Ej: Partido jugado con penales, expulsiones, etc."
                      className="bg-secondary border-border"
                    />
                  </div>

                  {/* Alert */}
                  <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-warning">Importante</p>
                      <p className="text-muted-foreground">
                        El resultado debe ser verificado con la captura de pantalla. Resultados fraudulentos serán
                        penalizados.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button className="w-full h-12 text-lg font-semibold">
                    <Upload className="w-5 h-5 mr-2" />
                    Subir Resultado
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Selecciona un partido</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Elige uno de tus partidos pendientes de la lista para subir el resultado
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
