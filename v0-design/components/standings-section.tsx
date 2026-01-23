import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react"

const standings = [
  {
    pos: 1,
    team: "FC Barcelona",
    manager: "xPedro_92",
    played: 23,
    won: 18,
    drawn: 3,
    lost: 2,
    gf: 54,
    ga: 18,
    gd: 36,
    pts: 57,
    form: ["W", "W", "D", "W", "W"],
    trend: "up",
  },
  {
    pos: 2,
    team: "Real Madrid",
    manager: "CR7_Legend",
    played: 23,
    won: 17,
    drawn: 4,
    lost: 2,
    gf: 51,
    ga: 15,
    gd: 36,
    pts: 55,
    form: ["W", "L", "W", "W", "W"],
    trend: "up",
  },
  {
    pos: 3,
    team: "Manchester City",
    manager: "BlueMoon_UK",
    played: 23,
    won: 16,
    drawn: 5,
    lost: 2,
    gf: 48,
    ga: 14,
    gd: 34,
    pts: 53,
    form: ["D", "W", "W", "D", "W"],
    trend: "same",
  },
  {
    pos: 4,
    team: "Bayern Munich",
    manager: "MiaSanMia",
    played: 23,
    won: 15,
    drawn: 4,
    lost: 4,
    gf: 52,
    ga: 22,
    gd: 30,
    pts: 49,
    form: ["W", "W", "L", "W", "D"],
    trend: "up",
  },
  {
    pos: 5,
    team: "Liverpool",
    manager: "YNWA_Steve",
    played: 23,
    won: 14,
    drawn: 5,
    lost: 4,
    gf: 45,
    ga: 20,
    gd: 25,
    pts: 47,
    form: ["L", "W", "W", "W", "D"],
    trend: "down",
  },
  {
    pos: 6,
    team: "PSG",
    manager: "ParisElite",
    played: 23,
    won: 13,
    drawn: 6,
    lost: 4,
    gf: 42,
    ga: 19,
    gd: 23,
    pts: 45,
    form: ["W", "D", "D", "W", "W"],
    trend: "up",
  },
  {
    pos: 7,
    team: "Inter Milan",
    manager: "NerazzurriKing",
    played: 23,
    won: 12,
    drawn: 7,
    lost: 4,
    gf: 38,
    ga: 18,
    gd: 20,
    pts: 43,
    form: ["D", "D", "W", "L", "W"],
    trend: "same",
  },
  {
    pos: 8,
    team: "Arsenal",
    manager: "Gunner_2000",
    played: 23,
    won: 12,
    drawn: 5,
    lost: 6,
    gf: 40,
    ga: 24,
    gd: 16,
    pts: 41,
    form: ["W", "L", "W", "D", "L"],
    trend: "down",
  },
]

const FormBadge = ({ result }: { result: string }) => {
  const colors = {
    W: "bg-success text-success-foreground",
    D: "bg-warning text-warning-foreground",
    L: "bg-destructive text-destructive-foreground",
  }
  return (
    <span
      className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${colors[result as keyof typeof colors]}`}
    >
      {result}
    </span>
  )
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />
  return <Minus className="w-4 h-4 text-muted-foreground" />
}

export function StandingsSection() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">League Standings</CardTitle>
            <p className="text-sm text-muted-foreground">Season 8 • Matchday 24</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
          Full Table <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">
                  #
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">
                  Team
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden md:table-cell">
                  P
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden md:table-cell">
                  W
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden md:table-cell">
                  D
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden md:table-cell">
                  L
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2 hidden lg:table-cell">
                  GD
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4">
                  PTS
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                  Form
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr
                  key={team.team}
                  className={`border-b border-border/50 hover:bg-secondary/50 transition-colors ${
                    index < 4 ? "border-l-2 border-l-success" : index < 6 ? "border-l-2 border-l-primary" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${team.pos <= 4 ? "text-success" : team.pos <= 6 ? "text-primary" : "text-foreground"}`}
                    >
                      {team.pos}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {team.team.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{team.team}</p>
                        <p className="text-xs text-muted-foreground">{team.manager}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                    {team.played}
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                    {team.won}
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                    {team.drawn}
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                    {team.lost}
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-muted-foreground hidden lg:table-cell">
                    <span className={team.gd > 0 ? "text-success" : team.gd < 0 ? "text-destructive" : ""}>
                      {team.gd > 0 ? "+" : ""}
                      {team.gd}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-bold text-foreground">{team.pts}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {team.form.map((result, i) => (
                        <FormBadge key={i} result={result} />
                      ))}
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <TrendIcon trend={team.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-success rounded-sm" />
              Champions Cup
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-primary rounded-sm" />
              Europa Cup
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-destructive rounded-sm" />
              Relegation
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
