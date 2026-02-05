import api from './api'
import type {
  Transfer,
  TransferFilters,
  CreateTransferInput,
  CreateLoanInput,
  CreateAuctionInput,
  SignFreeAgentInput,
  TransfersResponse,
  TransferResponse,
  RosterCountResponse,
} from '@/types'

export class TransferService {
  // Obtener todas las transferencias
  static async getTransfers(filters?: TransferFilters): Promise<TransfersResponse> {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.seasonHalfId) params.append('seasonHalfId', filters.seasonHalfId)
      if (filters?.transferWindowId) params.append('transferWindowId', filters.transferWindowId)

      const url = `/api/v1/transfers${params.toString() ? `?${params.toString()}` : ''}`
      const response = await api.get<{ data: Transfer[] }>(url)
      return { transfers: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching transfers')
    }
  }

  // Obtener una transferencia por ID
  static async getTransferById(id: string): Promise<TransferResponse> {
    try {
      const response = await api.get<{ data: Transfer; message: string }>(`/api/v1/transfers/${id}`)
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching transfer')
    }
  }

  // Obtener transferencias por jugador
  static async getTransfersByPlayer(playerId: string): Promise<TransfersResponse> {
    try {
      const response = await api.get<{ data: Transfer[] }>(`/api/v1/transfers/player/${playerId}`)
      return { transfers: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching player transfers')
    }
  }

  // Obtener transferencias por club
  static async getTransfersByClub(
    clubId: string,
    direction?: 'from' | 'to' | 'both'
  ): Promise<TransfersResponse> {
    try {
      const url = direction
        ? `/api/v1/transfers/club/${clubId}?direction=${direction}`
        : `/api/v1/transfers/club/${clubId}`
      const response = await api.get<{ data: Transfer[] }>(url)
      return { transfers: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching club transfers')
    }
  }

  // Obtener préstamos activos
  static async getActiveLoans(): Promise<TransfersResponse> {
    try {
      const response = await api.get<{ data: Transfer[] }>('/api/v1/transfers/active-loans')
      return { transfers: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching active loans')
    }
  }

  // Obtener transferencias pendientes de confirmación para un club
  static async getPendingConfirmations(clubId: string): Promise<TransfersResponse> {
    try {
      const response = await api.get<{ data: Transfer[] }>(
        `/api/v1/transfers/pending-confirmations/${clubId}`
      )
      return { transfers: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching pending confirmations')
    }
  }

  // Obtener conteo de roster de un club
  static async getRosterCount(clubId: string): Promise<RosterCountResponse> {
    try {
      const response = await api.get<{ data: { senior: number; kempesita: number } }>(
        `/api/v1/transfers/club/${clubId}/roster-count`
      )
      return { rosterCount: response.data?.data || { senior: 0, kempesita: 0 } }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching roster count')
    }
  }

  // Crear transferencia (compra/venta)
  static async createTransfer(data: CreateTransferInput): Promise<TransferResponse> {
    try {
      const response = await api.post<{ data: Transfer; message: string }>('/api/v1/transfers', data)
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating transfer')
    }
  }

  // Crear préstamo
  static async createLoan(data: CreateLoanInput): Promise<TransferResponse> {
    try {
      const response = await api.post<{ data: Transfer; message: string }>('/api/v1/transfers/loan', data)
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating loan')
    }
  }

  // Crear subasta
  static async createAuction(data: CreateAuctionInput): Promise<TransferResponse> {
    try {
      const response = await api.post<{ data: Transfer; message: string }>('/api/v1/transfers/auction', data)
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating auction')
    }
  }

  // Fichar agente libre
  static async signFreeAgent(data: SignFreeAgentInput): Promise<TransferResponse> {
    try {
      const response = await api.post<{ data: Transfer; message: string }>('/api/v1/transfers/free-agent', data)
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error signing free agent')
    }
  }

  // Marcar jugador como inactivo
  static async markPlayerInactive(playerId: string, clubId: string): Promise<TransferResponse> {
    try {
      const response = await api.post<{ data: Transfer; message: string }>('/api/v1/transfers/inactive', {
        playerId,
        clubId,
      })
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error marking player inactive')
    }
  }

  // Completar transferencia
  static async completeTransfer(id: string): Promise<TransferResponse> {
    try {
      const response = await api.patch<{ data: Transfer; message: string }>(`/api/v1/transfers/${id}/complete`)
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error completing transfer')
    }
  }

  // Cancelar transferencia
  static async cancelTransfer(id: string): Promise<TransferResponse> {
    try {
      const response = await api.patch<{ data: Transfer; message: string }>(`/api/v1/transfers/${id}/cancel`)
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error cancelling transfer')
    }
  }

  // Eliminar transferencia
  static async deleteTransfer(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/api/v1/transfers/${id}`)
      return { message: response.data?.message || 'Transfer deleted' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting transfer')
    }
  }

  // Aprobar una transferencia pendiente
  static async approveTransfer(id: string): Promise<TransferResponse> {
    try {
      const response = await api.post<{ data: Transfer; message: string }>(
        `/api/v1/transfers/${id}/approve`
      )
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error approving transfer')
    }
  }

  // Rechazar una transferencia pendiente
  static async rejectTransfer(id: string): Promise<TransferResponse> {
    try {
      const response = await api.post<{ data: Transfer; message: string }>(
        `/api/v1/transfers/${id}/reject`
      )
      return { transfer: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error rejecting transfer')
    }
  }
}
