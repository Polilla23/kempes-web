import { TransactionType, Prisma, PrismaClient, TransferType, TransferStatus } from '@prisma/client'
import { IFinanceRepository } from '@/features/finances/interfaces/IFinanceRepository'
import { ISeasonHalfRepository } from '@/features/season-halves/interfaces/ISeasonHalfRepository'
import {
  FinancialTransactionNotFoundError,
  ClubSeasonBalanceNotFoundError,
  CompetitionPrizeNotFoundError,
  InsufficientBalanceError,
  InvalidAmountError,
} from '@/features/finances/finances.errors'

export interface CreateTransactionInput {
  clubId: string
  type: TransactionType
  amount: number
  description: string
  transferId?: string
  installmentId?: string
  seasonHalfId?: string
}

export interface CreatePrizeInput {
  competitionTypeId: string
  position: number
  prizeAmount: number
  description?: string
}

export interface AwardPrizeInput {
  clubId: string
  competitionTypeId: string
  position: number
  seasonHalfId?: string
  description?: string
}

export interface RecordFineInput {
  clubId: string
  amount: number
  description: string
  seasonHalfId?: string
}

export interface RecordBonusInput {
  clubId: string
  amount: number
  description: string
  seasonHalfId?: string
}

export class FinanceService {
  private financeRepository: IFinanceRepository
  private seasonHalfRepository: ISeasonHalfRepository
  private prisma: PrismaClient

  constructor({
    financeRepository,
    seasonHalfRepository,
    prisma,
  }: {
    financeRepository: IFinanceRepository
    seasonHalfRepository: ISeasonHalfRepository
    prisma: PrismaClient
  }) {
    this.financeRepository = financeRepository
    this.seasonHalfRepository = seasonHalfRepository
    this.prisma = prisma
  }

  // ==================== Transactions ====================

  async findAllTransactions(filters?: { clubId?: string; seasonHalfId?: string; type?: string }) {
    return await this.financeRepository.findAllTransactions(filters)
  }

  async findTransaction(id: string) {
    const transaction = await this.financeRepository.findTransactionById(id)
    if (!transaction) {
      throw new FinancialTransactionNotFoundError()
    }
    return transaction
  }

  async findTransactionsByClub(clubId: string, seasonHalfId?: string) {
    return await this.financeRepository.findTransactionsByClubId(clubId, seasonHalfId)
  }

  async createTransaction(input: CreateTransactionInput) {
    let seasonHalfId = input.seasonHalfId

    // Si no se proporciona seasonHalfId, usar la activa
    if (!seasonHalfId) {
      const activeSeasonHalf = await this.seasonHalfRepository.findActive()
      if (!activeSeasonHalf) {
        throw new Error('No active season half found')
      }
      seasonHalfId = activeSeasonHalf.id
    }

    const transactionData: Prisma.FinancialTransactionUncheckedCreateInput = {
      clubId: input.clubId,
      type: input.type,
      amount: input.amount,
      description: input.description,
      transferId: input.transferId,
      installmentId: input.installmentId,
      seasonHalfId,
    }

    const transaction = await this.financeRepository.createTransaction(transactionData)

    // Actualizar balance del club
    await this.updateClubBalance(input.clubId, seasonHalfId, input.amount, input.type)

    return transaction
  }

  // ==================== Balances ====================

  async getClubBalance(clubId: string, seasonHalfId?: string) {
    let targetSeasonHalfId = seasonHalfId

    if (!targetSeasonHalfId) {
      const activeSeasonHalf = await this.seasonHalfRepository.findActive()
      if (!activeSeasonHalf) {
        throw new Error('No active season half found')
      }
      targetSeasonHalfId = activeSeasonHalf.id
    }

    const balance = await this.financeRepository.findBalanceByClubAndSeasonHalf(clubId, targetSeasonHalfId)

    if (!balance) {
      // Crear balance inicial si no existe
      return await this.initializeClubBalance(clubId, targetSeasonHalfId)
    }

    return balance
  }

