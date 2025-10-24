import api from './api'
import type { PlayerResponse, RegisterPlayerFormData, Player, DataEnvelope } from '@/types'

export class PlayerService {
  // Crear un nuevo jugador
  static async createPlayer(playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
    try {
      const response = await api.post<DataEnvelope<Player>>('/players', playerData)
      return { 
        message: 'Player created successfully',
        player: response.data?.data 
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating player')
    }
  }

  // Obtener todos los jugadores
  static async getPlayers(): Promise<Player[]> {
    try {
      const response = await api.get<DataEnvelope<Player[]>>('/players')
      return response.data?.data || []
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching players')
    }
  }

  // Obtener un player por su ID
  static async getPlayerById(id: string): Promise<Player | null> {
    try {
      const response = await api.get<DataEnvelope<Player>>(`/players/${id}`)
      return response.data?.data || null
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching player')
    }
  }

  // Actualizar un player
  static async updatePlayer(id: string, playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
    try {
      const response = await api.patch<DataEnvelope<Player>>(`/players/${id}`, playerData)
      return { 
        message: 'Player updated successfully',
        player: response.data?.data 
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating player')
    }
  }

  // Agregar multiples jugadores al mismo tiempo
  static async bulkCreatePlayer(file: File): Promise<PlayerResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<DataEnvelope<any>>('/players/bulk', formData)
      return { 
        message: 'Players created successfully',
        player: response.data?.data 
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating players from CSV')
    }
  }

  static async deletePlayer(id: string): Promise<PlayerResponse> {
    try {
      await api.delete(`/players/${id}`)
      return { message: 'Player deleted successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting player')
    }
  }
}
