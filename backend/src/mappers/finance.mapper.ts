import {
  FinancialTransactionDTO,
  ClubSeasonBalanceDTO,
  CompetitionPrizeDTO,
} from '@/types/dto.types'

// Usamos tipos any para mayor flexibilidad con las relaciones de Prisma
type TransactionWithRelations = any
type BalanceWithRelations = any
type PrizeWithRelations = any

export class FinanceMapper {
  // ==================== Transaction Mappers ====================

  static toTransactionDTO(transaction: TransactionWithRelations): FinancialTransactionDTO {
    return {
      id: transaction.id,
      clubId: transaction.clubId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      transferId: transaction.transferId,
      installmentId: transaction.installmentId,
      seasonHalfId: transaction.seasonHalfId,
      createdAt: transaction.createdAt,
      club: transaction.club
        ? {
            id: transaction.club.id,
            name: transaction.club.name,
            shortName: transaction.club.shortName,
            logo: transaction.club.logo,
          }
        : undefined,
      seasonHalf: transaction.seasonHalf
        ? {
            id: transaction.seasonHalf.id,
            halfType: transaction.seasonHalf.halfType,
            seasonId: transaction.seasonHalf.seasonId,
            seasonNumber: transaction.seasonHalf.season?.number,
          }
        : undefined,
    }
  }

  static toTransactionDTOArray(transactions: TransactionWithRelations[]): FinancialTransactionDTO[] {
    return transactions.map((t) => this.toTransactionDTO(t))
  }

  // ==================== Balance Mappers ====================

  static toBalanceDTO(balance: BalanceWithRelations): ClubSeasonBalanceDTO {
    return {
      id: balance.id,
      clubId: balance.clubId,
      seasonHalfId: balance.seasonHalfId,
      startingBalance: balance.startingBalance,
      totalIncome: balance.totalIncome,
      totalExpenses: balance.totalExpenses,
      endingBalance: balance.endingBalance,
      totalSalaries: balance.totalSalaries,
      club: balance.club
        ? {
            id: balance.club.id,
            name: balance.club.name,
            shortName: balance.club.shortName,
            logo: balance.club.logo,
          }
        : undefined,
      seasonHalf: balance.seasonHalf
        ? {
            id: balance.seasonHalf.id,
            halfType: balance.seasonHalf.halfType,
            seasonId: balance.seasonHalf.seasonId,
            seasonNumber: balance.seasonHalf.season?.number,
          }
        : undefined,
    }
  }

  static toBalanceDTOArray(balances: BalanceWithRelations[]): ClubSeasonBalanceDTO[] {
    return balances.map((b) => this.toBalanceDTO(b))
  }

  // ==================== Prize Mappers ====================

  static toPrizeDTO(prize: PrizeWithRelations): CompetitionPrizeDTO {
    return {
      id: prize.id,
      competitionTypeId: prize.competitionTypeId,
      position: prize.position,
      prizeAmount: prize.prizeAmount,
      description: prize.description,
      competitionType: prize.competitionType
        ? {
            id: prize.competitionType.id,
            name: prize.competitionType.name,
          }
        : undefined,
    }
  }

  static toPrizeDTOArray(prizes: PrizeWithRelations[]): CompetitionPrizeDTO[] {
    return prizes.map((p) => this.toPrizeDTO(p))
  }
}
