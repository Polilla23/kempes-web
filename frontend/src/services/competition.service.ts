import api from './api'
import type {
  EmptyBracketStructure,
  BracketTeamPlacement,
  CreateCompetitionWithFixturesResponse as BracketCompetitionResponse,
} from '@/types/bracket-editor'

export interface CompetitionTypeInfo {
  id: string
  name: string
  format?: string
  category?: string
  hierarchy?: number
}

export interface Competition {
  id: string
  name: string
  seasonId: string
  competitionTypeId?: string
  system?: string // ROUND_ROBIN | KNOCKOUT
  parentCompetitionId?: string | null
  type?: CompetitionTypeInfo
  // Backend returns competitionType, but we also support type for compatibility
  competitionType?: CompetitionTypeInfo
  startDate?: string
  endDate?: string
  isActive: boolean
  rules?: any
  createdAt?: string
  updatedAt?: string
}

export interface CompetitionFormData {
  name: string
  typeId: string
  seasonId: string
  isActive: boolean
}

export interface CompetitionsResponse {
  data: Competition[]
}

export interface CompetitionResponse {
  data: Competition
}

// Response type for creating competitions with fixtures
export interface CreateCompetitionWithFixturesResponse {
  competitions: Competition[]
  fixtures: {
    competitionId: string
    competitionName: string
    matchesCreated: number
    totalMatches: number
  }[]
}

// Post-season types
export interface PostSeasonGenerationResult {
  success: boolean
  matchesCreated: number
  phases: { phase: string; matchesCreated: number }[]
}

export interface PostSeasonPhaseStatus {
  phase: string
  matches: {
    id: string
    status: string
    homeClubId: string | null
    awayClubId: string | null
    knockoutRound: string | null
  }[]
  isComplete: boolean
}

export interface PostSeasonStatus {
  regularSeasonComplete: boolean
  regularMatchesPlayed: number
  regularMatchesTotal: number
  hasPostSeason: boolean
  postSeasonGenerated: boolean
  phases: PostSeasonPhaseStatus[]
}

export interface PromotionGenerationResult {
  success: boolean
  competition: Competition
  matchesCreated: number
  upperTeams: { clubId: string; position: number }[]
  lowerTeams: { clubId: string; position: number }[]
}

class CompetitionService {
  static async getCompetitions(): Promise<CompetitionsResponse> {
    try {
      const response = await api.get<CompetitionsResponse>('/api/v1/competitions')
      return response.data || { data: [] }
    } catch (error: any) {
      console.error('Error fetching competitions:', error)
      // Return empty array instead of throwing to prevent page crash
      return { data: [] }
    }
  }

  static async getCompetition(id: string): Promise<CompetitionResponse> {
    try {
      const response = await api.get<CompetitionResponse>(`/api/v1/competitions/${id}`)
      return response.data || { data: {} as Competition }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error fetching competition')
    }
  }

  static async createCompetition(data: any): Promise<CreateCompetitionWithFixturesResponse> {
    try {
      const response = await api.post<{ data: CreateCompetitionWithFixturesResponse }>('/api/v1/competitions', data)
      return response.data?.data || { competitions: [], fixtures: [] }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error creating competition')
    }
  }

  static async updateCompetition(
    id: string,
    data: Partial<CompetitionFormData>
  ): Promise<CompetitionResponse> {
    try {
      const response = await api.patch<CompetitionResponse>(`/api/v1/competitions/${id}`, data)
      return response.data || { data: {} as Competition }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error updating competition')
    }
  }

