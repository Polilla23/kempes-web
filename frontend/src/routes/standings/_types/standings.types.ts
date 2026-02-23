import type { CompetitionStandings, TeamStanding } from '@/services/standings.service'

// Categorías - sin 'supercopa' porque no tiene tabla de posiciones
export type Category = 'mayores' | 'menores'
export type CompetitionTypeFilter = 'liga' | 'copa'

// Mapeo de categorías frontend -> backend
export const CATEGORY_MAP: Record<Category, string[]> = {
  mayores: ['SENIOR'],
  menores: ['KEMPESITA'],
}

// Mapeo de formato frontend -> backend
export const FORMAT_MAP: Record<CompetitionTypeFilter, string> = {
  liga: 'LEAGUE',
  copa: 'CUP',
}

// Estado de filtros
export interface StandingsFilterState {
  selectedSeason: string
  selectedCategory: Category
  selectedType: CompetitionTypeFilter
  selectedCompetition: string // competition ID o '' (vacío)
}

// Competencia para el dropdown de filtros
export interface CompetitionOption {
  id: string
  name: string
  category: string
  format: string
  hierarchy: number
  system: string // ROUND_ROBIN | KNOCKOUT
  parentCompetitionId?: string | null
}

// Grupo de copa con standings
export interface CupGroupStandings {
  groupName: string
  isComplete: boolean
  matchesPlayed: number
  matchesTotal: number
  standings: TeamStanding[]
}

// Respuesta completa de grupos de copa
export interface CupGroupsStatusResponse {
  competitionId: string
  competitionName: string
  allGroupsComplete: boolean
  groups: CupGroupStandings[]
  qualifyToGold: number
  qualifyToSilver: number
}

// Re-export para conveniencia
export type { CompetitionStandings, TeamStanding }
