import api from './api'
import type { PlayerResponse, PlayersResponse, RegisterPlayerFormData, Player } from '@/types'

export class PlayerService {
  // Crear un nuevo jugador
  static async createPlayer(playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
    try {
      const response = await api.post<{ data: Player; message: string }>('/api/v1/players', playerData)
      // Backend devuelve { data: Player, message, timestamp }
      return { player: response.data?.data, message: response.data?.message || 'Player created successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating player')
    }
  }

  // Obtener todos los jugadores
  static async getPlayers(): Promise<PlayersResponse> {
    try {
      const response = await api.get<{ data: Player[] }>('/api/v1/players')
      // Backend devuelve { data: Player[], message, timestamp }
      return { players: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching players')
    }
  }

  // Obtener un player por su ID
  static async getPlayerById(id: string): Promise<PlayerResponse> {
    try {
      const response = await api.get<{ data: Player; message: string }>(`/api/v1/players/${id}`)
      // Backend devuelve { data: Player, message, timestamp }
      return { player: response.data?.data, message: response.data?.message || 'Player fetched successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching player')
    }
  }

  // Actualizar un player
  static async updatePlayer(id: string, playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
    try {
      const response = await api.patch<{ data: Player; message: string }>(`/api/v1/players/${id}`, playerData)
      // Backend devuelve { data: Player, message, timestamp }
      return { player: response.data?.data, message: response.data?.message || 'Player updated successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating player')
    }
  }

  // Agregar multiples jugadores al mismo tiempo
  static async bulkCreatePlayer(file: File): Promise<PlayerResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<{ data: any; message: string }>('/api/v1/players/bulk', formData)
      // Backend devuelve { data: {...}, message, timestamp }
      return { message: response.data?.message || 'Players created successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating players from CSV')
    }
  }

  static async deletePlayer(id: string): Promise<PlayerResponse> {
    try {
      const response = await api.delete<{ data: Player; message: string }>(`/api/v1/players/${id}`)
      return { player: response.data?.data, message: response.data?.message || 'Player deleted successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting player')
    }
  }
}