  static async deleteCompetition(id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/competitions/${id}`)
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error deleting competition')
    }
  }

  static async createLeaguesCompetitions(data: any): Promise<CompetitionsResponse> {
    try {
      const response = await api.post<CompetitionsResponse>('/api/v1/competitions', data)
      return response.data || { data: [] }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error creating leagues')
    }
  }

  static async getActiveLeagues(): Promise<CompetitionsResponse> {
    try {
      const response = await api.get<CompetitionsResponse>('/api/v1/competitions')
      // Filtrar solo ligas activas
      const leagues =
        response.data?.data?.filter((comp) => (comp.competitionType?.format || comp.type?.format) === 'LEAGUE' && comp.isActive) || []
      return { data: leagues }
    } catch (error: any) {
      console.error('Error fetching active leagues:', error)
      return { data: [] }
    }
  }

  static async createCupCompetition(data: CreateCupPayload): Promise<CompetitionsResponse> {
    try {
      const response = await api.post<CompetitionsResponse>('/api/v1/competitions', data)
      return response.data || { data: [] }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error creating cup')
    }
  }

  // ============================================
  // BRACKET EDITOR METHODS (Supercopa & Cindor)
  // ============================================

  /**
   * Obtiene la estructura vacía del bracket para mostrar en el editor
   */
  static async getBracketStructure(teamCount: number): Promise<EmptyBracketStructure> {
    try {
      const response = await api.get<{ data: EmptyBracketStructure }>(
        `/api/v1/competitions/bracket-structure?teamCount=${teamCount}`
      )
      return response.data?.data || response.data as unknown as EmptyBracketStructure
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error getting bracket structure')
    }
  }

  /**
   * Crea una Supercopa con posicionamiento manual de equipos
   */
  static async createSupercup(data: {
    seasonId: string
    competitionTypeId: string
    teamPlacements: BracketTeamPlacement[]
  }): Promise<BracketCompetitionResponse> {
    try {
      const response = await api.post<{ data: BracketCompetitionResponse }>(
        '/api/v1/competitions/supercup',
        data
      )
      return response.data?.data || response.data as unknown as BracketCompetitionResponse
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error creating Supercup')
    }
  }

  /**
   * Crea una Copa Cindor con posicionamiento manual de equipos
   */
  static async createCindor(data: {
    seasonId: string
    competitionTypeId: string
    teamPlacements: BracketTeamPlacement[]
  }): Promise<BracketCompetitionResponse> {
    try {
      const response = await api.post<{ data: BracketCompetitionResponse }>(
        '/api/v1/competitions/cindor',
        data
      )
      return response.data?.data || response.data as unknown as BracketCompetitionResponse
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error creating Copa Cindor')
    }
  }

  // ============================================
  // POST-SEASON METHODS
  // ============================================

  /**
   * Genera los partidos de post-temporada para una liga
   */
  static async generatePostSeason(competitionId: string): Promise<PostSeasonGenerationResult> {
    try {
      const response = await api.post<{ data: PostSeasonGenerationResult }>(
        `/api/v1/competitions/${competitionId}/post-season`
      )
      return response.data?.data || response.data as unknown as PostSeasonGenerationResult
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error generating post-season')
    }
  }

  /**
   * Obtiene el estado de la post-temporada de una liga
   */
  static async getPostSeasonStatus(competitionId: string): Promise<PostSeasonStatus> {
    try {
      const response = await api.get<{ data: PostSeasonStatus }>(
        `/api/v1/competitions/${competitionId}/post-season/status`
      )
      return response.data?.data || response.data as unknown as PostSeasonStatus
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error fetching post-season status')
    }
  }

  /**
   * Genera una competencia de promociones entre dos divisiones
   */
  static async generatePromotions(data: {
    upperCompetitionId: string
    lowerCompetitionId: string
    seasonId: string
  }): Promise<PromotionGenerationResult> {
    try {
      const response = await api.post<{ data: PromotionGenerationResult }>(
        '/api/v1/competitions/promotions',
        data
      )
      return response.data?.data || response.data as unknown as PromotionGenerationResult
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error generating promotions')
    }
  }
}

// Tipos para crear copa
export interface CupGroup {
  groupName: string      // 'A', 'B', 'C', etc.
  clubIds: string[]      // IDs de los clubes en este grupo
}

export interface CreateCupPayload {
  type: 'CUP'
  activeSeason: {
    id: string
    number: number
    isActive: boolean
  }
  competitionCategory: 'SENIOR' | 'KEMPESITA'
  competitionType: {
    id: string
    name: string
  }
  numGroups: number
  teamsPerGroup: number
  qualifyToGold: number
  qualifyToSilver: number
  groups: CupGroup[]
}

export default CompetitionService
