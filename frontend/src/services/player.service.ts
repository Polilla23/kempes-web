import api from './api'
import type { PlayerResponse, RegisterPlayerFormData, Player } from '@/types'

export class PlayerService {
  // Crear un nuevo jugador
  static async createPlayer(playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
    try {
      const response = await api.post<PlayerResponse>('/players', playerData)
      return response.data || { message: response.message || 'Player created successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating player')
    }
  }

  // Obtener todos los jugadores
  static async getPlayers(): Promise<Player[]> {
    try {
      const response = await api.get<{ data: Player[] }>('/players')
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching players')
    }
  }

  // Obtener un player por su ID
  static async getPlayerById(id: string): Promise<Player | undefined> {
    try {
      const response = await api.get<{ data: Player }>(`/players/${id}`)
      return response.data?.data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching player')
    }
  }

  // Actualizar un player
  static async updatePlayer(id: string, playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
    try {
      const response = await api.patch<PlayerResponse>(`/players/${id}`, playerData)
      return response.data || { message: response.message || 'Player updated successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating player')
    }
  }

  // Agregar multiples jugadores al mismo tiempo
  static async bulkCreatePlayer(file: File): Promise<PlayerResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<PlayerResponse>('/players/bulk', formData)
      return response.data || { message: response.message || 'Players created successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating players from CSV')
    }
  }

  static async deletePlayer(id: string): Promise<PlayerResponse> {
    try {
      const response = await api.delete<PlayerResponse>(`/players/${id}`)
      return response.data || { message: response.message || 'Player deleted successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting player')
    }
  }
}
