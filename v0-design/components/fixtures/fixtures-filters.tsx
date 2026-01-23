"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, Trophy, Users, Layers } from "lucide-react"
import type { Category, CompetitionType, Competition } from "./fixtures-page-content"

interface FiltersProps {
  selectedCompetition: string
  setSelectedCompetition: (value: string) => void
  selectedCategory: Category | "all"
  setSelectedCategory: (value: Category | "all") => void
  selectedType: CompetitionType | "all"
  setSelectedType: (value: CompetitionType | "all") => void
  selectedStatus: "all" | "played" | "pending"
  setSelectedStatus: (value: "all" | "played" | "pending") => void
  competitions: Competition[]
}

export function FixturesFilters({
  selectedCompetition,
  setSelectedCompetition,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  competitions,
}: FiltersProps) {
  const filteredCompetitions = competitions.filter((comp) => {
    if (selectedCategory !== "all" && comp.category !== selectedCategory) return false
    if (selectedType !== "all" && comp.type !== selectedType) return false
    return true
  })

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">Filtros</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Categoría
          </label>
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category | "all")}>
            <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="mayores">Mayores</SelectItem>
              <SelectItem value="menores">Menores</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Tipo
          </label>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as CompetitionType | "all")}>
            <SelectTrigger className="w-[130px] bg-secondary/50 border-border">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="liga">Ligas</SelectItem>
              <SelectItem value="copa">Copas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Competition Filter */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Competencia
          </label>
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {filteredCompetitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  <div className="flex items-center gap-2">
                    {comp.name}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {comp.type === "copa" ? "Copa" : `Div ${comp.division}`}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Estado</label>
          <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as "all" | "played" | "pending")}>
            <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="played">Jugados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2 mt-4">
        {selectedCategory !== "all" && (
          <Badge variant="secondary" className="gap-1">
            {selectedCategory === "mayores" ? "Mayores" : "Menores"}
            <button onClick={() => setSelectedCategory("all")} className="ml-1 hover:text-destructive">
              ×
            </button>
          </Badge>
        )}
        {selectedType !== "all" && (
          <Badge variant="secondary" className="gap-1">
            {selectedType === "liga" ? "Ligas" : "Copas"}
            <button onClick={() => setSelectedType("all")} className="ml-1 hover:text-destructive">
              ×
            </button>
          </Badge>
        )}
        {selectedCompetition !== "all" && (
          <Badge variant="secondary" className="gap-1">
            {competitions.find((c) => c.id === selectedCompetition)?.name}
            <button onClick={() => setSelectedCompetition("all")} className="ml-1 hover:text-destructive">
              ×
            </button>
          </Badge>
        )}
      </div>
    </div>
  )
}
