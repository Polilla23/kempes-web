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
  zone?: 'champion' | 'liguilla' | 'triangular'
    | 'promotion' | 'promotion_playoff'
    | 'playout' | 'relegation' | 'relegation_playoff'
    | 'reducido' | 'playoff'
    | 'gold_cup' | 'silver_cup' | null
}

export interface ReducidoRound {
  type: 'start' | 'waiting'
  positions?: [number, number]
  waitingPosition?: number
  roundName: string
}

export interface ZoneDescription {
  zone: string
  positions: number[]
  detail?: string
  reducidoRounds?: ReducidoRound[]
}

export interface CompetitionStandings {
  competitionId: string
  competitionName: string
  seasonNumber: number
  standings: TeamStanding[]
  isComplete: boolean
  matchesPlayed: number
  matchesTotal: number
  leaguePosition?: 'TOP' | 'MIDDLE' | 'BOTTOM' | null
  activeZones?: string[]
  zoneDescriptions?: ZoneDescription[]
}

export interface CupGroupStandings {
  groupName: string
  isComplete: boolean
  matchesPlayed: number
  matchesTotal: number
  standings: TeamStanding[]
}

export interface CupGroupsStatusResponse {
  competitionId: string
  competitionName: string
  allGroupsComplete: boolean
  groups: CupGroupStandings[]
  qualifyToGold: number
  qualifyToSilver: number
}

export interface StandingsResponse {
  data: CompetitionStandings
}

export interface SeasonStandingsResponse {
  data: CompetitionStandings[]
}

export interface CupGroupStandingsResponse {
  data: CupGroupsStatusResponse
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

  static async getCupGroupStandings(competitionId: string): Promise<CupGroupStandingsResponse> {
    try {
      const response = await api.get<CupGroupStandingsResponse>(
        `/api/v1/standings/competitions/${competitionId}/groups`
      )
      return response.data ?? { data: { competitionId: '', competitionName: '', allGroupsComplete: false, groups: [], qualifyToGold: 0, qualifyToSilver: 0 } }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Error fetching cup group standings')
    }
  }
}

export default StandingsService
