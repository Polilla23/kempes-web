import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Trophy, Layers, Calendar, Crown } from 'lucide-react'
import type {
  StandingsFilterState,
  Category,
  CompetitionTypeFilter,
  CompetitionOption,
} from '../_types/standings.types'

interface Season {
  id: string
  number: number
  isActive: boolean
}

interface StandingsFilterBarProps {
  filters: StandingsFilterState
  filteredCompetitions: CompetitionOption[]
  seasons: Season[]
  onSeasonChange: (seasonId: string) => void
  onCategoryChange: (category: Category) => void
  onTypeChange: (type: CompetitionTypeFilter) => void
  onCompetitionChange: (competitionId: string) => void
}

export function StandingsFilterBar({
  filters,
  filteredCompetitions,
  seasons,
  onSeasonChange,
  onCategoryChange,
  onTypeChange,
  onCompetitionChange,
}: StandingsFilterBarProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Season Select - PRIMERO */}
        <Select value={filters.selectedSeason} onValueChange={onSeasonChange}>
          <SelectTrigger className="w-[130px] bg-secondary/50 border-border">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Temporada" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id}>
                <div className="flex items-center gap-2">
                  T{season.number}
                  {season.isActive && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      Actual
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Tabs */}
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <Button
            variant={filters.selectedCategory === 'mayores' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange('mayores')}
            className="gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Mayores
          </Button>
          <Button
            variant={filters.selectedCategory === 'menores' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange('menores')}
            className="gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Kempesitas
          </Button>
          <Button
            variant={filters.selectedCategory === 'supercopa' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange('supercopa')}
            className="gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            Supercopa
          </Button>
        </div>

        {/* Type Tabs - ocultar cuando se selecciona Supercopa */}
        {filters.selectedCategory !== 'supercopa' && (
          <div className="flex bg-secondary/50 p-1 rounded-lg">
            <Button
              variant={filters.selectedType === 'liga' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('liga')}
              className="gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              Liga
            </Button>
            <Button
              variant={filters.selectedType === 'copa' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('copa')}
              className="gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              Copa
            </Button>
          </div>
        )}

        {/* Competition Select */}
        <Select
          value={filters.selectedCompetition || undefined}
          onValueChange={onCompetitionChange}
        >
          <SelectTrigger className="w-[220px] bg-secondary/50 border-border">
            <SelectValue placeholder="Seleccionar competencia" />
          </SelectTrigger>
          <SelectContent>
            {filteredCompetitions.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>
                <div className="flex items-center gap-2">
                  {comp.name}
                  {comp.format === 'CUP' && comp.system === 'KNOCKOUT' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Eliminatoria
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
