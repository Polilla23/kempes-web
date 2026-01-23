import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronRight, Clock } from "lucide-react"

const fixtures = [
  {
    home: "FC Barcelona",
    away: "Real Madrid",
    homeScore: null,
    awayScore: null,
    time: "Today, 21:00",
    status: "upcoming",
    isLive: false,
  },
  { home: "Man City", away: "Liverpool", homeScore: 2, awayScore: 1, time: "67'", status: "live", isLive: true },
  {
    home: "Bayern",
    away: "PSG",
    homeScore: null,
    awayScore: null,
    time: "Tomorrow, 20:00",
    status: "upcoming",
    isLive: false,
  },
  { home: "Inter", away: "Arsenal", homeScore: 3, awayScore: 2, time: "FT", status: "finished", isLive: false },
  { home: "Juventus", away: "AC Milan", homeScore: 1, awayScore: 1, time: "FT", status: "finished", isLive: false },
]

export function FixturesSection() {
  return (
    <Card className="bg-card border-border h-fit">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Fixtures</CardTitle>
            <p className="text-sm text-muted-foreground">Matchday 24</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
          All <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {fixtures.map((fixture, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-colors ${
              fixture.isLive
                ? "bg-destructive/10 border-destructive/30"
                : "bg-secondary/50 border-border hover:border-primary/50"
            }`}
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-2">
              {fixture.isLive ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  LIVE
                </span>
              ) : fixture.status === "finished" ? (
                <span className="text-xs font-medium text-muted-foreground">FINISHED</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {fixture.time}
                </span>
              )}
              {(fixture.isLive || fixture.status === "finished") && (
                <span className="text-xs text-muted-foreground">{fixture.time}</span>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-foreground truncate">{fixture.home}</p>
              </div>
              <div className="flex items-center gap-2 px-3">
                {fixture.homeScore !== null ? (
                  <span className={`text-lg font-bold ${fixture.isLive ? "text-foreground" : "text-foreground"}`}>
                    {fixture.homeScore} - {fixture.awayScore}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">vs</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground truncate">{fixture.away}</p>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-4 border-border hover:bg-secondary bg-transparent">
          View Full Schedule
        </Button>
      </CardContent>
    </Card>
  )
}
