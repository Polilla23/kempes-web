// Tipos para el sistema de fixtures (ligas y copas)
// Alineados con los tipos del backend

// Rondas de knockout (debe coincidir con el enum del backend)
export type KnockoutRound =
  | 'ROUND_OF_64'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTERFINAL'
  | 'SEMIFINAL'
  | 'FINAL'

export interface Competition {
  id: string
  name: string
  competitionTypeId: string
  competitionType: {
    id: string
    name: 'LEAGUE' | 'CUP'
  }
  seasonId: string
  isActive: boolean
}

// Tipos basados en el backend
export type LeaguePosition = 'TOP' | 'MIDDLE' | 'BOTTOM'

export type CompetitionCategory = 'SENIOR' | 'KEMPESITA'

export type LeaguePlayoffType = 'TOP_3_FINALS' | 'TOP_4_CROSS'

export type LeaguePlayoutType = '5_VS_6' | '4_VS_5'

export type RoundType = 'match' | 'match_and_rematch'

export interface MatchIndexes {
  a_team_rank_index: number
  b_team_rank_index: number
}

export interface Season {
  id: string
  number: number
  isActive: boolean
}

export interface CompetitionType {
  id: string
  name: string
  category: CompetitionCategory
  format: string
}

// Configuraciones de liga según posición (del backend)
export interface TopLeagueRules {
  active_league: CompetitionType
  league_position: 'TOP'
  firstIsChampion: boolean
  roundType: RoundType
  clubIds: string[] // IDs de clubes asignados a esta liga
  topPlayoffs?: { type: 'TOP_3_FINALS' | 'TOP_4_CROSS'; teams_index: number[] }
  playouts?: { type: '5_VS_6' | '4_VS_5'; teams_index: number[] }
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: { a_team_rank_index: number; b_team_rank_index: number }[] }
  }
}

export interface MiddleLeagueRules {
  active_league: CompetitionType
  league_position: 'MIDDLE'
  roundType: RoundType
  clubIds: string[] // IDs de clubes asignados a esta liga
  playouts?: { type: '5_VS_6' | '4_VS_5'; teams_index: number[] }
  promotions: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: { a_team_rank_index: number; b_team_rank_index: number }[] }
  }
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: { a_team_rank_index: number; b_team_rank_index: number }[] }
  }
}

export interface BottomLeagueRules {
  active_league: CompetitionType
  league_position: 'BOTTOM'
  roundType: RoundType
  clubIds: string[] // IDs de clubes asignados a esta liga
  promotions: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: { a_team_rank_index: number; b_team_rank_index: number }[] }
  }
  playons: {
    direct_to_final_team_index: number
    direct_to_semifinal_team_index: number
    quarterfinal_teams_index: number[]
  }
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: { a_team_rank_index: number; b_team_rank_index: number }[] }
  }
}

// Tipo unión de todas las reglas de liga
export type LeagueRules = TopLeagueRules | MiddleLeagueRules | BottomLeagueRules

// Estructura completa que espera el backend para crear ligas
export interface LeaguesRules {
  type: 'LEAGUES'
  activeSeason: Season
  competitionCategory: CompetitionCategory
  leagues: LeagueRules[]
}

// Estructura para crear una Copa Kempes
export interface KempesCupRules {
  type: 'CUP'
  activeSeason: Season
  competitionCategory: CompetitionCategory
  competitionType: CompetitionType
  numGroups: number
  teamsPerGroup: number
  qualifyToGold: number
  qualifyToSilver: number
}

export type CompetitionRules = LeaguesRules | KempesCupRules

// Configuración simplificada para el wizard del frontend
export interface LeagueConfig {
  competitionId: string
  competitionName: string
  league_position: LeaguePosition
  roundType: RoundType

  // Campos específicos según posición
  firstIsChampion?: boolean // Solo para TOP

  // Promociones (para MIDDLE y BOTTOM)
  directPromotions?: number
  playoffPromotions?: number

  // Descensos/Relegaciones (para TOP y MIDDLE)
  directRelegations?: number
  playoffRelegations?: number

  // Playoffs top (para TOP)
  topPlayoffType?: LeaguePlayoffType

  // Playouts (para TOP y MIDDLE)
  playoutType?: LeaguePlayoutType
}

export interface TeamAssignment {
  [leagueId: string]: string[] // leagueId -> array of clubIds
}

