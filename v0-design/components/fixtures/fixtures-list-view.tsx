"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Clock, CheckCircle2, Upload, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category, CompetitionType } from "./fixtures-page-content"

interface MatchEvent {
  type: "goal" | "yellow" | "red" | "substitution" | "own-goal"
  minute: number
  player: string
  team: "home" | "away"
  assist?: string
}

interface Match {
  id: string
  competitionId: string
  competitionName: string
  matchday?: number
  round?: string
  homeTeam: string
  homeManager: string
  awayTeam: string
  awayManager: string
  homeScore?: number
  awayScore?: number
  status: "pending" | "played"
  date?: string
  events?: MatchEvent[]
}

const mockMatches: Match[] = [
  // Primera División - Played
  {
    id: "1",
    competitionId: "liga-mayores-1",
    competitionName: "Primera División",
    matchday: 12,
    homeTeam: "Real Madrid",
    homeManager: "Carlos",
    awayTeam: "Barcelona",
    awayManager: "Miguel",
    homeScore: 2,
    awayScore: 1,
    status: "played",
    date: "15 Ene",
    events: [
      { type: "goal", minute: 23, player: "Vinicius Jr", team: "home", assist: "Bellingham" },
      { type: "yellow", minute: 34, player: "Gavi", team: "away" },
      { type: "goal", minute: 56, player: "Lewandowski", team: "away" },
      { type: "goal", minute: 78, player: "Bellingham", team: "home", assist: "Vinicius Jr" },
      { type: "red", minute: 85, player: "De Jong", team: "away" },
    ],
  },
  {
    id: "2",
    competitionId: "liga-mayores-1",
    competitionName: "Primera División",
    matchday: 12,
    homeTeam: "Atlético",
    homeManager: "Pablo",
    awayTeam: "Sevilla",
    awayManager: "Luis",
    homeScore: 0,
    awayScore: 0,
    status: "played",
    date: "15 Ene",
    events: [
      { type: "yellow", minute: 12, player: "Koke", team: "home" },
      { type: "yellow", minute: 45, player: "Ocampos", team: "away" },
      { type: "yellow", minute: 67, player: "Griezmann", team: "home" },
    ],
  },
  {
    id: "3",
    competitionId: "liga-mayores-1",
    competitionName: "Primera División",
    matchday: 12,
    homeTeam: "Valencia",
    homeManager: "Andrés",
    awayTeam: "Betis",
    awayManager: "Martín",
    homeScore: 3,
    awayScore: 2,
    status: "played",
    date: "14 Ene",
    events: [
      { type: "goal", minute: 10, player: "Soler", team: "home" },
      { type: "goal", minute: 25, player: "Fekir", team: "away" },
      { type: "goal", minute: 38, player: "Soler", team: "home" },
      { type: "goal", minute: 52, player: "Iglesias", team: "away" },
      { type: "yellow", minute: 70, player: "Parejo", team: "home" },
      { type: "goal", minute: 88, player: "Guedes", team: "home", assist: "Soler" },
    ],
  },
  // Segunda División
  {
    id: "4",
    competitionId: "liga-mayores-2",
    competitionName: "Segunda División",
    matchday: 11,
    homeTeam: "Sporting",
    homeManager: "Diego",
    awayTeam: "Oviedo",
    awayManager: "Pedro",
    homeScore: 1,
    awayScore: 4,
    status: "played",
    date: "14 Ene",
    events: [
      { type: "goal", minute: 5, player: "Borja Bastón", team: "away" },
      { type: "goal", minute: 22, player: "Cazorla", team: "away" },
      { type: "goal", minute: 45, player: "Manu García", team: "home" },
      { type: "goal", minute: 67, player: "Borja Bastón", team: "away" },
      { type: "goal", minute: 89, player: "Sangalli", team: "away" },
    ],
  },
  {
    id: "5",
    competitionId: "liga-mayores-2",
    competitionName: "Segunda División",
    matchday: 12,
    homeTeam: "Racing",
    homeManager: "José",
    awayTeam: "Zaragoza",
    awayManager: "Fernando",
    status: "pending",
  },
  // Copa Kempes
  {
    id: "6",
    competitionId: "copa-kempes",
    competitionName: "Copa Kempes",
    round: "Octavos",
    homeTeam: "Real Madrid",
    homeManager: "Carlos",
    awayTeam: "Sporting",
    awayManager: "Diego",
    homeScore: 4,
    awayScore: 0,
    status: "played",
    date: "10 Ene",
    events: [
      { type: "goal", minute: 15, player: "Mbappé", team: "home" },
      { type: "goal", minute: 34, player: "Vinicius Jr", team: "home", assist: "Mbappé" },
      { type: "yellow", minute: 56, player: "Manu García", team: "away" },
      { type: "goal", minute: 72, player: "Mbappé", team: "home" },
      { type: "goal", minute: 85, player: "Rodrygo", team: "home" },
    ],
  },
  {
    id: "7",
    competitionId: "copa-kempes",
    competitionName: "Copa Kempes",
    round: "Octavos",
    homeTeam: "Barcelona",
    homeManager: "Miguel",
    awayTeam: "Racing",
    awayManager: "José",
    homeScore: 2,
    awayScore: 1,
    status: "played",
    date: "10 Ene",
    events: [
      { type: "goal", minute: 28, player: "Lewandowski", team: "home" },
      { type: "goal", minute: 45, player: "Enzo Fernández", team: "away" },
      { type: "yellow", minute: 60, player: "Gavi", team: "home" },
      { type: "goal", minute: 78, player: "Yamal", team: "home", assist: "Pedri" },
    ],
  },
  {
    id: "8",
    competitionId: "copa-kempes",
    competitionName: "Copa Kempes",
    round: "Cuartos",
    homeTeam: "Real Madrid",
    homeManager: "Carlos",
    awayTeam: "Atlético",
    awayManager: "Pablo",
    status: "pending",
  },
  // Menores
  {
    id: "9",
    competitionId: "liga-menores-1",
    competitionName: "Primera División Menores",
    matchday: 8,
    homeTeam: "Juvenil A",
    homeManager: "Tomás",
    awayTeam: "Juvenil B",
    awayManager: "Raúl",
    homeScore: 2,
    awayScore: 2,
    status: "played",
    date: "13 Ene",
    events: [
      { type: "goal", minute: 20, player: "García", team: "home" },
      { type: "goal", minute: 35, player: "López", team: "away" },
      { type: "goal", minute: 55, player: "Martínez", team: "away" },
      { type: "goal", minute: 88, player: "Rodríguez", team: "home" },
    ],
  },
  {
    id: "10",
    competitionId: "liga-menores-1",
    competitionName: "Primera División Menores",
    matchday: 9,
    homeTeam: "Cadete A",
    homeManager: "Sergio",
    awayTeam: "Cadete B",
    awayManager: "Álvaro",
    status: "pending",
  },
]

