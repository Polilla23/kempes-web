"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronRight, Clock, Shield, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock user's upcoming fixtures
const userFixtures = [
  {
    id: "1",
    competition: "Primera División",
    competitionType: "liga",
    matchday: "Fecha 19",
    opponent: "River Plate",
    opponentSlug: "river-plate",
    opponentLogo: "RIV",
    isHome: false,
    status: "pending",
    deadline: "3 días",
  },
  {
    id: "2",
    competition: "Copa Kempes",
    competitionType: "copa-kempes",
    matchday: "Cuartos",
    opponent: "Boca Juniors",
    opponentSlug: "boca-juniors",
    opponentLogo: "BOC",
    isHome: true,
    status: "pending",
    deadline: "5 días",
  },
  {
    id: "3",
    competition: "Primera División",
    competitionType: "liga",
    matchday: "Fecha 20",
    opponent: "San Lorenzo",
    opponentSlug: "san-lorenzo",
    opponentLogo: "SLO",
    isHome: true,
    status: "pending",
    deadline: "8 días",
  },
  {
    id: "4",
    competition: "Copa de Oro",
    competitionType: "copa-oro",
    matchday: "Octavos",
    opponent: "Estudiantes",
    opponentSlug: "estudiantes",
    opponentLogo: "EST",
    isHome: false,
    status: "pending",
    deadline: "10 días",
  },
]

const getCompetitionIcon = (type: string) => {
  switch (type) {
    case "copa-oro":
    case "copa-plata":
    case "copa-kempes":
      return Trophy
    default:
      return Shield
  }
}

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

interface UserFixturesSectionProps {
  className?: string
}

export function UserFixturesSection({ className }: UserFixturesSectionProps) {
  return (
    <Card className={cn("bg-card border-border h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Tus Partidos</CardTitle>
            <p className="text-sm text-muted-foreground">Próximos a jugar</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
          <Link href="/submit-result">
            Subir <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {userFixtures.map((fixture) => {
          const Icon = getCompetitionIcon(fixture.competitionType)
          
          return (
            <div
              key={fixture.id}
              className="bg-secondary/50 border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              {/* Competition Badge */}
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={cn("text-[10px] gap-1", getCompetitionColors(fixture.competitionType))}>
                  <Icon className="w-3 h-3" />
                  {fixture.competition} - {fixture.matchday}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {fixture.deadline}
                </div>
              </div>

              {/* Match */}
              <div className="flex items-center gap-3">
                {/* User Team (Racing) */}
                <Link 
                  href="/team/racing-club"
                  className="flex-1 flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary border border-primary/30">
                    RAC
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground hover:text-primary transition-colors">Racing Club</p>
                    <p className="text-xs text-muted-foreground">{fixture.isHome ? "Local" : "Visitante"}</p>
                  </div>
                </Link>

                {/* VS */}
                <div className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                  VS
                </div>

                {/* Opponent */}
                <Link 
                  href={`/team/${fixture.opponentSlug}`}
                  className="flex-1 flex items-center justify-end gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="text-sm text-right">
                    <p className="font-semibold text-foreground hover:text-primary transition-colors">{fixture.opponent}</p>
                    <p className="text-xs text-muted-foreground">{fixture.isHome ? "Visitante" : "Local"}</p>
                  </div>
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                    {fixture.opponentLogo}
                  </div>
                </Link>
              </div>
            </div>
          )
        })}

        {/* View All Link */}
        <div className="flex-1" />
        <Button variant="outline" className="w-full bg-transparent mt-auto" asChild>
          <Link href="/fixtures?team=racing">
            Ver todos mis partidos
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
