// Types for fixtures page

export type RoundKey = 'R32' | 'R16' | 'QF' | 'SF' | 'F'

export interface Match {
  id: string
  matchdayOrder: number
  status: 'PENDIENTE' | 'JUGADO' | 'CANCELADO'
  stage: string
  homeClubGoals: number
  awayClubGoals: number
  homePlaceholder?: string | null // Group name (e.g., "GROUP_A") or placeholder
  awayPlaceholder?: string | null
  homeClub: {
    id: string
    name: string
    logo: string | null
  }
  awayClub: {
    id: string
    name: string
    logo: string | null
  }
}

export interface Season {
  id: string
  number: number
  isActive: boolean
}

// Liga: byDate (por fecha), byTeam (por equipo)
// Copa: byPhase (fases: grupos + knockout), bracket (solo bracket visual)
export type ViewMode = 'byDate' | 'byTeam' | 'byPhase' | 'bracket'

export type CompetitionPresentation = 'LEAGUE' | 'CUP'

export type KnockoutMatch = Match & {
  knockoutRound?: string | null
  homeSourceMatch?: Pick<Match, 'id' | 'homeClub' | 'awayClub'> | null
  awaySourceMatch?: Pick<Match, 'id' | 'homeClub' | 'awayClub'> | null
  homeSourceMatchId?: string | null
  awaySourceMatchId?: string | null
}

export type KnockoutResponse = {
  data: KnockoutMatch[]
  message?: string
  timestamp: string
}

export type BracketColumn = {
  key: RoundKey
  label: string
  matches: KnockoutMatch[]
}

export type BracketSlotCell = {
  kind: 'match' | 'spacer'
  match?: KnockoutMatch
  connector?: boolean
}

export type BracketNode = {
  id: string
  round: RoundKey
  match: KnockoutMatch
  colIndex: number
  rowIndex: number
}

export type BracketEdge = {
  fromId: string
  toId: string
}

export type BracketGridColumn = BracketColumn & {
  cells: BracketSlotCell[]
}

export type BracketGrid = {
  columns: BracketGridColumn[]
  rows: number
}

export const phaseLabels: Array<{ key: string; label: string; order: number }> = [
  { key: 'FINAL', label: 'Final', order: 6 },
  { key: 'THIRD_PLACE', label: 'Tercer Puesto', order: 5 },
  { key: 'SEMIFINAL', label: 'Semifinal', order: 4 },
  { key: 'QUARTER', label: 'Cuartos de Final', order: 3 },
  { key: 'ROUND_OF_16', label: 'Octavos de Final', order: 2 },
  { key: 'ROUND_OF_32', label: '32avos de Final', order: 1 },
]
