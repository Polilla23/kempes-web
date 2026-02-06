import { PrismaClient, Prisma, FinancialTransaction, ClubSeasonBalance, CompetitionPrize } from '@prisma/client'
import { IFinanceRepository } from '@/features/finances/interfaces/IFinanceRepository'

export class FinanceRepository implements IFinanceRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  // ==================== Financial Transactions ====================

  async findAllTransactions(filters?: {
    clubId?: string
    seasonHalfId?: string
    type?: string
  }): Promise<FinancialTransaction[] | null> {
    const where: Prisma.FinancialTransactionWhereInput = {}

    if (filters?.clubId) {
      where.clubId = filters.clubId
    }
    if (filters?.seasonHalfId) {
      where.seasonHalfId = filters.seasonHalfId
    }
    if (filters?.type) {
      where.type = filters.type as any
    }

    return await this.prisma.financialTransaction.findMany({
      where,
      include: {
        club: true,
        seasonHalf: {
          include: {
            season: true,
          },
        },
        transfer: true,
        installment: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findTransactionById(id: string): Promise<FinancialTransaction | null> {
    return await this.prisma.financialTransaction.findUnique({
      where: { id },
      include: {
        club: true,
        seasonHalf: {
          include: {
            season: true,
          },
        },
        transfer: true,
        installment: true,
      },
    })
  }

  async findTransactionsByClubId(clubId: string, seasonHalfId?: string): Promise<FinancialTransaction[] | null> {
    const where: Prisma.FinancialTransactionWhereInput = { clubId }

    if (seasonHalfId) {
      where.seasonHalfId = seasonHalfId
    }

    return await this.prisma.financialTransaction.findMany({
      where,
      include: {
        club: true,
        seasonHalf: {
          include: {
            season: true,
          },
        },
        transfer: true,
        installment: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createTransaction(data: Prisma.FinancialTransactionUncheckedCreateInput): Promise<FinancialTransaction> {
    return await this.prisma.financialTransaction.create({
      data,
      include: {
        club: true,
        seasonHalf: true,
        transfer: true,
        installment: true,
      },
    })
  }

  // ==================== Club Season Balances ====================

  async findBalanceByClubAndSeasonHalf(clubId: string, seasonHalfId: string): Promise<ClubSeasonBalance | null> {
    return await this.prisma.clubSeasonBalance.findUnique({
      where: {
        clubId_seasonHalfId: {
          clubId,
          seasonHalfId,
        },
      },
      include: {
        club: true,
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
    })
  }

  async findAllBalancesByClub(clubId: string): Promise<ClubSeasonBalance[] | null> {
    return await this.prisma.clubSeasonBalance.findMany({
      where: { clubId },
      include: {
        club: true,
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
      orderBy: {
        seasonHalf: {
          season: {
            number: 'desc',
          },
        },
      },
    })
  }

  async findAllBalancesBySeasonHalf(seasonHalfId: string): Promise<ClubSeasonBalance[] | null> {
    return await this.prisma.clubSeasonBalance.findMany({
      where: { seasonHalfId },
      include: {
        club: true,
        seasonHalf: {
          include: {
            season: true,
          },
        },
      },
      orderBy: {
        endingBalance: 'desc',
      },
    })
  }

  async createBalance(data: Prisma.ClubSeasonBalanceUncheckedCreateInput): Promise<ClubSeasonBalance> {
    return await this.prisma.clubSeasonBalance.create({
      data,
      include: {
        club: true,
        seasonHalf: true,
      },
    })
  }

  async updateBalance(id: string, data: Prisma.ClubSeasonBalanceUpdateInput): Promise<ClubSeasonBalance> {
    return await this.prisma.clubSeasonBalance.update({
      where: { id },
      data,
      include: {
        club: true,
        seasonHalf: true,
      },
    })
  }

  async upsertBalance(
    clubId: string,
    seasonHalfId: string,
    data: Prisma.ClubSeasonBalanceUncheckedCreateInput
  ): Promise<ClubSeasonBalance> {
    return await this.prisma.clubSeasonBalance.upsert({
      where: {
        clubId_seasonHalfId: {
          clubId,
          seasonHalfId,
        },
      },
      create: data,
      update: {
        totalIncome: data.totalIncome,
        totalExpenses: data.totalExpenses,
        endingBalance: data.endingBalance,
        totalSalaries: data.totalSalaries,
      },
      include: {
        club: true,
        seasonHalf: true,
      },
    })
  }

  // ==================== Competition Prizes ====================

  async findAllPrizes(): Promise<CompetitionPrize[] | null> {
    return await this.prisma.competitionPrize.findMany({
      include: {
        competitionType: true,
      },
      orderBy: [
        { competitionTypeId: 'asc' },
        { position: 'asc' },
      ],
    })
  }

  async findPrizesByCompetitionType(competitionTypeId: string): Promise<CompetitionPrize[] | null> {
    return await this.prisma.competitionPrize.findMany({
      where: { competitionTypeId },
      include: {
        competitionType: true,
      },
      orderBy: { position: 'asc' },
    })
  }

  async findPrizeById(id: string): Promise<CompetitionPrize | null> {
    return await this.prisma.competitionPrize.findUnique({
      where: { id },
      include: {
        competitionType: true,
      },
    })
  }

  async createPrize(data: Prisma.CompetitionPrizeUncheckedCreateInput): Promise<CompetitionPrize> {
    return await this.prisma.competitionPrize.create({
      data,
      include: {
        competitionType: true,
      },
    })
  }

  async updatePrize(id: string, data: Prisma.CompetitionPrizeUpdateInput): Promise<CompetitionPrize> {
    return await this.prisma.competitionPrize.update({
      where: { id },
      data,
      include: {
        competitionType: true,
      },
    })
  }

  async deletePrize(id: string): Promise<CompetitionPrize> {
    return await this.prisma.competitionPrize.delete({
      where: { id },
    })
  }
}
