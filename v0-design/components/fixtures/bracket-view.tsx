"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Crown } from "lucide-react"

interface BracketMatch {
  id: string
  homeTeam: string
  homeManager: string
  awayTeam: string
  awayManager: string
  homeScore?: number
  awayScore?: number
  winner?: "home" | "away"
}

interface BracketRound {
  name: string
  matches: BracketMatch[]
}

// Copa Kempes Bracket Data - 16 teams
const copaKempesBracket: BracketRound[] = [
  {
    name: "Octavos de Final",
    matches: [
      { id: "o1", homeTeam: "Real Madrid", homeManager: "Carlos", awayTeam: "Sporting", awayManager: "Diego", homeScore: 4, awayScore: 0, winner: "home" },
      { id: "o2", homeTeam: "Barcelona", homeManager: "Miguel", awayTeam: "Racing", awayManager: "José", homeScore: 2, awayScore: 1, winner: "home" },
      { id: "o3", homeTeam: "Atlético", homeManager: "Pablo", awayTeam: "Oviedo", awayManager: "Pedro", homeScore: 3, awayScore: 1, winner: "home" },
      { id: "o4", homeTeam: "Sevilla", homeManager: "Luis", awayTeam: "Zaragoza", awayManager: "Fernando", homeScore: 2, awayScore: 2, winner: "home" },
      { id: "o5", homeTeam: "Valencia", homeManager: "Andrés", awayTeam: "Betis", awayManager: "Martín", homeScore: 1, awayScore: 3, winner: "away" },
      { id: "o6", homeTeam: "Villarreal", homeManager: "Ricardo", awayTeam: "Celta", awayManager: "Javier", homeScore: 2, awayScore: 0, winner: "home" },
      { id: "o7", homeTeam: "Athletic", homeManager: "Iker", awayTeam: "Sociedad", awayManager: "Mikel", homeScore: 1, awayScore: 2, winner: "away" },
      { id: "o8", homeTeam: "Getafe", homeManager: "Rubén", awayTeam: "Espanyol", awayManager: "Marc", homeScore: 0, awayScore: 1, winner: "away" },
    ],
  },
  {
    name: "Cuartos de Final",
    matches: [
      { id: "c1", homeTeam: "Real Madrid", homeManager: "Carlos", awayTeam: "Barcelona", awayManager: "Miguel", homeScore: 2, awayScore: 1, winner: "home" },
      { id: "c2", homeTeam: "Atlético", homeManager: "Pablo", awayTeam: "Sevilla", awayManager: "Luis", homeScore: 1, awayScore: 0, winner: "home" },
      { id: "c3", homeTeam: "Betis", homeManager: "Martín", awayTeam: "Villarreal", awayManager: "Ricardo" },
      { id: "c4", homeTeam: "Sociedad", homeManager: "Mikel", awayTeam: "Espanyol", awayManager: "Marc" },
    ],
  },
  {
    name: "Semifinales",
    matches: [
      { id: "s1", homeTeam: "Real Madrid", homeManager: "Carlos", awayTeam: "Atlético", awayManager: "Pablo" },
      { id: "s2", homeTeam: "TBD", homeManager: "-", awayTeam: "TBD", awayManager: "-" },
    ],
  },
  {
    name: "Final",
    matches: [{ id: "f1", homeTeam: "TBD", homeManager: "-", awayTeam: "TBD", awayManager: "-" }],
  },
]

// Copa de Oro Bracket - 8 teams
const copaOroBracket: BracketRound[] = [
  {
    name: "Cuartos de Final",
    matches: [
      { id: "q1", homeTeam: "Real Madrid", homeManager: "Carlos", awayTeam: "Atlético", awayManager: "Pablo", homeScore: 3, awayScore: 1, winner: "home" },
      { id: "q2", homeTeam: "Barcelona", homeManager: "Miguel", awayTeam: "Sevilla", awayManager: "Luis", homeScore: 2, awayScore: 2 },
      { id: "q3", homeTeam: "Valencia", homeManager: "Andrés", awayTeam: "Villarreal", awayManager: "Ricardo" },
      { id: "q4", homeTeam: "Athletic", homeManager: "Iker", awayTeam: "Betis", awayManager: "Martín" },
    ],
  },
  {
    name: "Semifinales",
    matches: [
      { id: "s1", homeTeam: "Real Madrid", homeManager: "Carlos", awayTeam: "TBD", awayManager: "-" },
      { id: "s2", homeTeam: "TBD", homeManager: "-", awayTeam: "TBD", awayManager: "-" },
    ],
  },
  {
    name: "Final",
    matches: [{ id: "f1", homeTeam: "TBD", homeManager: "-", awayTeam: "TBD", awayManager: "-" }],
  },
]

