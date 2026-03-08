import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Trophy, Layers, Calendar, Swords } from 'lucide-react'
import type {
  FilterState,
  Category,
  CompetitionTypeFilter,
  MatchStatus,
  CompetitionOption,
} from '../_types/fixtures.types'

interface Season {
  id: string
  number: number
  isActive: boolean
}

interface FixturesFilterBarProps {
  filters: FilterState
  filteredCompetitions: CompetitionOption[]
  seasons: Season[]
  onSeasonChange: (seasonId: string) => void
  onCategoryChange: (category: Category) => void
  onTypeChange: (type: CompetitionTypeFilter) => void
  onCompetitionChange: (competitionId: string) => void
  onStatusChange: (status: MatchStatus) => void
}

export function FixturesFilterBar({
  filters,
  filteredCompetitions,
  seasons,
  onSeasonChange,
  onCategoryChange,
  onTypeChange,
  onCompetitionChange,
  onStatusChange,
}: FixturesFilterBarProps) {
  // Para Supercopa, no mostrar tabs de Liga/Copa
  const showTypeFilter = filters.selectedCategory !== 'supercopa'

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Season Select */}
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
            Menores
          </Button>
          <Button
            variant={filters.selectedCategory === 'supercopa' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange('supercopa')}
            className="gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            Supercopa
          </Button>
        </div>

        {/* Type Tabs - Solo mostrar si no es Supercopa */}
        {showTypeFilter && (
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
            <Button
              variant={filters.selectedType === 'definiciones' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('definiciones')}
              className="gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              Definiciones
            </Button>
          </div>
        )}

        {/* Competition Select */}
        <Select value={filters.selectedCompetition} onValueChange={onCompetitionChange}>
          <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
            <SelectValue placeholder="Todas las competencias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filteredCompetitions.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>
                <div className="flex items-center gap-2">
                  {comp.name}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {comp.typeName === 'PROMOTIONS'
                      ? 'Promo'
                      : comp.format === 'CUP'
                        ? 'Copa'
                        : `Div ${comp.hierarchy || ''}`}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select
          value={filters.selectedStatus}
          onValueChange={(v) => onStatusChange(v as MatchStatus)}
        >
          <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="played">Jugados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Active Filter Badge */}
      {filters.selectedCompetition !== 'all' && (
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="gap-1">
            {filteredCompetitions.find((c) => c.id === filters.selectedCompetition)?.name}
            <button
              onClick={() => onCompetitionChange('all')}
              className="ml-1 hover:text-destructive"
            >
              x
            </button>
          </Badge>
        </div>
      )}
    </div>
  )
}