  async getAllClubBalances(clubId: string) {
    return await this.financeRepository.findAllBalancesByClub(clubId)
  }

  async getSeasonHalfBalances(seasonHalfId: string) {
    return await this.financeRepository.findAllBalancesBySeasonHalf(seasonHalfId)
  }

  async initializeClubBalance(clubId: string, seasonHalfId: string, startingBalance: number = 0) {
    // Verificar si ya existe
    const existing = await this.financeRepository.findBalanceByClubAndSeasonHalf(clubId, seasonHalfId)
    if (existing) {
      return existing
    }

    // Si no es la primera media temporada, obtener el balance final de la media anterior
    const previousHalf = await this.seasonHalfRepository.findPrevious(seasonHalfId)
    if (previousHalf) {
      const previousBalance = await this.financeRepository.findBalanceByClubAndSeasonHalf(clubId, previousHalf.id)
      if (previousBalance) {
        startingBalance = previousBalance.endingBalance
      }
    }

    return await this.financeRepository.createBalance({
      clubId,
      seasonHalfId,
      startingBalance,
      totalIncome: 0,
      totalExpenses: 0,
      endingBalance: startingBalance,
      totalSalaries: 0,
    })
  }

  async updateClubBalance(clubId: string, seasonHalfId: string, amount: number, type: TransactionType) {
    let balance = await this.financeRepository.findBalanceByClubAndSeasonHalf(clubId, seasonHalfId)

    if (!balance) {
      balance = await this.initializeClubBalance(clubId, seasonHalfId)
    }

    const isIncome = this.isIncomeTransaction(type)
    const isSalary = type === 'SALARY_EXPENSE'

    const updates: Prisma.ClubSeasonBalanceUpdateInput = {
      totalIncome: isIncome ? { increment: Math.abs(amount) } : undefined,
      totalExpenses: !isIncome ? { increment: Math.abs(amount) } : undefined,
      totalSalaries: isSalary ? { increment: Math.abs(amount) } : undefined,
      endingBalance: isIncome ? { increment: Math.abs(amount) } : { decrement: Math.abs(amount) },
    }

    return await this.financeRepository.updateBalance(balance.id, updates)
  }

  async checkSufficientBalance(clubId: string, requiredAmount: number, seasonHalfId?: string) {
    const balance = await this.getClubBalance(clubId, seasonHalfId)

    if (balance.endingBalance < requiredAmount) {
      throw new InsufficientBalanceError(requiredAmount, balance.endingBalance)
    }

    return true
  }

  // ==================== Prizes ====================

  async findAllPrizes() {
    return await this.financeRepository.findAllPrizes()
  }

  async findPrizesByCompetitionType(competitionTypeId: string) {
    return await this.financeRepository.findPrizesByCompetitionType(competitionTypeId)
  }

  async findPrize(id: string) {
    const prize = await this.financeRepository.findPrizeById(id)
    if (!prize) {
      throw new CompetitionPrizeNotFoundError()
    }
    return prize
  }

  async createPrize(input: CreatePrizeInput) {
    if (input.prizeAmount < 0) {
      throw new InvalidAmountError('Prize amount must be non-negative')
    }

    return await this.financeRepository.createPrize({
      competitionTypeId: input.competitionTypeId,
      position: input.position,
      prizeAmount: input.prizeAmount,
      description: input.description,
    })
  }

  async updatePrize(id: string, data: { prizeAmount?: number; description?: string }) {
    const prize = await this.financeRepository.findPrizeById(id)
    if (!prize) {
      throw new CompetitionPrizeNotFoundError()
    }

    if (data.prizeAmount !== undefined && data.prizeAmount < 0) {
      throw new InvalidAmountError('Prize amount must be non-negative')
    }

    return await this.financeRepository.updatePrize(id, data)
  }

