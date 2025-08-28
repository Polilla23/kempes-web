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

	// Obtener un player por su ID
	static async getPlayerById(id: string): Promise<PlayerResponse> {
		try {
			const response = await api.get<PlayerResponse>(`/player/find/${id}`)
			return response.data || { message: response.message || 'Player fetched successfully'}
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Error fetching player')
		}
	}

	// Actualizar un player
	static async updatePlayer(id: string, playerData: RegisterPlayerFormData): Promise<PlayerResponse> {
		try {
			const response = await api.patch<PlayerResponse>(`/player/update/${id}`, playerData)
			return response.data || { message: response.message || 'Player updated successfully' }
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Error updating player')
		}
	}

	// Agregar multiples jugadores al mismo tiempo
	static async bulkCreatePlayer(file: File): Promise<PlayerResponse>{
		try {
			const formData = new FormData()
			formData.append('file', file)

			const response = await api.post<PlayerResponse>('/player/bulkCreate', formData)
			return response.data || { message: response.message  || 'Players created successfully' }
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Error creating players from CSV')
		}
	}
}


