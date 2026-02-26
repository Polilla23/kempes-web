import api from './api'
import type {
  Season,
  VerifyCompetitionsResponse,
  PreviewMovementsResponse,
  SaveHistoryResponse,
  CreateNextSeasonResponse,
} from '@/types'

export interface SeasonResponse {
  season?: Season
  message?: string
}

export interface SeasonsResponse {
  seasons: Season[]
}

export class SeasonService {
  static async createSeason(data: { number: number; isActive: boolean }): Promise<SeasonResponse> {
    try {
      const response = await api.post<{ data: Season; message: string }>('/api/v1/seasons', data)
      return { season: response.data?.data, message: response.data?.message || 'Season created successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating season')
    }
  }

  static async getSeasons(): Promise<SeasonsResponse> {
    try {
      const response = await api.get<{ data: Season[] }>('/api/v1/seasons')
      return { seasons: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching seasons')
    }
  }

  static async getActiveSeason(): Promise<SeasonResponse> {
    try {
      const response = await api.get<{ data: Season; message: string }>('/api/v1/seasons/active')
      return {
        season: response.data?.data,
        message: response.data?.message || 'Active season fetched successfully',
      }
    } catch (error) {
      return { season: undefined, message: 'No active season found' }
    }
  }

  static async getSeasonById(id: string): Promise<SeasonResponse> {
    try {
      const response = await api.get<{ data: Season; message: string }>(`/api/v1/seasons/${id}`)
      return { season: response.data?.data, message: response.data?.message || 'Season fetched successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season')
    }
  }

  static async updateSeason(
    id: string,
    data: {
      number?: number
      isActive?: boolean
    }
  ): Promise<SeasonResponse> {
    try {
      const response = await api.patch<{ data: Season; message: string }>(`/api/v1/seasons/${id}`, data)
      return { season: response.data?.data, message: response.data?.message || 'Season updated successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating season')
    }
  }

  static async deleteSeason(id: string): Promise<SeasonResponse> {
    try {
      const response = await api.delete<{ data: Season; message: string }>(`/api/v1/seasons/${id}`)
      return { season: response.data?.data, message: response.data?.message || 'Season deleted successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting season')
    }
  }

  /**
   * Obtiene los movimientos de equipos de una temporada específica
   */
  static async getSeasonMovements(seasonNumber: number) {
    try {
      const response = await api.get<{ data: any[] }>(`/api/v1/seasons/${seasonNumber}/movements`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season movements')
    }
  }

  /**
   * Avanza a la siguiente temporada (finaliza la actual y crea una nueva)
   */
  static async advanceSeason() {
    try {
      const response = await api.post<{ data: any }>('/api/v1/seasons/advance')
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error advancing season')
    }
  }

  // ============================================
  // WIZARD DE AVANCE — 4 PASOS DISCRETOS
  // ============================================

  static async verifyCompetitions(): Promise<VerifyCompetitionsResponse> {
    try {
      const response = await api.get<{ data: VerifyCompetitionsResponse }>('/api/v1/seasons/active/verify-competitions')
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error verifying competitions')
    }
  }

  static async previewMovements(): Promise<PreviewMovementsResponse> {
    try {
      const response = await api.get<{ data: PreviewMovementsResponse }>('/api/v1/seasons/active/preview-movements')
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error previewing movements')
    }
  }

  static async saveSeasonHistory(): Promise<SaveHistoryResponse> {
    try {
      const response = await api.post<{ data: SaveHistoryResponse }>('/api/v1/seasons/active/save-history')
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error saving season history')
    }
  }

  static async createNextSeason(): Promise<CreateNextSeasonResponse> {
    try {
      const response = await api.post<{ data: CreateNextSeasonResponse }>('/api/v1/seasons/active/create-next')
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating next season')
    }
  }
}