  async deletePrize(id: string) {
    const prize = await this.financeRepository.findPrizeById(id)
    if (!prize) {
      throw new CompetitionPrizeNotFoundError()
    }

    return await this.financeRepository.deletePrize(id)
  }

  async awardPrize(input: AwardPrizeInput) {
    // Buscar el premio para la posición
    const prizes = await this.financeRepository.findPrizesByCompetitionType(input.competitionTypeId)
    const prize = prizes?.find((p) => p.position === input.position)

    if (!prize) {
      throw new CompetitionPrizeNotFoundError()
    }

    const description = input.description || `Premio por posición ${input.position} - ${prize.description || ''}`

    // Crear transacción de ingreso
    return await this.createTransaction({
      clubId: input.clubId,
      type: 'PRIZE_INCOME',
      amount: prize.prizeAmount,
      description,
      seasonHalfId: input.seasonHalfId,
    })
  }

  // ==================== Fines & Bonuses ====================

  async recordFine(input: RecordFineInput) {
    if (input.amount <= 0) {
      throw new InvalidAmountError('Fine amount must be positive')
    }

    return await this.createTransaction({
      clubId: input.clubId,
      type: 'FINE_EXPENSE',
      amount: -Math.abs(input.amount), // Asegurar que sea negativo
      description: input.description,
      seasonHalfId: input.seasonHalfId,
    })
  }

  async recordBonus(input: RecordBonusInput) {
    if (input.amount <= 0) {
      throw new InvalidAmountError('Bonus amount must be positive')
    }

    return await this.createTransaction({
      clubId: input.clubId,
      type: 'BONUS_INCOME',
      amount: Math.abs(input.amount),
      description: input.description,
      seasonHalfId: input.seasonHalfId,
    })
  }

  // ==================== Financial Report ====================

  async getClubFinancialReport(clubId: string, seasonHalfId?: string) {
    const balance = await this.getClubBalance(clubId, seasonHalfId)
    const transactions = await this.findTransactionsByClub(clubId, balance.seasonHalfId)

    // Agrupar transacciones por tipo
    const transactionsByType: Record<string, { count: number; total: number }> = {}
    transactions?.forEach((t) => {
      if (!transactionsByType[t.type]) {
        transactionsByType[t.type] = { count: 0, total: 0 }
      }
      transactionsByType[t.type].count++
      transactionsByType[t.type].total += t.amount
    })

    return {
      clubId,
      seasonHalfId: balance.seasonHalfId,
      balance: {
        starting: balance.startingBalance,
        income: balance.totalIncome,
        expenses: balance.totalExpenses,
        salaries: balance.totalSalaries,
        ending: balance.endingBalance,
      },
      transactionSummary: transactionsByType,
      transactionCount: transactions?.length || 0,
    }
  }

  // ==================== Salary Processing ====================

