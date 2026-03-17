import api from './api'

export interface PlazoScopeDTO {
  id: string
  competitionId: string
  matchdayFrom: number | null
  matchdayTo: number | null
  knockoutRounds: string[]
  competition?: {
    id: string
    name: string
    system: string
  }
}

export interface PlazoDTO {
  id: string
  seasonHalfId: string
  title: string
  deadline: string
  order: number
  isOpen: boolean
  createdAt: string
  updatedAt: string
  seasonHalf?: {
    id: string
    halfType: string
    seasonId: string
  }
  scopes: PlazoScopeDTO[]
  stats?: {
    total: number
    pending: number
    finalized: number
    cancelled: number
  }
  isOverdue: boolean
}

export interface CreatePlazoInput {
  seasonHalfId: string
  title: string
  deadline: string
  order: number
  isOpen?: boolean
  scopes: Array<{
    competitionId: string
    matchdayFrom?: number | null
    matchdayTo?: number | null
    knockoutRounds?: string[]
  }>
}

export interface UpdatePlazoInput {
  title?: string
  deadline?: string
  order?: number
  scopes?: Array<{
    competitionId: string
    matchdayFrom?: number | null
    matchdayTo?: number | null
    knockoutRounds?: string[]
  }>
}

export interface OverdueMatch {
  id: string
  matchdayOrder: number
  status: string
  homeClub: { id: string; name: string; logo: string | null } | null
  awayClub: { id: string; name: string; logo: string | null } | null
  competition: {
    id: string
    name: string
    competitionType: { name: string; category: string }
  }
}

export interface OverduePlazo {
  id: string
  title: string
  deadline: string
  order: number
  seasonHalf: { halfType: string }
  matches: OverdueMatch[]
}

export interface OverdueClubReport {
  club: { id: string; name: string; logo: string | null }
  totalOverdue: number
  totalPending: number
  totalLatePlayed: number
  plazos: Array<{
    plazoId: string
    title: string
    deadline: string
    matches: Array<{
      id: string
      rival: { id: string; name: string; logo: string | null }
      competition: string
      competitionFormat: string
      matchdayOrder: number
      knockoutRound: string | null
      isHome: boolean
      overdueStatus: 'SIN_DISPUTAR' | 'JUGADO_TARDE'
      score: { home: number; away: number } | null
    }>
  }>
}

export interface OverdueReport {
  summary: {
    totalOverdueMatches: number
    totalPending: number
    totalLatePlayed: number
    affectedClubs: number
  }
  clubs: OverdueClubReport[]
}

export class PlazoService {
  static async getBySeasonHalf(seasonHalfId: string): Promise<PlazoDTO[]> {
    try {
      const response = await api.get<{ data: PlazoDTO[] }>(`/api/v1/plazos/season-half/${seasonHalfId}`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching plazos')
    }
  }

  static async getBySeason(seasonId: string): Promise<PlazoDTO[]> {
    try {
      const response = await api.get<{ data: PlazoDTO[] }>(`/api/v1/plazos/season/${seasonId}`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching plazos')
    }
  }

  static async getById(id: string): Promise<PlazoDTO> {
    try {
      const response = await api.get<{ data: PlazoDTO }>(`/api/v1/plazos/${id}`)
      return response.data?.data as PlazoDTO
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching plazo')
    }
  }

  static async create(input: CreatePlazoInput): Promise<PlazoDTO> {
    try {
      const response = await api.post<{ data: PlazoDTO }>('/api/v1/plazos', input)
      return response.data?.data as PlazoDTO
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating plazo')
    }
  }

  static async update(id: string, input: UpdatePlazoInput): Promise<PlazoDTO> {
    try {
      const response = await api.patch<{ data: PlazoDTO }>(`/api/v1/plazos/${id}`, input)
      return response.data?.data as PlazoDTO
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating plazo')
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/plazos/${id}`)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting plazo')
    }
  }

  static async reassignAll(seasonHalfId: string): Promise<{ plazosProcessed: number; matchesAssigned: number }> {
    try {
      const response = await api.post<{ data: { plazosProcessed: number; matchesAssigned: number } }>(
        `/api/v1/plazos/season-half/${seasonHalfId}/reassign`
      )
      return response.data?.data as { plazosProcessed: number; matchesAssigned: number }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error reassigning plazos')
    }
  }

  static async toggleOpen(id: string, isOpen: boolean): Promise<PlazoDTO> {
    try {
      const response = await api.patch<{ data: PlazoDTO }>(`/api/v1/plazos/${id}/toggle`, { isOpen })
      return response.data?.data as PlazoDTO
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error toggling plazo')
    }
  }

  static async getOverdueReport(seasonId: string): Promise<OverdueReport> {
    try {
      const response = await api.get<{ data: OverdueReport }>(`/api/v1/plazos/season/${seasonId}/overdue-report`)
      return response.data?.data as OverdueReport
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching overdue report')
    }
  }
}
