import api from './api'
import type { CompetitionType } from '@/types'

export interface CompetitionTypeResponse {
  competitionType?: CompetitionType
  message?: string
}

export interface CompetitionTypesResponse {
  competitionTypes: CompetitionType[]
}

export class CompetitionTypeService {
  static async createCompetitionType(data: {
    name: string
    category: string
    format: string
    hierarchy: number
  }): Promise<CompetitionTypeResponse> {
    try {
      const response = await api.post<{ data: CompetitionType; message: string }>('/api/v1/competition-types', data)
      return { competitionType: response.data?.data, message: response.data?.message || 'Competition type created successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating competition type')
    }
  }

  static async getCompetitionTypes(): Promise<CompetitionTypesResponse> {
    try {
      const response = await api.get<{ data: CompetitionType[] }>('/api/v1/competition-types')
      return { competitionTypes: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching competition types')
    }
  }

  static async getCompetitionTypeById(id: string): Promise<CompetitionTypeResponse> {
    try {
      const response = await api.get<{ data: CompetitionType; message: string }>(`/api/v1/competition-types/${id}`)
      return { competitionType: response.data?.data, message: response.data?.message || 'Competition type fetched successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching competition type')
    }
  }

  static async updateCompetitionType(
    id: string,
    data: {
      name?: string
      category?: string
      format?: string
      hierarchy?: number
    }
  ): Promise<CompetitionTypeResponse> {
    try {
      const response = await api.patch<{ data: CompetitionType; message: string }>(`/api/v1/competition-types/${id}`, data)
      return { competitionType: response.data?.data, message: response.data?.message || 'Competition type updated successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating competition type')
    }
  }

  static async deleteCompetitionType(id: string): Promise<CompetitionTypeResponse> {
    try {
      const response = await api.delete<{ data: CompetitionType; message: string }>(`/api/v1/competition-types/${id}`)
      return { competitionType: response.data?.data, message: response.data?.message || 'Competition type deleted successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting competition type')
    }
  }
}