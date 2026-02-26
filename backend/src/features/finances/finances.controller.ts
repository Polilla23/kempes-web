import { FastifyRequest, FastifyReply } from 'fastify'
import {
  FinanceService,
  CreateTransactionInput,
  CreatePrizeInput,
  AwardPrizeInput,
  RecordFineInput,
  RecordBonusInput,
} from '@/features/finances/finances.service'
import { FinanceMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { TransactionType } from '@prisma/client'

export class FinanceController {
  private financeService: FinanceService

  constructor({ financeService }: { financeService: FinanceService }) {
    this.financeService = financeService
  }

  // ==================== Transactions ====================

  async findAllTransactions(
    req: FastifyRequest<{ Querystring: { clubId?: string; seasonHalfId?: string; type?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const filters = {
        clubId: req.query.clubId,
        seasonHalfId: req.query.seasonHalfId,
        type: req.query.type,
      }
      const transactions = await this.financeService.findAllTransactions(filters)
      const dtos = FinanceMapper.toTransactionDTOArray(transactions ?? [])

      return Response.success(reply, dtos, 'Transactions fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching transactions',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findTransaction(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const transaction = await this.financeService.findTransaction(validId)
      const dto = FinanceMapper.toTransactionDTO(transaction)

      return Response.success(reply, dto, 'Transaction fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transaction', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching transaction',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findTransactionsByClub(
    req: FastifyRequest<{ Params: { clubId: string }; Querystring: { seasonHalfId?: string } }>,
    reply: FastifyReply
  ) {
    const { clubId } = req.params
    const { seasonHalfId } = req.query

    try {
      const validClubId = Validator.uuid(clubId)
      const validSeasonHalfId = seasonHalfId ? Validator.uuid(seasonHalfId) : undefined
      const transactions = await this.financeService.findTransactionsByClub(validClubId, validSeasonHalfId)
      const dtos = FinanceMapper.toTransactionDTOArray(transactions ?? [])

      return Response.success(reply, dtos, 'Club transactions fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching club transactions',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async createTransaction(req: FastifyRequest<{ Body: CreateTransactionInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: CreateTransactionInput = {
        clubId: Validator.uuid(body.clubId),
        type: body.type as TransactionType,
        amount: Validator.number(body.amount),
        description: body.description,
        transferId: body.transferId ? Validator.uuid(body.transferId) : undefined,
        installmentId: body.installmentId ? Validator.uuid(body.installmentId) : undefined,
        seasonHalfId: body.seasonHalfId ? Validator.uuid(body.seasonHalfId) : undefined,
      }

      const transaction = await this.financeService.createTransaction(input)
      const dto = FinanceMapper.toTransactionDTO(transaction)

      return Response.created(reply, dto, 'Transaction created successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating transaction',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ==================== Balances ====================

  async getClubBalance(
    req: FastifyRequest<{ Params: { clubId: string }; Querystring: { seasonHalfId?: string } }>,
    reply: FastifyReply
  ) {
    const { clubId } = req.params
    const { seasonHalfId } = req.query

    try {
      const validClubId = Validator.uuid(clubId)
      const validSeasonHalfId = seasonHalfId ? Validator.uuid(seasonHalfId) : undefined
      const balance = await this.financeService.getClubBalance(validClubId, validSeasonHalfId)
      const dto = FinanceMapper.toBalanceDTO(balance)

      return Response.success(reply, dto, 'Club balance fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching club balance',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getAllClubBalances(req: FastifyRequest<{ Params: { clubId: string } }>, reply: FastifyReply) {
    const { clubId } = req.params

    try {
      const validClubId = Validator.uuid(clubId)
      const balances = await this.financeService.getAllClubBalances(validClubId)
      const dtos = FinanceMapper.toBalanceDTOArray(balances ?? [])

      return Response.success(reply, dtos, 'Club balances fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching club balances',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getSeasonHalfBalances(req: FastifyRequest<{ Params: { seasonHalfId: string } }>, reply: FastifyReply) {
    const { seasonHalfId } = req.params

    try {
      const validSeasonHalfId = Validator.uuid(seasonHalfId)
      const balances = await this.financeService.getSeasonHalfBalances(validSeasonHalfId)
      const dtos = FinanceMapper.toBalanceDTOArray(balances ?? [])

      return Response.success(reply, dtos, 'Season half balances fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season half balances',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async initializeClubBalance(
    req: FastifyRequest<{ Body: { clubId: string; seasonHalfId: string; startingBalance?: number } }>,
    reply: FastifyReply
  ) {
    const { clubId, seasonHalfId, startingBalance } = req.body

    try {
      const validClubId = Validator.uuid(clubId)
      const validSeasonHalfId = Validator.uuid(seasonHalfId)
      const balance = await this.financeService.initializeClubBalance(
        validClubId,
        validSeasonHalfId,
        startingBalance ?? 0
      )
      const dto = FinanceMapper.toBalanceDTO(balance)

      return Response.created(reply, dto, 'Club balance initialized successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while initializing club balance',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ==================== Prizes ====================

  async findAllPrizes(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const prizes = await this.financeService.findAllPrizes()
      const dtos = FinanceMapper.toPrizeDTOArray(prizes ?? [])

      return Response.success(reply, dtos, 'Prizes fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching prizes',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findPrizesByCompetitionType(
    req: FastifyRequest<{ Params: { competitionTypeId: string } }>,
    reply: FastifyReply
  ) {
    const { competitionTypeId } = req.params

    try {
      const validId = Validator.uuid(competitionTypeId)
      const prizes = await this.financeService.findPrizesByCompetitionType(validId)
      const dtos = FinanceMapper.toPrizeDTOArray(prizes ?? [])

      return Response.success(reply, dtos, 'Competition type prizes fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching competition type prizes',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findPrize(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const prize = await this.financeService.findPrize(validId)
      const dto = FinanceMapper.toPrizeDTO(prize)

      return Response.success(reply, dto, 'Prize fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Prize', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching prize',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async createPrize(req: FastifyRequest<{ Body: CreatePrizeInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: CreatePrizeInput = {
        competitionTypeId: Validator.uuid(body.competitionTypeId),
        position: Validator.number(body.position, 1),
        prizeAmount: Validator.number(body.prizeAmount, 0),
        description: body.description,
      }

      const prize = await this.financeService.createPrize(input)
      const dto = FinanceMapper.toPrizeDTO(prize)

      return Response.created(reply, dto, 'Prize created successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating prize',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async updatePrize(
    req: FastifyRequest<{ Params: { id: string }; Body: { prizeAmount?: number; description?: string } }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const body = req.body

    try {
      const validId = Validator.uuid(id)
      const prize = await this.financeService.updatePrize(validId, {
        prizeAmount: body.prizeAmount,
        description: body.description,
      })
      const dto = FinanceMapper.toPrizeDTO(prize)

      return Response.success(reply, dto, 'Prize updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Prize', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating prize',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async deletePrize(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.financeService.deletePrize(validId)

      return Response.success(reply, null, 'Prize deleted successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Prize', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting prize',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async awardPrize(req: FastifyRequest<{ Body: AwardPrizeInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: AwardPrizeInput = {
        clubId: Validator.uuid(body.clubId),
        competitionTypeId: Validator.uuid(body.competitionTypeId),
        position: Validator.number(body.position, 1),
        seasonHalfId: body.seasonHalfId ? Validator.uuid(body.seasonHalfId) : undefined,
        description: body.description,
      }

      const transaction = await this.financeService.awardPrize(input)
      const dto = FinanceMapper.toTransactionDTO(transaction)

      return Response.created(reply, dto, 'Prize awarded successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.validation(reply, 'Prize configuration not found', error.message)
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while awarding prize',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ==================== Fines & Bonuses ====================

  async recordFine(req: FastifyRequest<{ Body: RecordFineInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: RecordFineInput = {
        clubId: Validator.uuid(body.clubId),
        amount: Validator.number(body.amount, 0),
        description: body.description,
        seasonHalfId: body.seasonHalfId ? Validator.uuid(body.seasonHalfId) : undefined,
      }

      const transaction = await this.financeService.recordFine(input)
      const dto = FinanceMapper.toTransactionDTO(transaction)

      return Response.created(reply, dto, 'Fine recorded successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while recording fine',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async recordBonus(req: FastifyRequest<{ Body: RecordBonusInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: RecordBonusInput = {
        clubId: Validator.uuid(body.clubId),
        amount: Validator.number(body.amount, 0),
        description: body.description,
        seasonHalfId: body.seasonHalfId ? Validator.uuid(body.seasonHalfId) : undefined,
      }

      const transaction = await this.financeService.recordBonus(input)
      const dto = FinanceMapper.toTransactionDTO(transaction)

      return Response.created(reply, dto, 'Bonus recorded successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while recording bonus',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ==================== Salary Processing ====================

  async processSalaries(
    req: FastifyRequest<{ Body: { seasonHalfId: string } }>,
    reply: FastifyReply
  ) {
    const { seasonHalfId } = req.body

    try {
      const validSeasonHalfId = Validator.uuid(seasonHalfId)
      const result = await this.financeService.processSalaries(validSeasonHalfId)

      return Response.success(reply, result, 'Salaries processed successfully')
    } catch (error: any) {
      if (error.message?.includes('already been processed')) {
        return Response.validation(reply, error.message, 'Salaries already processed')
      }
      return Response.error(
        reply,
        'PROCESS_ERROR',
        'Error while processing salaries',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ==================== Financial Report ====================

  async getClubFinancialReport(
    req: FastifyRequest<{ Params: { clubId: string }; Querystring: { seasonHalfId?: string } }>,
    reply: FastifyReply
  ) {
    const { clubId } = req.params
    const { seasonHalfId } = req.query

    try {
      const validClubId = Validator.uuid(clubId)
      const validSeasonHalfId = seasonHalfId ? Validator.uuid(seasonHalfId) : undefined
      const report = await this.financeService.getClubFinancialReport(validClubId, validSeasonHalfId)

      return Response.success(reply, report, 'Financial report fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching financial report',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
