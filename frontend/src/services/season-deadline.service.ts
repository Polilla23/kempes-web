import api from './api'
import type { SeasonDeadline, DeadlineType } from '@/types'

export interface CreateDeadlineInput {
  seasonId: string
  type: DeadlineType
  title: string
  description?: string
  date: string
}

export interface BulkCreateDeadlinesInput {
  seasonId: string
  deadlines: Array<{
    type: DeadlineType
    title: string
    description?: string
    date: string
  }>
}

export class SeasonDeadlineService {
  static async getBySeasonId(seasonId: string): Promise<SeasonDeadline[]> {
    try {
      const response = await api.get<{ data: SeasonDeadline[] }>(`/api/v1/season-deadlines/season/${seasonId}`)
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching deadlines')
    }
  }

  static async create(input: CreateDeadlineInput): Promise<SeasonDeadline> {
    try {
      const response = await api.post<{ data: SeasonDeadline }>('/api/v1/season-deadlines', input)
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating deadline')
    }
  }

  static async bulkCreate(input: BulkCreateDeadlinesInput): Promise<{ count: number }> {
    try {
      const response = await api.post<{ data: { count: number } }>('/api/v1/season-deadlines/bulk', input)
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating deadlines')
    }
  }

  static async update(id: string, data: Partial<Pick<SeasonDeadline, 'title' | 'description' | 'date' | 'isCompleted'>>): Promise<SeasonDeadline> {
    try {
      const response = await api.patch<{ data: SeasonDeadline }>(`/api/v1/season-deadlines/${id}`, data)
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating deadline')
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/v1/season-deadlines/${id}`)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting deadline')
    }
  }

  static async toggleCompleted(id: string): Promise<SeasonDeadline> {
    try {
      const response = await api.patch<{ data: SeasonDeadline }>(`/api/v1/season-deadlines/${id}/toggle`)
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error toggling deadline')
    }
  }
}
