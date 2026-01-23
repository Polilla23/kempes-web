"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppLayout } from "@/components/app-layout"

const divisions = {
  mayores: [
    { id: "primera", name: "Primera División", teams: 10 },
    { id: "segunda", name: "Segunda División", teams: 10 },
    { id: "tercera", name: "Tercera División", teams: 10 },
    { id: "cuarta", name: "Cuarta División", teams: 10 },
  ],
  menores: [
    { id: "primera-m", name: "Primera División", teams: 10 },
    { id: "segunda-m", name: "Segunda División", teams: 10 },
    { id: "tercera-m", name: "Tercera División", teams: 10 },
    { id: "cuarta-m", name: "Cuarta División", teams: 10 },
  ],
}

const standingsData = [
  { pos: 1, team: "River Plate", slug: "river-plate", manager: "xPedro_92", played: 18, won: 14, drawn: 3, lost: 1, gf: 42, ga: 12, pts: 45, form: ["W", "W", "D", "W", "W"] },
  { pos: 2, team: "Boca Juniors", slug: "boca-juniors", manager: "CR7_Legend", played: 18, won: 13, drawn: 3, lost: 2, gf: 38, ga: 14, pts: 42, form: ["W", "L", "W", "W", "W"] },
  { pos: 3, team: "Racing Club", slug: "racing-club", manager: "BlueMoon_UK", played: 18, won: 12, drawn: 4, lost: 2, gf: 35, ga: 15, pts: 40, form: ["D", "W", "W", "D", "L"] },
  { pos: 4, team: "Independiente", slug: "independiente", manager: "MiaSanMia", played: 18, won: 11, drawn: 5, lost: 2, gf: 32, ga: 16, pts: 38, form: ["W", "W", "D", "W", "D"] },
  { pos: 5, team: "San Lorenzo", slug: "san-lorenzo", manager: "YNWA_Steve", played: 18, won: 10, drawn: 4, lost: 4, gf: 30, ga: 18, pts: 34, form: ["L", "W", "W", "W", "D"] },
  { pos: 6, team: "Vélez Sarsfield", slug: "velez", manager: "ParisElite", played: 18, won: 9, drawn: 5, lost: 4, gf: 28, ga: 20, pts: 32, form: ["W", "D", "L", "W", "W"] },
  { pos: 7, team: "Estudiantes", slug: "estudiantes", manager: "NerazzurriKing", played: 18, won: 8, drawn: 6, lost: 4, gf: 26, ga: 19, pts: 30, form: ["D", "D", "W", "L", "W"] },
  { pos: 8, team: "Huracán", slug: "huracan", manager: "Gunner_2000", played: 18, won: 7, drawn: 5, lost: 6, gf: 24, ga: 22, pts: 26, form: ["W", "L", "W", "D", "L"] },
  { pos: 9, team: "Argentinos Jrs", slug: "argentinos-juniors", manager: "Ajax_Fan", played: 18, won: 5, drawn: 4, lost: 9, gf: 18, ga: 28, pts: 19, form: ["L", "L", "D", "W", "L"] },
  { pos: 10, team: "Lanús", slug: "lanus", manager: "Celtic_Pride", played: 18, won: 3, drawn: 3, lost: 12, gf: 14, ga: 35, pts: 12, form: ["L", "D", "L", "L", "L"] },
]

const FormBadge = ({ result }: { result: string }) => {
  const colors = {
    W: "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30",
    D: "bg-amber-500/20 text-amber-500 border border-amber-500/30",
    L: "bg-red-500/20 text-red-500 border border-red-500/30",
  }
  return (
    <span className={cn("w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center", colors[result as keyof typeof colors])}>
      {result}
    </span>
  )
}

export function StandingsPageContent() {
  const [category, setCategory] = useState<"mayores" | "menores">("mayores")
  const [division, setDivision] = useState("primera")
  const [season, setSeason] = useState("8")

  return (
    <AppLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clasificaciones</h1>
            <p className="text-muted-foreground">Tablas de posiciones de todas las competencias</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-[140px] bg-card border-border">
                <SelectValue placeholder="Temporada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8">Temporada 8</SelectItem>
                <SelectItem value="7">Temporada 7</SelectItem>
                <SelectItem value="6">Temporada 6</SelectItem>
                <SelectItem value="5">Temporada 5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as "mayores" | "menores")} className="mb-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="mayores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Mayores
            </TabsTrigger>
            <TabsTrigger value="menores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Menores
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Division Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {divisions[category].map((div) => (
            <button
              key={div.id}
              onClick={() => setDivision(div.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                division === div.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              )}
            >
              {div.name}
            </button>
          ))}
        </div>

        {/* Main Standings Table */}
        <Card className="bg-card border-border mb-8">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>{divisions[category].find((d) => d.id === division)?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {category === "mayores" ? "Mayores" : "Menores"} - Temporada {season}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4 w-14">#</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">Equipo</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">PJ</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">PG</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">PE</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">PP</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">GF</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">GC</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-3">DIF</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4">PTS</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-4 px-4 hidden md:table-cell">Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {standingsData.map((team, index) => (
                    <tr
                      key={team.team}
                      className={cn(
                        "border-b border-border/50 hover:bg-secondary/30 transition-colors group",
                        index < 2 && "border-l-2 border-l-emerald-500",
                        index >= standingsData.length - 2 && "border-l-2 border-l-red-500"
                      )}
                    >
                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          "text-muted-foreground",
                          index < 2 && "text-emerald-500",
                          index >= standingsData.length - 2 && "text-red-500"
                        )}>
                          {team.pos}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/team/${team.slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/20 transition-colors">
                            {team.team.substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{team.team}</p>
                            <p className="text-xs text-muted-foreground">{team.manager}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="text-center py-4 px-3 text-sm text-muted-foreground">{team.played}</td>
                      <td className="text-center py-4 px-3 text-sm text-muted-foreground">{team.won}</td>
                      <td className="text-center py-4 px-3 text-sm text-muted-foreground">{team.drawn}</td>
                      <td className="text-center py-4 px-3 text-sm text-muted-foreground">{team.lost}</td>
                      <td className="text-center py-4 px-3 text-sm text-muted-foreground">{team.gf}</td>
                      <td className="text-center py-4 px-3 text-sm text-muted-foreground">{team.ga}</td>
                      <td className="text-center py-4 px-3 text-sm text-muted-foreground">
                        {team.gf - team.ga > 0 ? "+" : ""}{team.gf - team.ga}
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-bold text-xl text-foreground">{team.pts}</span>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
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
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span>Ascenso</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-sm" />
                  <span>Descenso</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Más goles</p>
            <p className="font-bold text-foreground">River Plate</p>
            <p className="text-2xl font-bold text-primary">42</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Menos goles recibidos</p>
            <p className="font-bold text-foreground">River Plate</p>
            <p className="text-2xl font-bold text-emerald-500">12</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Mejor racha</p>
            <p className="font-bold text-foreground">River Plate</p>
            <p className="text-2xl font-bold text-primary">
              8 <span className="text-sm text-muted-foreground">partidos</span>
            </p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Mejor diferencia</p>
            <p className="font-bold text-foreground">River Plate</p>
            <p className="text-2xl font-bold text-emerald-500">+30</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
