import api from './api'
import type { RegisterClubFormData, ClubResponse, Club, DataEnvelope } from '@/types'

export class ClubService {
    // Crear un nuevo club
    static async createClub(clubData: RegisterClubFormData): Promise<ClubResponse> {
        try {
            const response = await api.post<DataEnvelope<Club>>('/clubs', clubData)
            return { 
                message: 'Club created successfully',
                club: response.data?.data 
            }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error creating club')
        }
    }

    // Obtener todos los clubs
    static async getClubs(): Promise<Club[]> {
        try {
            const response = await api.get<DataEnvelope<Club[]>>('/clubs')
            return response.data?.data || []
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching clubs')
        }
    }

    // Obtener un club por su ID
    static async getClubById(id: string): Promise<Club | null> {
        try {
            const response = await api.get<DataEnvelope<Club>>(`/clubs/${id}`)
            return response.data?.data || null
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error fetching club')
        }
    }

    // Actualizar un club
    static async updateClub(id: string, clubData: RegisterClubFormData): Promise<ClubResponse> {
        try {
            const response = await api.patch<DataEnvelope<Club>>(`/clubs/${id}`, clubData)
            return { 
                message: 'Club updated successfully',
                club: response.data?.data 
            }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error updating club')
        }
    }

    // Eliminar un club
    static async deleteClub(id: string): Promise<ClubResponse> {
        try {
            await api.delete(`/clubs/${id}`)
            return { message: 'Club deleted successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Error deleting club')
        }
    }
}