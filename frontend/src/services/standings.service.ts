import api from './api'

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
  zone?: 'champion' | 'promotion' | 'playoff' | 'relegation' | 'promotion_playoff' | null
}

export interface CompetitionStandings {
  competitionId: string
  competitionName: string
  seasonNumber: number
  standings: TeamStanding[]
  isComplete: boolean
  matchesPlayed: number
  matchesTotal: number
}

export interface StandingsResponse {
  data: CompetitionStandings
}

export interface SeasonStandingsResponse {
  data: CompetitionStandings[]
}

class StandingsService {
  static async getCompetitionStandings(competitionId: string): Promise<StandingsResponse> {
    try {
      const response = await api.get<StandingsResponse>(`/api/v1/standings/competitions/${competitionId}`)
      return response.data ?? { data: { competitionId: '', competitionName: '', seasonNumber: 0, standings: [], isComplete: false, matchesPlayed: 0, matchesTotal: 0 } }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error fetching standings')
    }
  }

  static async getSeasonStandings(seasonId: string): Promise<SeasonStandingsResponse> {
    try {
      const response = await api.get<SeasonStandingsResponse>(`/api/v1/standings/seasons/${seasonId}`)
      return response.data ?? { data: [] }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error fetching season standings')
    }
  }

  static async getActiveSeasonStandings(): Promise<SeasonStandingsResponse> {
    try {
      const response = await api.get<SeasonStandingsResponse>('/api/v1/standings/seasons/active')
      return response.data ?? { data: [] }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error fetching active season standings')
    }
  }
}

export default StandingsService
