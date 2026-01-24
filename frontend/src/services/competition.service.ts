import api from './api'

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

class CompetitionService {
  static async getCompetitions(): Promise<CompetitionsResponse> {
    try {
      const response = await api.get<CompetitionsResponse>('/api/v1/competitions')
      console.log('🔍 getCompetitions - axios response.data:', response.data)
      console.log('🔍 getCompetitions - competitions array:', (response.data as any)?.data)
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
      console.log('Raw API response:', response.data)
      return response.data?.data || { competitions: [], fixtures: [] }
    } catch (error: any) {
      console.error('API error:', error?.response?.data || error.message)
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
        response.data?.data?.filter((comp) => comp.type?.format === 'LEAGUE' && comp.isActive) || []
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
