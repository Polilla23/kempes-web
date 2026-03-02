import api from './api'

export interface DashboardTitle {
  seasonNumber: number
  competitionName: string
  type: 'LEAGUE' | 'CUP'
}

export interface DashboardSeasonStats {
  goals: number
  assists: number
  appearances: number
  yellowCards: number
  redCards: number
  mvps: number
}

export interface DashboardPlayer {
  id: string
  name: string
  overall: number | null
  salary: number
  isKempesita: boolean
  avatar: string | null
  position: string | null
  seasonStats: DashboardSeasonStats | null
}

export interface DashboardClub {
  id: string
  name: string
  logo: string | null
  preferredFormation: string
  titles: {
    total: number
    titles: DashboardTitle[]
  }
}

export interface DashboardClub_ {
  id: string
  name: string
  logo: string | null
}

export interface DashboardCompetitionType {
  id: string
  name: string
  category: string
  hierarchy: number
  format: string
}

export interface DashboardCompetition {
  id: string
  name: string
  competitionType: DashboardCompetitionType
}

export interface DashboardMatch {
  id: string
  matchdayOrder: number
  status: string
  stage: string
  knockoutRound: string | null
  homeClub: DashboardClub_ | null
  awayClub: DashboardClub_ | null
  competition: DashboardCompetition
  isUserHome: boolean
}

export interface DashboardData {
  club: DashboardClub
  squad: {
    squadValue: number
    players: DashboardPlayer[]
  }
  upcomingMatches: DashboardMatch[]
}

interface ApiDataResponse<T> {
  data: T
  message?: string
}

class DashboardService {
  static async getDashboardData(): Promise<DashboardData | null> {
    const response = await api.get<ApiDataResponse<DashboardData | null>>('/api/v1/me/dashboard')
    return response.data?.data ?? null
  }

  static async updateFormation(formation: string): Promise<void> {
    await api.patch('/api/v1/me/club/formation', { formation })
  }
}

export default DashboardService