// Copa de Plata Bracket - 8 teams
const copaPlataBracket: BracketRound[] = [
  {
    name: "Cuartos de Final",
    matches: [
      { id: "q1", homeTeam: "Sporting", homeManager: "Diego", awayTeam: "Racing", awayManager: "José", homeScore: 1, awayScore: 0, winner: "home" },
      { id: "q2", homeTeam: "Oviedo", homeManager: "Pedro", awayTeam: "Zaragoza", awayManager: "Fernando", homeScore: 2, awayScore: 3, winner: "away" },
      { id: "q3", homeTeam: "Celta", homeManager: "Javier", awayTeam: "Sociedad B", awayManager: "Mikel" },
      { id: "q4", homeTeam: "Getafe", homeManager: "Rubén", awayTeam: "Espanyol B", awayManager: "Marc" },
    ],
  },
  {
    name: "Semifinales",
    matches: [
      { id: "s1", homeTeam: "Sporting", homeManager: "Diego", awayTeam: "Zaragoza", awayManager: "Fernando" },
      { id: "s2", homeTeam: "TBD", homeManager: "-", awayTeam: "TBD", awayManager: "-" },
    ],
  },
  {
    name: "Final",
    matches: [{ id: "f1", homeTeam: "TBD", homeManager: "-", awayTeam: "TBD", awayManager: "-" }],
  },
]

const brackets: Record<string, { name: string; color: string; data: BracketRound[] }> = {
  "copa-kempes": { name: "Copa Kempes", color: "primary", data: copaKempesBracket },
  "copa-oro": { name: "Copa de Oro", color: "primary", data: copaOroBracket },
  "copa-plata": { name: "Copa de Plata", color: "muted-foreground", data: copaPlataBracket },
}

interface BracketViewProps {
  selectedCompetition: string
}

