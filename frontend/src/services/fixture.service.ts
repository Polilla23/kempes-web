import api from './api'

export interface DirectKnockoutInput {
  competitionId: string
  teamIds: string[]
}

export interface DirectKnockoutResponse {
  success: boolean
  competitionId: string
  matchesCreated: number
  totalTeams: number
}

export class FixtureService {
  /**
   * Crea un fixture de eliminacion directa (para Copa Cindor y Supercopa)
   */
  static async createDirectKnockout(input: DirectKnockoutInput): Promise<DirectKnockoutResponse> {
    try {
      const response = await api.post<{ data: DirectKnockoutResponse }>('/api/v1/fixtures/direct-knockout', input)
      return response.data?.data as DirectKnockoutResponse
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating direct knockout fixture')
    }
  }

  /**
   * Obtiene los partidos de una competicion
   */
  static async getCompetitionMatches(competitionId: string) {
    try {
      const response = await api.get<{ data: any[] }>(`/api/v1/fixtures/competitions/${competitionId}`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching competition matches')
    }
  }

  /**
   * Obtiene el bracket knockout de una competicion
   */
  static async getKnockoutBracket(competitionId: string) {
    try {
      const response = await api.get<{ data: any[] }>(`/api/v1/fixtures/competitions/${competitionId}/knockout`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching knockout bracket')
    }
  }

  /**
   * Obtiene TODOS los partidos de una temporada en una sola llamada
   * Incluye informacion de competencia para filtrado client-side
   */
  static async getSeasonMatches(seasonId: string): Promise<MatchDetailedDTO[]> {
    try {
      const response = await api.get<{ data: MatchDetailedDTO[] }>(`/api/v1/fixtures?seasonId=${seasonId}`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season matches')
    }
  }

  // ===================== COPA KEMPES - ORO/PLATA GENERATION =====================

  /**
   * Obtiene el estado de los grupos de una Copa Kempes
   */
  static async getKempesCupGroupsStatus(competitionId: string): Promise<KempesCupGroupsStatus> {
    try {
      const response = await api.get<{ data: KempesCupGroupsStatus }>(
        `/api/v1/fixtures/kempes/${competitionId}/groups-status`
      )
      return response.data?.data as KempesCupGroupsStatus
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching groups status')
    }
  }

  /**
   * Obtiene los equipos clasificados de una Copa Kempes
   */
  static async getKempesCupQualifiedTeams(competitionId: string): Promise<KempesCupQualifiedTeams> {
    try {
      const response = await api.get<{ data: KempesCupQualifiedTeams }>(
        `/api/v1/fixtures/kempes/${competitionId}/qualified-teams`
      )
      return response.data?.data as KempesCupQualifiedTeams
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching qualified teams')
    }
  }

  /**
   * Genera Copa Oro y Copa Plata a partir de los equipos clasificados
   */
  static async generateGoldSilverCups(input: GenerateGoldSilverInput): Promise<GenerateGoldSilverResponse> {
    try {
      const response = await api.post<{ data: GenerateGoldSilverResponse }>(
        '/api/v1/fixtures/kempes/generate-gold-silver',
        input
      )
      return response.data?.data as GenerateGoldSilverResponse
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error generating gold/silver cups')
    }
  }
}

// Types for Copa Kempes endpoints
export interface TeamStanding {
  clubId: string
  clubName: string
  clubLogo?: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  position: number
  zone?: 'promotion' | 'playoff' | null
}

export interface GroupStatus {
  groupName: string
  isComplete: boolean
  matchesPlayed: number
  matchesTotal: number
  standings: TeamStanding[]
}

export interface KempesCupGroupsStatus {
  competitionId: string
  competitionName: string
  allGroupsComplete: boolean
  groups: GroupStatus[]
  qualifyToGold: number
  qualifyToSilver: number
}

export interface QualifiedTeam {
  clubId: string
  clubName: string
  clubLogo?: string
  groupName: string
  position: number
}

export interface KempesCupQualifiedTeams {
  competitionId: string
  isReady: boolean
  goldTeams: QualifiedTeam[]
  silverTeams: QualifiedTeam[]
}

export interface BracketInput {
  round: number
  position: number
  homeTeamId?: string
  awayTeamId?: string
  isBye?: boolean
}

export interface GenerateGoldSilverInput {
  kempesCupId: string
  goldBrackets: BracketInput[]
  silverBrackets: BracketInput[]
}

export interface GenerateGoldSilverResponse {
  success: boolean
  goldCup: {
    id: string
    name: string
    teamsCount: number
    matchesCreated: number
  }
  silverCup: {
    id: string
    name: string
    teamsCount: number
    matchesCreated: number
  } | null
}

// Match con información de competencia para filtrado en frontend
export interface MatchDetailedDTO {
  id: string
  competitionId: string
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
  homeClubGoals: number
  awayClubGoals: number
  status: string
  matchdayOrder: number
  stage: string | null
  knockoutRound: string | null
  homePlaceholder?: string | null
  awayPlaceholder?: string | null
  competition: {
    id: string
    name: string
    competitionType: {
      id: string
      name: string
      category: string // 'SENIOR' | 'KEMPESITA' | 'MIXED'
      format: string // 'LEAGUE' | 'CUP'
      hierarchy: number
    }
  }
}
