"use client"

import { useState } from "react"
import { FixturesFilters } from "./fixtures-filters"
import { FixturesListView } from "./fixtures-list-view"
import { BracketView } from "./bracket-view"
import { Button } from "@/components/ui/button"
import { List, GitBranch } from "lucide-react"

export type ViewMode = "list" | "bracket"
export type Category = "mayores" | "menores"
export type CompetitionType = "liga" | "copa"

export interface Competition {
  id: string
  name: string
  type: CompetitionType
  category: Category
  division?: number
  hasKnockout: boolean
}

export const competitions: Competition[] = [
  // Mayores - Ligas
  {
    id: "liga-mayores-1",
    name: "Primera División",
    type: "liga",
    category: "mayores",
    division: 1,
    hasKnockout: false,
  },
  {
    id: "liga-mayores-2",
    name: "Segunda División",
    type: "liga",
    category: "mayores",
    division: 2,
    hasKnockout: false,
  },
  {
    id: "liga-mayores-3",
    name: "Tercera División",
    type: "liga",
    category: "mayores",
    division: 3,
    hasKnockout: false,
  },
  { id: "liga-mayores-4", name: "Cuarta División", type: "liga", category: "mayores", division: 4, hasKnockout: false },
  // Mayores - Copas
  { id: "copa-kempes", name: "Copa Kempes", type: "copa", category: "mayores", hasKnockout: true },
  { id: "copa-oro", name: "Copa de Oro", type: "copa", category: "mayores", hasKnockout: true },
  { id: "copa-plata", name: "Copa de Plata", type: "copa", category: "mayores", hasKnockout: true },
  // Menores - Ligas
  {
    id: "liga-menores-1",
    name: "Primera División Menores",
    type: "liga",
    category: "menores",
    division: 1,
    hasKnockout: false,
  },
  {
    id: "liga-menores-2",
    name: "Segunda División Menores",
    type: "liga",
    category: "menores",
    division: 2,
    hasKnockout: false,
  },
  {
    id: "liga-menores-3",
    name: "Tercera División Menores",
    type: "liga",
    category: "menores",
    division: 3,
    hasKnockout: false,
  },
  {
    id: "liga-menores-4",
    name: "Cuarta División Menores",
    type: "liga",
    category: "menores",
    division: 4,
    hasKnockout: false,
  },
  // Menores - Copas
  { id: "copa-menores", name: "Copa Menores", type: "copa", category: "menores", hasKnockout: true },
]

export function FixturesPageContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all")
  const [selectedType, setSelectedType] = useState<CompetitionType | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<"all" | "played" | "pending">("all")

  const currentCompetition = competitions.find((c) => c.id === selectedCompetition)
  const showBracketOption = currentCompetition?.hasKnockout || false

  return (
    <div className="py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fixtures & Results</h1>
          <p className="text-muted-foreground mt-1">Todos los partidos de la temporada 2025/26</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            Lista
          </Button>
          <Button
            variant={viewMode === "bracket" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("bracket")}
            disabled={!showBracketOption && selectedCompetition !== "all"}
            className="gap-2"
          >
            <GitBranch className="w-4 h-4" />
            Brackets
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FixturesFilters
        selectedCompetition={selectedCompetition}
        setSelectedCompetition={setSelectedCompetition}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        competitions={competitions}
      />

      {/* Content */}
      {viewMode === "list" ? (
        <FixturesListView
          selectedCompetition={selectedCompetition}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
        />
      ) : (
        <BracketView selectedCompetition={selectedCompetition} />
      )}
    </div>
  )
}