export function BracketView({ selectedCompetition }: BracketViewProps) {
  const [activeCup, setActiveCup] = useState(
    selectedCompetition !== "all" && brackets[selectedCompetition] ? selectedCompetition : "copa-kempes",
  )

  const currentBracket = brackets[activeCup]
  const matchHeight = 80
  const matchGap = 12

  return (
    <div className="space-y-6">
      {/* Cup Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{currentBracket.name}</h2>
            <p className="text-sm text-muted-foreground">Temporada 2025/26</p>
          </div>
        </div>

        <Select value={activeCup} onValueChange={setActiveCup}>
          <SelectTrigger className="w-48 bg-secondary/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="copa-kempes">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Copa Kempes
              </div>
            </SelectItem>
            <SelectItem value="copa-oro">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                Copa de Oro
              </div>
            </SelectItem>
            <SelectItem value="copa-plata">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                Copa de Plata
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bracket Visualization */}
      <Card className="bg-card border-border p-6 overflow-x-auto">
        <div className="flex items-start min-w-max gap-0">
          {currentBracket.data.map((round, roundIndex) => {
            const isLastRound = roundIndex === currentBracket.data.length - 1
            const spacing = Math.pow(2, roundIndex)
            const gapBetweenMatches = spacing * (matchHeight + matchGap) - matchHeight
            const topPadding = roundIndex === 0 ? 0 : (Math.pow(2, roundIndex) - 1) * (matchHeight + matchGap) / 2

            return (
              <div key={round.name} className="flex items-start">
                {/* Round Column */}
                <div className="flex flex-col" style={{ width: 200 }}>
                  {/* Round Header */}
                  <div className="text-center mb-4 h-8 flex items-center justify-center">
                    <Badge
                      variant={isLastRound ? "default" : "outline"}
                      className={`${isLastRound ? "bg-primary text-primary-foreground" : ""} px-3 py-1`}
                    >
                      {round.name}
                    </Badge>
                  </div>

                  {/* Matches */}
                  <div
                    className="flex flex-col"
                    style={{
                      gap: gapBetweenMatches,
                      paddingTop: topPadding,
                    }}
                  >
                    {round.matches.map((match) => (
                      <BracketMatchCard
                        key={match.id}
                        match={match}
                        isFinal={isLastRound}
                        height={matchHeight}
                      />
                    ))}
                  </div>
                </div>

                {/* Connector Lines */}
                {!isLastRound && (
                  <div className="flex flex-col" style={{ paddingTop: topPadding + 8 + 4, width: 32 }}>
                    {round.matches.map((_, matchIndex) => {
                      if (matchIndex % 2 === 1) return null
                      const connectorHeight = spacing * (matchHeight + matchGap)
                      return (
                        <BracketConnector 
                          key={matchIndex} 
                          height={connectorHeight} 
                          matchHeight={matchHeight}
                          gapBetweenMatches={gapBetweenMatches}
                          isFirst={matchIndex === 0}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span>Ganador / Clasificado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-border" />
          <span>Por definir (TBD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span>Empate (pendiente desempate)</span>
        </div>
      </div>
    </div>
  )
}

function BracketConnector({ 
  height, 
  matchHeight,
  gapBetweenMatches,
  isFirst
}: { 
  height: number
  matchHeight: number
  gapBetweenMatches: number
  isFirst: boolean
}) {
  // Calculate exact positions for the connector lines
  // Lines should come from the MIDDLE of each match card
  const halfMatch = matchHeight / 2
  const totalPairHeight = matchHeight * 2 + gapBetweenMatches
  const middlePoint = halfMatch + (matchHeight + gapBetweenMatches) / 2

  return (
    <div className="relative" style={{ height: totalPairHeight, marginBottom: gapBetweenMatches }}>
      {/* Top match horizontal line - from middle of top card */}
      <div
        className="absolute bg-border"
        style={{
          left: 0,
          top: halfMatch,
          width: 16,
          height: 2,
        }}
      />
      {/* Vertical line connecting both matches - from middle of top to middle of bottom */}
      <div
        className="absolute bg-border"
        style={{
          left: 15,
          top: halfMatch,
          width: 2,
          height: matchHeight + gapBetweenMatches,
        }}
      />
      {/* Bottom match horizontal line - from middle of bottom card */}
      <div
        className="absolute bg-border"
        style={{
          left: 0,
          top: matchHeight + gapBetweenMatches + halfMatch,
          width: 16,
          height: 2,
        }}
      />
      {/* Middle horizontal line going to next round - from center of vertical line */}
      <div
        className="absolute bg-border"
        style={{
          left: 16,
          top: middlePoint,
          width: 16,
          height: 2,
        }}
      />
    </div>
  )
}

function BracketMatchCard({
  match,
  isFinal,
  height,
}: {
  match: BracketMatch
  isFinal: boolean
  height: number
}) {
  const isPlayed = match.homeScore !== undefined && match.awayScore !== undefined
  const isDraw = isPlayed && match.homeScore === match.awayScore
  const isTBD = match.homeTeam === "TBD" || match.awayTeam === "TBD"

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all hover:shadow-md ${
        isFinal
          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20"
          : "border-border bg-card hover:border-primary/30"
      }`}
      style={{ height }}
    >
      {/* Final Trophy Icon */}
      {isFinal && (
        <div className="bg-primary/20 px-2 py-1 flex items-center justify-center gap-1.5 border-b border-primary/20">
          <Trophy className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">FINAL</span>
        </div>
      )}

      {/* Home Team */}
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 transition-colors ${
          match.winner === "home" ? "bg-success/10" : "hover:bg-secondary/30"
        }`}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {match.winner === "home" && <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />}
          <div className="min-w-0">
            <p
              className={`text-xs font-medium truncate ${
                isTBD ? "text-muted-foreground/50 italic" : match.winner === "home" ? "text-success" : "text-foreground"
              }`}
            >
              {match.homeTeam}
            </p>
            {!isTBD && <p className="text-[9px] text-muted-foreground truncate">{match.homeManager}</p>}
          </div>
        </div>
        <div className="flex-shrink-0 ml-1">
          {isPlayed ? (
            <span
              className={`text-sm font-bold tabular-nums ${
                match.winner === "home" ? "text-success" : isDraw ? "text-warning" : "text-foreground"
              }`}
            >
              {match.homeScore}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/30">-</span>
          )}
        </div>
      </div>

      {/* Away Team */}
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 transition-colors ${
          match.winner === "away" ? "bg-success/10" : "hover:bg-secondary/30"
        }`}
        style={{ height: isFinal ? (height - 24) / 2 : height / 2 }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {match.winner === "away" && <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />}
          <div className="min-w-0">
            <p
              className={`text-xs font-medium truncate ${
                isTBD ? "text-muted-foreground/50 italic" : match.winner === "away" ? "text-success" : "text-foreground"
              }`}
            >
              {match.awayTeam}
            </p>
            {!isTBD && <p className="text-[9px] text-muted-foreground truncate">{match.awayManager}</p>}
          </div>
        </div>
        <div className="flex-shrink-0 ml-1">
          {isPlayed ? (
            <span
              className={`text-sm font-bold tabular-nums ${
                match.winner === "away" ? "text-success" : isDraw ? "text-warning" : "text-foreground"
              }`}
            >
              {match.awayScore}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/30">-</span>
          )}
        </div>
      </div>
    </div>
  )
}
