import api from './api'
import type { GlobalRankingEntry, SeasonChampions, CompetitionChampions, TitlePointConfig } from '@/types'

export class TitleService {
  static async getRanking(): Promise<GlobalRankingEntry[]> {
    try {
      const response = await api.get<{ data: GlobalRankingEntry[] }>('/api/v1/titles/ranking')
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching ranking')
    }
  }

  static async getSeasonChampions(category?: string): Promise<SeasonChampions[]> {
    try {
      const query = category ? `?category=${category}` : ''
      const response = await api.get<{ data: SeasonChampions[] }>(`/api/v1/titles/by-season${query}`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season champions')
    }
  }

  static async getCompetitionChampions(competitionName: string): Promise<CompetitionChampions> {
    try {
      const response = await api.get<{ data: CompetitionChampions }>(`/api/v1/titles/by-competition/${competitionName}`)
      return response.data?.data as CompetitionChampions
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching competition champions')
    }
  }

  static async getPointConfigs(): Promise<TitlePointConfig[]> {
    try {
      const response = await api.get<{ data: TitlePointConfig[] }>('/api/v1/titles/point-configs')
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching point configs')
    }
  }

  static async updatePointConfig(id: string, points: number): Promise<TitlePointConfig> {
    try {
      const response = await api.put<{ data: TitlePointConfig }>(`/api/v1/titles/point-configs/${id}`, { points })
      return response.data?.data as TitlePointConfig
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating point config')
    }
  }
}