  async processSalaries(seasonHalfId: string) {
    // Verificar idempotencia — si ya se procesaron salarios para este seasonHalf
    const existingSalaryTransactions = await this.financeRepository.findAllTransactions({
      seasonHalfId,
      type: 'SALARY_EXPENSE',
    })

    if (existingSalaryTransactions && existingSalaryTransactions.length > 0) {
      throw new Error('Salaries have already been processed for this season half')
    }

    // Obtener todos los jugadores activos con su club actual
    const players = await this.prisma.player.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        salary: true,
        actualClubId: true,
        ownerClubId: true,
        isKempesita: true,
      },
    })

    // Obtener préstamos activos para calcular porcentaje de salario
    const activeLoans = await this.prisma.transfer.findMany({
      where: {
        type: { in: [TransferType.LOAN_OUT, TransferType.LOAN_IN] },
        status: TransferStatus.ACTIVE,
      },
      select: {
        playerId: true,
        toClubId: true,
        fromClubId: true,
        loanSalaryPercentage: true,
      },
    })

    // Crear mapa de préstamos por playerId
    const loanMap = new Map<string, { toClubId: string; fromClubId: string; percentage: number }>()
    for (const loan of activeLoans) {
      loanMap.set(loan.playerId, {
        toClubId: loan.toClubId,
        fromClubId: loan.fromClubId,
        percentage: loan.loanSalaryPercentage ?? 100,
      })
    }

    // Agrupar salarios por club
    const clubSalaries = new Map<string, { totalSalary: number; playerCount: number; playerDetails: Array<{ playerId: string; salary: number; percentage: number }> }>()

    for (const player of players) {
      const clubId = player.actualClubId
      const loan = loanMap.get(player.id)

      // Porcentaje de salario que paga el club actual
      const salaryPercentage = loan ? loan.percentage : 100
      const effectiveSalary = (player.salary * salaryPercentage) / 100

      if (!clubSalaries.has(clubId)) {
        clubSalaries.set(clubId, { totalSalary: 0, playerCount: 0, playerDetails: [] })
      }

      const clubData = clubSalaries.get(clubId)!
      clubData.totalSalary += effectiveSalary
      clubData.playerCount++
      clubData.playerDetails.push({
        playerId: player.id,
        salary: effectiveSalary,
        percentage: salaryPercentage,
      })

      // Si está en préstamo y el club dueño paga parte del salario
      if (loan && salaryPercentage < 100) {
        const ownerClubId = loan.fromClubId
        const ownerPortion = (player.salary * (100 - salaryPercentage)) / 100

        if (!clubSalaries.has(ownerClubId)) {
          clubSalaries.set(ownerClubId, { totalSalary: 0, playerCount: 0, playerDetails: [] })
        }

        const ownerData = clubSalaries.get(ownerClubId)!
        ownerData.totalSalary += ownerPortion
      }
    }

    // Obtener nombres de clubes
    const clubIds = Array.from(clubSalaries.keys())
    const clubs = await this.prisma.club.findMany({
      where: { id: { in: clubIds } },
      select: { id: true, name: true },
    })
    const clubNameMap = new Map(clubs.map(c => [c.id, c.name]))

    // Crear transacciones y registros PlayerSeasonHalfClub
    const details: Array<{ clubId: string; clubName: string; totalSalary: number; playerCount: number }> = []
    let totalSalariesPaid = 0

    for (const [clubId, data] of clubSalaries) {
      if (data.totalSalary <= 0) continue

      // Crear transacción SALARY_EXPENSE
      await this.createTransaction({
        clubId,
        type: 'SALARY_EXPENSE',
        amount: -Math.abs(data.totalSalary),
        description: `Salarios media temporada - ${data.playerCount} jugadores`,
        seasonHalfId,
      })

      // Crear registros PlayerSeasonHalfClub
      for (const pd of data.playerDetails) {
        await this.prisma.playerSeasonHalfClub.upsert({
          where: {
            playerId_seasonHalfId_clubId: {
              playerId: pd.playerId,
              seasonHalfId,
              clubId,
            },
          },
          create: {
            playerId: pd.playerId,
            seasonHalfId,
            clubId,
            salaryPaid: pd.salary,
            salaryPercentage: pd.percentage,
          },
          update: {
            salaryPaid: pd.salary,
            salaryPercentage: pd.percentage,
          },
        })
      }

      details.push({
        clubId,
        clubName: clubNameMap.get(clubId) || 'Unknown',
        totalSalary: data.totalSalary,
        playerCount: data.playerCount,
      })

      totalSalariesPaid += data.totalSalary
    }

    return {
      clubsProcessed: details.length,
      totalSalariesPaid,
      details,
    }
  }

  // ==================== Helper Methods ====================

  private isIncomeTransaction(type: TransactionType): boolean {
    return [
      'TRANSFER_INCOME',
      'LOAN_FEE_INCOME',
      'PRIZE_INCOME',
      'BONUS_INCOME',
      'AUCTION_INCOME',
      'PLAYER_SWAP_CREDIT',
    ].includes(type)
  }
}
