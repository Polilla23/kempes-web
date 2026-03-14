import api from './api'
import type { SeasonHalf, SeasonHalvesResponse, SeasonHalfResponse } from '@/types'

export class SeasonHalfService {
  // Obtener todas las mitades de temporada
  static async getSeasonHalves(): Promise<SeasonHalvesResponse> {
    try {
      const response = await api.get<{ data: SeasonHalf[] }>('/api/v1/season-halves')
      return { seasonHalves: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season halves')
    }
  }

  // Obtener la mitad de temporada activa
  static async getActiveSeasonHalf(): Promise<SeasonHalfResponse> {
    try {
      const response = await api.get<{ data: SeasonHalf; message: string }>('/api/v1/season-halves/active')
      return { seasonHalf: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching active season half')
    }
  }

  // Obtener mitad de temporada por ID
  static async getSeasonHalfById(id: string): Promise<SeasonHalfResponse> {
    try {
      const response = await api.get<{ data: SeasonHalf; message: string }>(`/api/v1/season-halves/${id}`)
      return { seasonHalf: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season half')
    }
  }

  // Obtener mitades de temporada por ID de temporada
  static async getSeasonHalvesBySeasonId(seasonId: string): Promise<SeasonHalvesResponse> {
    try {
      const response = await api.get<{ data: SeasonHalf[] }>(`/api/v1/season-halves/season/${seasonId}`)
      return { seasonHalves: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season halves by season')
    }
  }

  // Crear mitades de temporada para una temporada
  static async createSeasonHalves(seasonId: string): Promise<SeasonHalvesResponse> {
    try {
      const response = await api.post<{ data: SeasonHalf[] }>('/api/v1/season-halves', { seasonId })
      return { seasonHalves: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating season halves')
    }
  }
}
