import type { KnockoutRound } from './fixture'

/**
 * Slot en el bracket para asignación de equipos
 */
export interface BracketSlot {
  id: string                 // Ej: "QUARTERFINAL_1_home", "QUARTERFINAL_2_away"
  round: KnockoutRound
  position: number           // Posición del partido en la ronda (1-indexed)
  side: 'home' | 'away'
  isBye: boolean             // True si este slot debe quedar vacío (BYE)
}

/**
 * Estructura vacía del bracket recibida del backend
 */
export interface EmptyBracketStructure {
  bracketSize: number
  totalTeams: number
  byeCount: number
  firstRound: KnockoutRound
  rounds: { round: KnockoutRound; matchCount: number }[]
  slots: BracketSlot[]       // Solo slots de primera ronda donde se asignan equipos
  byePositions: number[]     // Posiciones de partidos con BYE (1-indexed)
}

/**
 * Placement de un equipo en un slot del bracket
 */
export interface BracketTeamPlacement {
  slotId: string
  teamId: string
}

/**
 * Equipo disponible para asignar al bracket
 */
export interface AvailableTeam {
  id: string
  name: string
  logo: string | null
  isAssigned: boolean
}

/**
 * Equipo disponible con info de grupo de origen (para Copa Oro/Plata)
 */
export interface AvailableTeamWithGroup extends AvailableTeam {
  groupName: string
  position: number  // Posición en grupo (1ro, 2do, 3ro)
}

/**
 * Partido en el bracket editor (primera ronda)
 */
export interface BracketEditorMatch {
  position: number           // 1-indexed
  homeSlot: BracketSlot
  awaySlot: BracketSlot
  homeTeam?: AvailableTeam
  awayTeam?: AvailableTeam
  isBye: boolean
}

/**
 * Estado del editor de brackets
 */
export interface BracketEditorState {
  structure: EmptyBracketStructure | null
  placements: Map<string, string>  // slotId -> teamId
  availableTeams: AvailableTeam[]
  isValid: boolean
  isLoading: boolean
}

/**
 * Props para el componente de slot droppable
 */
export interface DroppableBracketSlotProps {
  slot: BracketSlot
  team?: AvailableTeam
  onDrop: (slotId: string, teamId: string) => void
  onRemove: (slotId: string) => void
}

/**
 * Props para el panel de equipos disponibles
 */
export interface AvailableTeamsPanelProps {
  teams: AvailableTeam[]
  assignedTeamIds: Set<string>
}

/**
 * Input para crear Supercopa/Cindor con placements
 */
export interface CreateBracketCompetitionInput {
  seasonId: string
  competitionTypeId: string
  teamPlacements: BracketTeamPlacement[]
}

/**
 * Respuesta de creación de competición con fixtures
 */
export interface CreateCompetitionWithFixturesResponse {
  competitions: Array<{
    id: string
    name: string
    system: string
    competitionType: {
      id: string
      name: string
      category: string
      format: string
    }
  }>
  fixtures: Array<{
    competitionId: string
    competitionName: string
    matchesCreated: number
    totalMatches: number
  }>
}
