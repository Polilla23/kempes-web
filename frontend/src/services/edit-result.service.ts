import api from './api'
import type { SubmitResultPayload, EventTypeOption } from './submit-result.service'

export interface MatchDetailForEdit {
  id: string
  matchdayOrder: number
  status: string
  stage: string
  knockoutRound: string | null
  homeClubGoals: number
  awayClubGoals: number
  homeOwnGoals: number
  awayOwnGoals: number
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
  homeEvents: Array<{ typeId: string; playerId: string; quantity: number }>
  awayEvents: Array<{ typeId: string; playerId: string; quantity: number }>
  mvpPlayerId: string | null
}

export interface AdminEditResultPayload extends SubmitResultPayload {
  newStatus: 'FINALIZADO' | 'PENDIENTE' | 'CANCELADO'
}

interface ApiDataResponse<T> {
  data: T
  message?: string
}

export class EditResultService {
  static async getMatchDetail(matchId: string): Promise<MatchDetailForEdit> {
    const response = await api.get<ApiDataResponse<MatchDetailForEdit>>(`/api/v1/fixtures/${matchId}/detail`)
    return response.data?.data
  }

  static async adminEditResult(matchId: string, payload: AdminEditResultPayload) {
    const response = await api.put<ApiDataResponse<any>>(`/api/v1/fixtures/${matchId}/admin-edit-result`, payload)
    return response.data?.data
  }

  static async getClubPlayers(clubId: string) {
    const response = await api.get<ApiDataResponse<any[]>>(`/api/v1/clubs/${clubId}/players`)
    return response.data?.data || []
  }

  static async getEventTypes(): Promise<EventTypeOption[]> {
    const response = await api.get<ApiDataResponse<EventTypeOption[]>>('/api/v1/event-types')
    const allTypes = response.data?.data || []
    return allTypes.filter((et) => et.name !== 'MVP' && et.isActive)
  }
}
