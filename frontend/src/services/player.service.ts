import api from './api'
import type { PlayerResponse, PlayersResponse, RegisterPlayerFormData } from '@/types'

export class PlayerService {
	// Crear un nuevo jugador
	static async createPlayer(playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
		try {
			const response = await api.post<PlayerResponse>('/player/create', playerData)
			return response.data || { message: response.message || 'Player created successfully' }
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Error creating player')
		}
	}

	// Obtener todos los jugadores
	static async getPlayers(): Promise<PlayersResponse> {
		try {
			const response = await api.get<PlayersResponse>('/player/findAll')
			return response.data || { players: [] }
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Error fetching players')
		}
	}
}


