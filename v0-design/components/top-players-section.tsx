import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Target, Shield, Sparkles } from "lucide-react"

const topScorers = [
  { rank: 1, name: "Erling Haaland", team: "Man City", manager: "BlueMoon_UK", goals: 28, assists: 5 },
  { rank: 2, name: "Kylian Mbappé", team: "Real Madrid", manager: "CR7_Legend", goals: 24, assists: 8 },
  { rank: 3, name: "Harry Kane", team: "Bayern", manager: "MiaSanMia", goals: 22, assists: 6 },
  { rank: 4, name: "Victor Osimhen", team: "Napoli", manager: "AzzurriKing", goals: 21, assists: 3 },
  { rank: 5, name: "Mohamed Salah", team: "Liverpool", manager: "YNWA_Steve", goals: 19, assists: 10 },
]

const topAssists = [
  { rank: 1, name: "Kevin De Bruyne", team: "Man City", manager: "BlueMoon_UK", assists: 16, goals: 7 },
  { rank: 2, name: "Mohamed Salah", team: "Liverpool", manager: "YNWA_Steve", assists: 10, goals: 19 },
  { rank: 3, name: "Bukayo Saka", team: "Arsenal", manager: "Gunner_2000", assists: 9, goals: 12 },
  { rank: 4, name: "Kylian Mbappé", team: "Real Madrid", manager: "CR7_Legend", assists: 8, goals: 24 },
  { rank: 5, name: "Vinicius Jr", team: "Real Madrid", manager: "CR7_Legend", assists: 8, goals: 15 },
]

const cleanSheets = [
  { rank: 1, name: "Alisson", team: "Liverpool", manager: "YNWA_Steve", cleanSheets: 14 },
  { rank: 2, name: "Ederson", team: "Man City", manager: "BlueMoon_UK", cleanSheets: 13 },
  { rank: 3, name: "Ter Stegen", team: "Barcelona", manager: "xPedro_92", cleanSheets: 12 },
  { rank: 4, name: "Mike Maignan", team: "AC Milan", manager: "RossoneriPro", cleanSheets: 11 },
  { rank: 5, name: "Thibaut Courtois", team: "Real Madrid", manager: "CR7_Legend", cleanSheets: 10 },
]

export function TopPlayersSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Top Scorers */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-foreground text-base">Top Scorers</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 p-0 h-auto">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {topScorers.map((player) => (
            <div
              key={player.rank}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  player.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {player.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground truncate">{player.team}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{player.goals}</p>
                <p className="text-xs text-muted-foreground">{player.assists} ast</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Assists */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-foreground text-base">Top Assists</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 p-0 h-auto">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {topAssists.map((player) => (
            <div
              key={player.rank}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  player.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {player.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground truncate">{player.team}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{player.assists}</p>
                <p className="text-xs text-muted-foreground">{player.goals} gls</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Clean Sheets */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-foreground text-base">Clean Sheets</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 p-0 h-auto">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {cleanSheets.map((player) => (
            <div
              key={player.rank}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  player.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {player.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                <p className="text-xs text-muted-foreground truncate">{player.team}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{player.cleanSheets}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
