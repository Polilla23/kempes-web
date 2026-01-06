import api from './api'
import type { Season } from '@/types'

export interface SeasonResponse {
  season?: Season
  message?: string
}

export interface SeasonsResponse {
  seasons: Season[]
}

export class SeasonService {
  static async createSeason(data: {
    number: number
    isActive: boolean
  }): Promise<SeasonResponse> {
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
      return { season: response.data?.data, message: response.data?.message || 'Active season fetched successfully' }
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
}