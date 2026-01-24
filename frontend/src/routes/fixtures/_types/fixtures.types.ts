import type { MatchDetailedDTO } from '@/services/fixture.service'

// Categorías de competencias
export type Category = 'mayores' | 'menores' | 'supercopa'
export type CompetitionTypeFilter = 'liga' | 'copa'
export type ViewMode = 'list' | 'bracket'
export type MatchStatus = 'all' | 'played' | 'pending'

// Mapeo de categorías frontend -> backend
export const CATEGORY_MAP: Record<Category, string[]> = {
  mayores: ['SENIOR'],
  menores: ['KEMPESITA'],
  supercopa: ['MIXED'],
}

// Mapeo de formato frontend -> backend
export const FORMAT_MAP: Record<CompetitionTypeFilter, string> = {
  liga: 'LEAGUE',
  copa: 'CUP',
}

// Labels para las rondas de knockout
export const ROUND_LABELS: Record<string, string> = {
  ROUND_OF_64: '64vos de Final',
  ROUND_OF_32: '32vos de Final',
  ROUND_OF_16: 'Octavos de Final',
  QUARTERFINAL: 'Cuartos de Final',
  SEMIFINAL: 'Semifinales',
  FINAL: 'Final',
}

// Orden de rondas para bracket
export const ROUND_ORDER = [
  'ROUND_OF_64',
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTERFINAL',
  'SEMIFINAL',
  'FINAL',
]

// Estado de filtros
export interface FilterState {
  viewMode: ViewMode
  selectedSeason: string
  selectedCompetition: string // 'all' o ID específico
  selectedCategory: Category
  selectedType: CompetitionTypeFilter
  selectedStatus: MatchStatus
}

// Match extendido con información adicional para UI
export interface Match extends MatchDetailedDTO {
  events?: MatchEvent[]
}

// Evento de partido
export interface MatchEvent {
  type: 'goal' | 'yellow' | 'red' | 'own-goal' | 'assist'
  minute: number
  player: string
  team: 'home' | 'away'
  assist?: string
}

// Bracket match con winner calculado
export interface BracketMatch extends Match {
  winner?: 'home' | 'away' | 'draw'
}

// Ronda de bracket
export interface BracketRound {
  name: string
  roundKey: string
  matches: BracketMatch[]
}

// Competencia simplificada para filtros
export interface CompetitionOption {
  id: string
  name: string
  category: string
  format: string
  hierarchy: number
}

// Matches agrupados por competencia
export interface GroupedMatches {
  [competitionId: string]: {
    name: string
    matches: Match[]
  }
}