interface ListViewProps {
  selectedCompetition: string
  selectedCategory: Category | "all"
  selectedType: CompetitionType | "all"
  selectedStatus: "all" | "played" | "pending"
}

export function FixturesListView({
  selectedCompetition,
  selectedCategory,
  selectedType,
  selectedStatus,
}: ListViewProps) {
  const [expandedMatches, setExpandedMatches] = useState<string[]>([])

  const toggleExpand = (matchId: string) => {
    setExpandedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    )
  }

  // Filter matches
  const filteredMatches = mockMatches.filter((match) => {
    if (selectedCompetition !== "all" && match.competitionId !== selectedCompetition) return false
    if (selectedStatus !== "all" && match.status !== selectedStatus) return false
    return true
  })

  // Group by competition
  const groupedMatches = filteredMatches.reduce(
    (acc, match) => {
      const key = match.competitionId
      if (!acc[key]) {
        acc[key] = {
          name: match.competitionName,
          matches: [],
        }
      }
      acc[key].matches.push(match)
      return acc
    },
    {} as Record<string, { name: string; matches: Match[] }>,
  )

  const getEventIcon = (type: MatchEvent["type"]) => {
    switch (type) {
      case "goal":
        return "⚽"
      case "own-goal":
        return "⚽ (p.p.)"
      case "yellow":
        return "🟨"
      case "red":
        return "🟥"
      case "substitution":
        return "🔄"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([competitionId, { name, matches }]) => (
        <Card key={competitionId} className="bg-card border-border overflow-hidden">
          {/* Competition Header */}
          <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">{name.substring(0, 2).toUpperCase()}</span>
              </div>
              <span className="font-semibold text-foreground">{name}</span>
              <Badge variant="outline" className="text-xs">
                {matches.length} partidos
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Matches Table */}
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {matches.map((match) => {
                const isExpanded = expandedMatches.includes(match.id)
                const hasEvents = match.events && match.events.length > 0

                return (
                  <div key={match.id}>
                    <div
                      className={cn(
                        "px-4 py-3 hover:bg-secondary/30 transition-colors flex items-center gap-4",
                        hasEvents && "cursor-pointer"
                      )}
                      onClick={() => hasEvents && toggleExpand(match.id)}
                    >
                      {/* Expand Button */}
                      <div className="w-6 flex-shrink-0">
                        {hasEvents && (
                          <Button variant="ghost" size="icon" className="w-6 h-6 p-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Round/Matchday */}
                      <div className="w-20 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{match.round || `Fecha ${match.matchday}`}</span>
                      </div>

                      {/* Date */}
                      <div className="w-16 flex-shrink-0">
                        {match.date ? (
                          <span className="text-xs text-muted-foreground">{match.date}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">-</span>
                        )}
                      </div>

                      {/* Home Team */}
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium text-foreground">{match.homeTeam}</p>
                        <p className="text-[11px] text-muted-foreground">{match.homeManager}</p>
                      </div>

                      {/* Score / Status */}
                      <div className="w-24 flex-shrink-0 flex items-center justify-center">
                        {match.status === "played" ? (
                          <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg">
                            <span className="text-lg font-bold text-foreground">{match.homeScore}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-lg font-bold text-foreground">{match.awayScore}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">{match.awayTeam}</p>
                        <p className="text-[11px] text-muted-foreground">{match.awayManager}</p>
                      </div>

                      {/* Status Icon */}
                      <div className="w-10 flex-shrink-0 flex justify-end">
                        {match.status === "played" ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-primary hover:bg-primary/10">
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Events */}
                    {isExpanded && hasEvents && (
                      <div className="bg-muted/30 px-4 py-3 border-t border-border">
                        <div className="flex gap-8">
                          {/* Home Team Events */}
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2">{match.homeTeam}</p>
                            <div className="space-y-1">
                              {match.events
                                ?.filter(e => e.team === "home")
                                .sort((a, b) => a.minute - b.minute)
                                .map((event, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground w-8">{event.minute}'</span>
                                    <span>{getEventIcon(event.type)}</span>
                                    <span className="text-foreground">{event.player}</span>
                                    {event.assist && (
                                      <span className="text-muted-foreground text-xs">(Asist: {event.assist})</span>
                                    )}
                                  </div>
                                ))}
                              {match.events?.filter(e => e.team === "home").length === 0 && (
                                <p className="text-xs text-muted-foreground">Sin eventos</p>
                              )}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="w-px bg-border" />

                          {/* Away Team Events */}
                          <div className="flex-1">
                            <p className="text-xs font-medium text-muted-foreground mb-2">{match.awayTeam}</p>
                            <div className="space-y-1">
                              {match.events
                                ?.filter(e => e.team === "away")
                                .sort((a, b) => a.minute - b.minute)
                                .map((event, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground w-8">{event.minute}'</span>
                                    <span>{getEventIcon(event.type)}</span>
                                    <span className="text-foreground">{event.player}</span>
                                    {event.assist && (
                                      <span className="text-muted-foreground text-xs">(Asist: {event.assist})</span>
                                    )}
                                  </div>
                                ))}
                              {match.events?.filter(e => e.team === "away").length === 0 && (
                                <p className="text-xs text-muted-foreground">Sin eventos</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedMatches).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No se encontraron partidos con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  )
}
