import { Prisma, FinancialTransaction, ClubSeasonBalance, CompetitionPrize } from '@prisma/client'

export interface IFinanceRepository {
  // Financial Transactions
  findAllTransactions(filters?: {
    clubId?: string
    seasonHalfId?: string
    type?: string
  }): Promise<FinancialTransaction[] | null>
  findTransactionById(id: string): Promise<FinancialTransaction | null>
  findTransactionsByClubId(clubId: string, seasonHalfId?: string): Promise<FinancialTransaction[] | null>
  createTransaction(data: Prisma.FinancialTransactionUncheckedCreateInput): Promise<FinancialTransaction>

  // Club Season Balances
  findBalanceByClubAndSeasonHalf(clubId: string, seasonHalfId: string): Promise<ClubSeasonBalance | null>
  findAllBalancesByClub(clubId: string): Promise<ClubSeasonBalance[] | null>
  findAllBalancesBySeasonHalf(seasonHalfId: string): Promise<ClubSeasonBalance[] | null>
  createBalance(data: Prisma.ClubSeasonBalanceUncheckedCreateInput): Promise<ClubSeasonBalance>
  updateBalance(id: string, data: Prisma.ClubSeasonBalanceUpdateInput): Promise<ClubSeasonBalance>
  upsertBalance(
    clubId: string,
    seasonHalfId: string,
    data: Prisma.ClubSeasonBalanceUncheckedCreateInput
  ): Promise<ClubSeasonBalance>

  // Competition Prizes
  findAllPrizes(): Promise<CompetitionPrize[] | null>
  findPrizesByCompetitionType(competitionTypeId: string): Promise<CompetitionPrize[] | null>
  findPrizeById(id: string): Promise<CompetitionPrize | null>
  createPrize(data: Prisma.CompetitionPrizeUncheckedCreateInput): Promise<CompetitionPrize>
  updatePrize(id: string, data: Prisma.CompetitionPrizeUpdateInput): Promise<CompetitionPrize>
  deletePrize(id: string): Promise<CompetitionPrize>
}