export interface AvailableTeam {
  id: string
  name: string
  logo?: string
  isAssigned: boolean // Para validar que no esté en 2 ligas
  assignedToLeague?: string // ID de la liga a la que está asignado
}

// Configuración para la creación de ligas en el paso 1 del wizard
export interface LeagueCreationConfig {
  id: string // ID temporal para el wizard
  name: string // Nombre display de la liga (ej: "Liga A - S1")
  letter: string // Letra de la liga (A, B, C, etc.)
  position: LeaguePosition // TOP, MIDDLE, BOTTOM
  competitionType: CompetitionType // Datos del CompetitionType a crear
  roundType: RoundType
  firstIsChampion?: boolean // Solo para TOP
  directPromotions: number
  playoffPromotions: number
  directRelegations: number
  playoffRelegations: number
  hasPlayoutForLastPromotion: boolean
}

export interface LeagueWizardState {
  currentStep: 0 | 1 | 2 | 3
  // Step 0: Category and league selection
  selectedCategory?: CompetitionCategory
  selectedLeagues?: string[] // Array de letras: ['A', 'B', 'C']
  createdCompetitionTypes?: CompetitionType[] // CompetitionTypes creados en Step 0
  // Step 1 y siguientes
  seasonId?: string
  seasonNumber?: number
  activeSeason?: Season
  competitionCategory?: CompetitionCategory
  leagueCreationConfigs?: LeagueCreationConfig[] // Ligas configuradas en paso 1
  selectedCompetitions: Competition[] // Ya no se usa, las ligas se crean en paso 1
  leagueConfigs: LeagueConfig[]
  teamAssignments: TeamAssignment
  availableTeams: AvailableTeam[]
  isValid: boolean // Validación global
}

// Configuración de una Copa
export interface CupConfig {
  numGroups: number // 2-6 grupos
  teamsPerGroup: number // Equipos por grupo
  qualifyToGold: number // Equipos que clasifican a copa de oro
  qualifyToSilver: number // Equipos que clasifican a copa de plata
}

// Asignación de equipos a grupos
export interface GroupAssignment {
  [groupId: string]: AvailableTeam[] // groupId (A, B, C, etc.) -> array of teams
}

// Estado del wizard de Copas
export interface CupWizardState {
  currentStep: 1 | 2 | 3
  numGroups: number
  teamsPerGroup: number
  qualifyToGold: number
  qualifyToSilver: number
  groupAssignments: GroupAssignment
  availableTeams: AvailableTeam[]
  isValid: boolean
  // Información necesaria para crear la copa
  activeSeason?: Season
  competitionCategory?: CompetitionCategory
  competitionType?: CompetitionType  // Tipo de competición (COPA_KEMPES, etc.)
}

export interface StepConfig {
  id: number
  label: string
  description: string
  isComplete: boolean
  isActive: boolean
}

// Tipos para el preview de fixtures
export interface FixturePreview {
  leagueId: string
  leagueName: string
  totalTeams: number
  totalMatches: number
  matchesPerRound: number
  totalRounds: number
  rounds: FixtureRoundPreview[]
}

export interface FixtureRoundPreview {
  roundNumber: number
  matches: FixtureMatchPreview[]
}

export interface FixtureMatchPreview {
  homeTeam: string
  awayTeam: string
  homeTeamId: string
  awayTeamId: string
}

// Request para crear fixtures en el backend (debe coincidir con LeagueFixtureInput del backend)
export interface LeagueFixtureInput {
  competitionId: string
  clubIds: string[] // List of club IDs participating in the league
  roundType: RoundType // 'match' | 'match_and_rematch'
}

// Tipos para movimientos de equipos entre temporadas
export type MovementType =
  | 'CHAMPION'
  | 'DIRECT_PROMOTION'
  | 'PLAYOFF_PROMOTION'
  | 'DIRECT_RELEGATION'
  | 'PLAYOFF_RELEGATION'
  | 'STAYED'

export interface TeamMovement {
  clubId: string
  clubName: string
  fromLeague: string // hierarchy o nombre
  toLeague?: string // hierarchy o nombre (undefined si no cambia)
  movementType: MovementType
  reason?: string
}

export interface AvailableTeamWithMovement extends AvailableTeam {
  movement?: TeamMovement
  previousLeague?: string // Nombre de la liga anterior
}
