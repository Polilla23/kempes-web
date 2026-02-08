import api from './api'
import type { RegisterClubFormData, ClubResponse, ClubsResponse, Club } from '@/types'

export class ClubService {
    // Crear un nuevo club
    static async createClub(clubData: RegisterClubFormData): Promise<ClubResponse> {
        try {
            const response = await api.post<{ data: Club; message: string }>('/api/v1/clubs', clubData)
            // Backend devuelve { data: Club, message, timestamp }
            return { club: response.data?.data, message: response.data?.message || 'Club created successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error creating club')
        }
    }

    // Obtener todos los clubs
    static async getClubs(): Promise<ClubsResponse> {
        try {
            const response = await api.get<{ data: Club[] }>('/api/v1/clubs')
            // Backend devuelve { data: Club[], message, timestamp }
            return { clubs: response.data?.data || [] }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching clubs')
        }
    }

    // Obtener un club por su ID
    static async getClubById(id: string): Promise<ClubResponse> {
        try {
            const response = await api.get<{ data: Club; message: string }>(`/api/v1/clubs/${id}`)
            // Backend devuelve { data: Club, message, timestamp }
            return { club: response.data?.data, message: response.data?.message || 'Club fetched successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching club')
        }
    }

    // Actualizar un club
    static async updateClub(id: string, clubData: RegisterClubFormData): Promise<ClubResponse> {
        try {
            const response = await api.patch<{ data: Club; message: string }>(`/api/v1/clubs/${id}`, clubData)
            // Backend devuelve { data: Club, message, timestamp }
            return { club: response.data?.data, message: response.data?.message || 'Club updated successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error updating club')
        }
    }

    // Agregar multiples clubes al mismo tiempo
    static async bulkCreateClub(file: File): Promise<ClubResponse> {
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await api.post<{ data: any; message: string }>('/api/v1/clubs/bulk', formData)
            return { message: response.data?.message || 'Clubs created successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error creating clubs from CSV')
        }
    }

    // Eliminar un club
    static async deleteClub(id: string): Promise<ClubResponse> {
        try {
            const response = await api.delete<{ data: Club; message: string }>(`/api/v1/clubs/${id}`)
            return { club: response.data?.data, message: response.data?.message || 'Club deleted successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error deleting club')
        }
    }
}