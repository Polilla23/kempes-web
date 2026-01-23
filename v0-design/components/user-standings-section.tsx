"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data - In production this would come from the logged-in user's league
const userLeague = {
  name: "Primera División Mayores",
  division: 1,
  category: "Mayores",
}

const standings = [
  { pos: 1, team: "River Plate", slug: "river-plate", logo: "RIV", played: 18, won: 14, drawn: 2, lost: 2, gf: 42, ga: 15, gd: 27, points: 44, form: ["W", "W", "D", "W", "W"] },
  { pos: 2, team: "Boca Juniors", slug: "boca-juniors", logo: "BOC", played: 18, won: 13, drawn: 3, lost: 2, gf: 38, ga: 14, gd: 24, points: 42, form: ["W", "L", "W", "W", "W"] },
  { pos: 3, team: "Racing Club", slug: "racing-club", logo: "RAC", played: 18, won: 12, drawn: 4, lost: 2, gf: 35, ga: 18, gd: 17, points: 40, form: ["D", "W", "W", "D", "W"], isUser: true },
  { pos: 4, team: "Independiente", slug: "independiente", logo: "IND", played: 18, won: 11, drawn: 3, lost: 4, gf: 30, ga: 20, gd: 10, points: 36, form: ["L", "W", "D", "W", "L"] },
  { pos: 5, team: "San Lorenzo", slug: "san-lorenzo", logo: "SLO", played: 18, won: 10, drawn: 4, lost: 4, gf: 28, ga: 19, gd: 9, points: 34, form: ["W", "W", "L", "D", "W"] },
  { pos: 6, team: "Vélez", slug: "velez", logo: "VEL", played: 17, won: 9, drawn: 5, lost: 3, gf: 27, ga: 17, gd: 10, points: 32, form: ["D", "D", "W", "L", "W"] },
  { pos: 7, team: "Estudiantes", slug: "estudiantes", logo: "EST", played: 17, won: 8, drawn: 4, lost: 5, gf: 25, ga: 21, gd: 4, points: 28, form: ["L", "W", "W", "D", "L"] },
  { pos: 8, team: "Huracán", slug: "huracan", logo: "HUR", played: 18, won: 7, drawn: 5, lost: 6, gf: 24, ga: 24, gd: 0, points: 26, form: ["W", "D", "L", "W", "D"] },
]

const FormBadge = ({ result }: { result: string }) => {
  const colors = {
    W: "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30",
    D: "bg-amber-500/20 text-amber-500 border border-amber-500/30",
    L: "bg-red-500/20 text-red-500 border border-red-500/30",
  }
  return (
    <span className={cn("w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center", colors[result as keyof typeof colors])}>
      {result}
    </span>
  )
}

interface UserStandingsSectionProps {
  className?: string
}

export function UserStandingsSection({ className }: UserStandingsSectionProps) {
  return (
    <Card className={cn("bg-card border-border h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">{userLeague.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Tu liga actual</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
          <Link href="/standings">
            Ver todas <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                <th className="w-10 py-3 pl-6 pr-3 text-center">#</th>
                <th className="py-3 px-3 text-left">Equipo</th>
                <th className="w-10 py-3 px-1 text-center">PJ</th>
                <th className="w-10 py-3 px-1 text-center">PG</th>
                <th className="w-10 py-3 px-1 text-center">PE</th>
                <th className="w-10 py-3 px-1 text-center">PP</th>
                <th className="w-10 py-3 px-1 text-center">GF</th>
                <th className="w-10 py-3 px-1 text-center">GC</th>
                <th className="w-12 py-3 px-1 text-center">DG</th>
                <th className="w-12 py-3 px-2 text-center">Pts</th>
                <th className="w-32 py-3 pl-2 pr-6 text-center">Forma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {standings.map((team) => (
                <tr
                  key={team.pos}
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    team.isUser && "bg-primary/10"
                  )}
                >
                  <td className="py-3 pl-6 pr-3 text-center">
                    <span className={cn(
                      "text-muted-foreground",
                      team.pos <= 2 && "text-success",
                      team.pos >= 7 && "text-destructive"
                    )}>
                      {team.pos}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Link 
                      href={`/team/${team.slug}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border shrink-0">
                        {team.logo}
                      </div>
                      <span className={cn("font-medium hover:text-primary transition-colors", team.isUser && "text-primary font-semibold")}>
                        {team.team}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 px-1 text-center text-muted-foreground">{team.played}</td>
                  <td className="py-3 px-1 text-center text-muted-foreground">{team.won}</td>
                  <td className="py-3 px-1 text-center text-muted-foreground">{team.drawn}</td>
                  <td className="py-3 px-1 text-center text-muted-foreground">{team.lost}</td>
                  <td className="py-3 px-1 text-center text-muted-foreground">{team.gf}</td>
                  <td className="py-3 px-1 text-center text-muted-foreground">{team.ga}</td>
                  <td className="py-3 px-1 text-center text-muted-foreground">
                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-foreground">{team.points}</td>
                  <td className="py-3 pl-2 pr-6">
                    <div className="flex items-center justify-center gap-1">
                      {team.form.map((result, i) => (
                        <FormBadge key={i} result={result} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 px-6 py-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Ascenso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>Descenso</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
