import type { CompetitionStandings, TeamStanding, ZoneDescription } from '@/services/standings.service'
import type { MatchDetailedDTO } from '@/services/fixture.service'

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

// === Tipos de Bracket (knockout) ===

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

// Match base extendido
export interface Match extends MatchDetailedDTO {
  events?: Array<{
    type: 'goal' | 'yellow' | 'red' | 'injury' | 'mvp'
    player: string
    team: 'home' | 'away'
  }>
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

// Re-export para conveniencia
export type { CompetitionStandings, TeamStanding, ZoneDescription } from '@/services/standings.service'
