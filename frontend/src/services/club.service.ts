import api from './api'
import type { RegisterClubFormData, ClubResponse, ClubsResponse } from '@/types'

export class ClubService {
    // Crear un nuevo club
    static async createClub(clubData: RegisterClubFormData): Promise<ClubResponse> {
        try {
            const response = await api.post<ClubResponse>('/club/create', clubData)
            return response.data || { message: response.message || 'Club created successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error creating club')
        }
    }

    // Obtener todos los clubs
    static async getClubs(): Promise<ClubsResponse> {
        try {
            const response = await api.get<ClubsResponse>('/club/findAll')
            return response.data || { clubs: [] }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching clubs')
        }
    }

    // Obtener un club por su ID
    static async getClubById(id: string): Promise<ClubResponse> {
        try {
            const response = await api.get<ClubResponse>(`/club/findOne/${id}`)
            return response.data || { message: response.message || 'Club fetched successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching club')
        }
    }

    // Actualizar un club
    static async updateClub(id: string, clubData: RegisterClubFormData): Promise<ClubResponse> {
        try {
            const response = await api.patch<ClubResponse>(`/club/update/${id}`, clubData)
            return response.data || { message: response.message || 'Club updated successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error updating club')
        }
    }

    // Eliminar un club
    static async deleteClub(id: string): Promise<ClubResponse> {
        try {
            const response = await api.delete<ClubResponse>(`/club/delete/${id}`)
            return response.data || { message: response.message || 'Club deleted successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error deleting club')
        }
    }
}