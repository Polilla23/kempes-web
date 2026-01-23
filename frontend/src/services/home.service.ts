import api from './api'

// Types for home page data
export interface SeasonStats {
  seasonNumber: number
  seasonId?: string
  playedMatches: number
  pendingMatches: number
  cancelledMatches: number
  totalTransfers: number
}

export interface UserClub {
  id: string
  name: string
  logo: string | null
  isActive: boolean
  playersOwned: number
  playersActive: number
}

export interface CompetitionType {
  id: string
  name: string
  category: string
  hierarchy: number
  format: string
}

export interface Competition {
  id: string
  name: string
  system: string
  competitionType: CompetitionType
  season: {
    id: string
    number: number
  }
}

export interface StandingEntry {
  position: number
  clubId: string
  clubName: string
  clubLogo: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface UserLeague {
  competition: Competition
  standings: StandingEntry[]
  userPosition: {
    position: number
    points: number
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
  } | null
  isComplete: boolean
  matchesPlayed: number
  matchesTotal: number
}

export interface Club {
  id: string
  name: string
  logo: string | null
}

export interface MatchCompetition {
  id: string
  name: string
  competitionType: CompetitionType
}

export interface RecentMatch {
  id: string
  matchdayOrder: number
  status: string
  stage: string
  knockoutRound: string | null
  homeClub: Club
  awayClub: Club
  homeClubGoals: number
  awayClubGoals: number
  competition: MatchCompetition
}

export interface UserMatch extends RecentMatch {
  isUserHome: boolean
  result: 'W' | 'D' | 'L'
}

export interface UpcomingMatch {
  id: string
  matchdayOrder: number
  status: string
  stage: string
  knockoutRound: string | null
  homeClub: Club
  awayClub: Club
  competition: MatchCompetition
  isUserHome: boolean
}

// API Response wrappers
interface ApiDataResponse<T> {
  data: T
  message?: string
}

class HomeService {
  /**
   * Get current season statistics for hero section
   */
  static async getSeasonStats(): Promise<SeasonStats> {
    const response = await api.get<ApiDataResponse<SeasonStats>>('/api/v1/me/season/stats')
    return response.data?.data || {
      seasonNumber: 0,
      playedMatches: 0,
      pendingMatches: 0,
      cancelledMatches: 0,
      totalTransfers: 0,
    }
  }

  /**
   * Get user's club information
   */
  static async getUserClub(): Promise<UserClub | null> {
    const response = await api.get<ApiDataResponse<UserClub | null>>('/api/v1/me/club')
    return response.data?.data || null
  }

  /**
   * Get user's current league with standings
   */
  static async getUserLeague(): Promise<UserLeague | null> {
    const response = await api.get<ApiDataResponse<UserLeague | null>>('/api/v1/me/league')
    return response.data?.data || null
  }

  /**
   * Get user's recent matches
   */
  static async getUserRecentMatches(limit: number = 10): Promise<UserMatch[]> {
    const response = await api.get<ApiDataResponse<UserMatch[]>>(`/api/v1/me/matches/recent?limit=${limit}`)
    return response.data?.data || []
  }

  /**
   * Get user's upcoming matches
   */
  static async getUserUpcomingMatches(limit: number = 5): Promise<UpcomingMatch[]> {
    const response = await api.get<ApiDataResponse<UpcomingMatch[]>>(`/api/v1/me/matches/upcoming?limit=${limit}`)
    return response.data?.data || []
  }

  /**
   * Get global recent matches for carousel
   */
  static async getRecentMatches(limit: number = 20): Promise<RecentMatch[]> {
    const response = await api.get<ApiDataResponse<RecentMatch[]>>(`/api/v1/me/fixtures/recent?limit=${limit}`)
    return response.data?.data || []
  }
}

export default HomeService
