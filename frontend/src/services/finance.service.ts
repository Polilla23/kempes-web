import api from './api'
import type {
  FinancialTransaction,
  ClubSeasonBalance,
  CompetitionPrize,
  FinancialReport,
  TransactionFilters,
  CreatePrizeInput,
  AwardPrizeInput,
  RecordFineInput,
  RecordBonusInput,
  TransactionsResponse,
  TransactionResponse,
  BalanceResponse,
  BalancesResponse,
  PrizeResponse,
  PrizesResponse,
  FinancialReportResponse,
} from '@/types'

export class FinanceService {
  // ==================== Transactions ====================

  // Obtener todas las transacciones
  static async getTransactions(filters?: TransactionFilters): Promise<TransactionsResponse> {
    try {
      const params = new URLSearchParams()
      if (filters?.clubId) params.append('clubId', filters.clubId)
      if (filters?.seasonHalfId) params.append('seasonHalfId', filters.seasonHalfId)
      if (filters?.type) params.append('type', filters.type)

      const url = `/api/v1/finances/transactions${params.toString() ? `?${params.toString()}` : ''}`
      const response = await api.get<{ data: FinancialTransaction[] }>(url)
      return { transactions: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching transactions')
    }
  }

  // Obtener transacción por ID
  static async getTransactionById(id: string): Promise<TransactionResponse> {
    try {
      const response = await api.get<{ data: FinancialTransaction; message: string }>(
        `/api/v1/finances/transactions/${id}`
      )
      return { transaction: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching transaction')
    }
  }

  // Obtener transacciones de un club
  static async getTransactionsByClub(
    clubId: string,
    seasonHalfId?: string
  ): Promise<TransactionsResponse> {
    try {
      const url = seasonHalfId
        ? `/api/v1/finances/transactions/club/${clubId}?seasonHalfId=${seasonHalfId}`
        : `/api/v1/finances/transactions/club/${clubId}`
      const response = await api.get<{ data: FinancialTransaction[] }>(url)
      return { transactions: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching club transactions')
    }
  }

  // ==================== Balances ====================

  // Obtener balance de un club
  static async getClubBalance(clubId: string, seasonHalfId?: string): Promise<BalanceResponse> {
    try {
      const url = seasonHalfId
        ? `/api/v1/finances/balance/${clubId}?seasonHalfId=${seasonHalfId}`
        : `/api/v1/finances/balance/${clubId}`
      const response = await api.get<{ data: ClubSeasonBalance; message: string }>(url)
      return { balance: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching club balance')
    }
  }

  // Obtener historial de balances de un club
  static async getClubBalanceHistory(clubId: string): Promise<BalancesResponse> {
    try {
      const response = await api.get<{ data: ClubSeasonBalance[] }>(
        `/api/v1/finances/balance/${clubId}/history`
      )
      return { balances: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching balance history')
    }
  }

  // Obtener balances de todas las clubes para una media temporada
  static async getSeasonHalfBalances(seasonHalfId: string): Promise<BalancesResponse> {
    try {
      const response = await api.get<{ data: ClubSeasonBalance[] }>(
        `/api/v1/finances/balance/season-half/${seasonHalfId}`
      )
      return { balances: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching season half balances')
    }
  }

  // Inicializar balance de un club
  static async initializeClubBalance(
    clubId: string,
    seasonHalfId: string,
    startingBalance?: number
  ): Promise<BalanceResponse> {
    try {
      const response = await api.post<{ data: ClubSeasonBalance; message: string }>(
        '/api/v1/finances/balance/initialize',
        { clubId, seasonHalfId, startingBalance }
      )
      return { balance: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error initializing balance')
    }
  }

  // ==================== Prizes ====================

  // Obtener todos los premios
  static async getPrizes(): Promise<PrizesResponse> {
    try {
      const response = await api.get<{ data: CompetitionPrize[] }>('/api/v1/finances/prizes')
      return { prizes: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching prizes')
    }
  }

  // Obtener premios por tipo de competición
  static async getPrizesByCompetitionType(competitionTypeId: string): Promise<PrizesResponse> {
    try {
      const response = await api.get<{ data: CompetitionPrize[] }>(
        `/api/v1/finances/prizes/competition-type/${competitionTypeId}`
      )
      return { prizes: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching competition prizes')
    }
  }

  // Crear premio
  static async createPrize(data: CreatePrizeInput): Promise<PrizeResponse> {
    try {
      const response = await api.post<{ data: CompetitionPrize; message: string }>(
        '/api/v1/finances/prizes',
        data
      )
      return { prize: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating prize')
    }
  }

  // Actualizar premio
  static async updatePrize(
    id: string,
    data: { prizeAmount?: number; description?: string }
  ): Promise<PrizeResponse> {
    try {
      const response = await api.patch<{ data: CompetitionPrize; message: string }>(
        `/api/v1/finances/prizes/${id}`,
        data
      )
      return { prize: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating prize')
    }
  }

  // Eliminar premio
  static async deletePrize(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/api/v1/finances/prizes/${id}`)
      return { message: response.data?.message || 'Prize deleted' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting prize')
    }
  }

  // Otorgar premio a un club
  static async awardPrize(data: AwardPrizeInput): Promise<TransactionResponse> {
    try {
      const response = await api.post<{ data: FinancialTransaction; message: string }>(
        '/api/v1/finances/prizes/award',
        data
      )
      return { transaction: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error awarding prize')
    }
  }

  // ==================== Fines & Bonuses ====================

  // Registrar multa
  static async recordFine(data: RecordFineInput): Promise<TransactionResponse> {
    try {
      const response = await api.post<{ data: FinancialTransaction; message: string }>(
        '/api/v1/finances/fine',
        data
      )
      return { transaction: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error recording fine')
    }
  }

  // Registrar bono
  static async recordBonus(data: RecordBonusInput): Promise<TransactionResponse> {
    try {
      const response = await api.post<{ data: FinancialTransaction; message: string }>(
        '/api/v1/finances/bonus',
        data
      )
      return { transaction: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error recording bonus')
    }
  }

  // ==================== Reports ====================

  // Obtener reporte financiero de un club
  static async getClubFinancialReport(
    clubId: string,
    seasonHalfId?: string
  ): Promise<FinancialReportResponse> {
    try {
      const url = seasonHalfId
        ? `/api/v1/finances/report/${clubId}?seasonHalfId=${seasonHalfId}`
        : `/api/v1/finances/report/${clubId}`
      const response = await api.get<{ data: FinancialReport; message: string }>(url)
      return { report: response.data?.data, message: response.data?.message }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching financial report')
    }
  }
}
