import api from './api'

export interface PendingMatch {
  id: string
  matchdayOrder: number
  status: string
  stage: string
  knockoutRound: string | null
  homeClub: { id: string; name: string; logo: string | null }
  awayClub: { id: string; name: string; logo: string | null }
  competition: {
    id: string
    name: string
    competitionType: {
      id: string
      name: string
      category: string
      format: string
      hierarchy: number
    }
  }
  plazo: {
    id: string
    title: string
    order: number
    deadline: string
    isOpen: boolean
  } | null
  isUserHome: boolean
}

export interface ClubPlayer {
  id: string
  fullName: string
  overall: number | null
}

export interface SubmitResultEventInput {
  typeId: string
  playerId: string
  quantity: number
}

export interface SubmitResultPayload {
  homeClubGoals: number
  awayClubGoals: number
  homeOwnGoals: number
  awayOwnGoals: number
  homeEvents: SubmitResultEventInput[]
  awayEvents: SubmitResultEventInput[]
  mvpPlayerId: string
  screenshotUrl?: string
}

export interface EventTypeOption {
  id: string
  name: string
  displayName: string
  icon: string
  isActive: boolean
}

interface ApiDataResponse<T> {
  data: T
  message?: string
}

export class SubmitResultService {
  static async getMyPendingMatches(): Promise<PendingMatch[]> {
    const response = await api.get<ApiDataResponse<PendingMatch[]>>('/api/v1/fixtures/my-pending')
    return response.data?.data || []
  }

  static async getClubPlayers(clubId: string): Promise<ClubPlayer[]> {
    const response = await api.get<ApiDataResponse<ClubPlayer[]>>(`/api/v1/clubs/${clubId}/players`)
    return response.data?.data || []
  }

  static async getEventTypes(): Promise<EventTypeOption[]> {
    const response = await api.get<ApiDataResponse<EventTypeOption[]>>('/api/v1/event-types')
    const allTypes = response.data?.data || []
    return allTypes.filter((et) => et.name !== 'MVP' && et.isActive)
  }

  static async getMvpEventTypeId(): Promise<string | null> {
    const response = await api.get<ApiDataResponse<EventTypeOption[]>>('/api/v1/event-types')
    const allTypes = response.data?.data || []
    const mvpType = allTypes.find((et) => et.name === 'MVP')
    return mvpType?.id || null
  }

  static async submitResult(matchId: string, payload: SubmitResultPayload) {
    const response = await api.post<ApiDataResponse<any>>(`/api/v1/fixtures/${matchId}/submit-result`, payload)
    return response.data?.data
  }
}
