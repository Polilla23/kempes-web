import { FastifyRequest, FastifyReply } from 'fastify'
import {
  TransferService,
  CreateTransferInput,
  CreateLoanInput,
  CreateAuctionInput,
  SignFreeAgentInput,
} from '@/features/transfers/transfers.service'
import { TransferMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { TransferType } from '@prisma/client'

export class TransferController {
  private transferService: TransferService

  constructor({ transferService }: { transferService: TransferService }) {
    this.transferService = transferService
  }

  async findAll(
    req: FastifyRequest<{
      Querystring: { type?: string; status?: string; seasonHalfId?: string; transferWindowId?: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const filters = req.query as any
      const transfers = await this.transferService.findAllTransfers(filters)
      const dtos = TransferMapper.toDTOArray(transfers ?? [])

      return Response.success(reply, dtos, 'Transfers fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching transfers',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const transfer = await this.transferService.findTransfer(validId)
      const dto = TransferMapper.toDTO(transfer)

      return Response.success(reply, dto, 'Transfer fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching transfer',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findByPlayerId(req: FastifyRequest<{ Params: { playerId: string } }>, reply: FastifyReply) {
    const { playerId } = req.params

    try {
      const validId = Validator.uuid(playerId)
      const transfers = await this.transferService.findByPlayerId(validId)
      const dtos = TransferMapper.toDTOArray(transfers ?? [])

      return Response.success(reply, dtos, 'Player transfers fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching player transfers',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findByClubId(
    req: FastifyRequest<{ Params: { clubId: string }; Querystring: { direction?: string } }>,
    reply: FastifyReply
  ) {
    const { clubId } = req.params
    const { direction } = req.query

    try {
      const validId = Validator.uuid(clubId)
      const dir = direction as 'from' | 'to' | 'both' | undefined
      const transfers = await this.transferService.findByClubId(validId, dir)
      const dtos = TransferMapper.toDTOArray(transfers ?? [])

      return Response.success(reply, dtos, 'Club transfers fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching club transfers',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findActiveLoans(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const loans = await this.transferService.findActiveLoans()
      const dtos = TransferMapper.toDTOArray(loans ?? [])

      return Response.success(reply, dtos, 'Active loans fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching active loans',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // Obtener transferencias pendientes de confirmación para un club
  async findPendingConfirmations(
    req: FastifyRequest<{ Params: { clubId: string } }>,
    reply: FastifyReply
  ) {
    const { clubId } = req.params

    try {
      const validId = Validator.uuid(clubId)
      const transfers = await this.transferService.findPendingConfirmations(validId)
      const dtos = TransferMapper.toDTOArray(transfers ?? [])

      return Response.success(reply, dtos, 'Pending confirmations fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching pending confirmations',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getRosterCount(req: FastifyRequest<{ Params: { clubId: string } }>, reply: FastifyReply) {
    const { clubId } = req.params

    try {
      const validId = Validator.uuid(clubId)
      const count = await this.transferService.getClubRosterCount(validId)

      return Response.success(reply, count, 'Roster count fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching roster count',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async create(req: FastifyRequest<{ Body: CreateTransferInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: CreateTransferInput = {
        type: body.type as TransferType,
        playerId: Validator.uuid(body.playerId),
        fromClubId: Validator.uuid(body.fromClubId),
        toClubId: Validator.uuid(body.toClubId),
        initiatorClubId: Validator.uuid(body.initiatorClubId),
        totalAmount: Validator.number(body.totalAmount, 0),
        numberOfInstallments: Validator.number(body.numberOfInstallments, 1),
        transferWindowId: body.transferWindowId ? Validator.uuid(body.transferWindowId) : undefined,
        installments: body.installments,
        playersAsPayment: body.playersAsPayment,
        notes: body.notes,
      }

      const transfer = await this.transferService.createTransfer(input)
      const dto = TransferMapper.toDTO(transfer!)

      return Response.created(reply, dto, 'Transfer created successfully')
    } catch (error: any) {
      if (error.message.includes('window')) {
        return Response.validation(reply, error.message, 'Transfer window closed')
      }
      if (error.message.includes('Roster limit')) {
        return Response.validation(reply, error.message, 'Roster limit exceeded')
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating transfer',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async createLoan(req: FastifyRequest<{ Body: CreateLoanInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: CreateLoanInput = {
        playerId: Validator.uuid(body.playerId),
        fromClubId: Validator.uuid(body.fromClubId),
        toClubId: Validator.uuid(body.toClubId),
        loanDurationHalves: Validator.number(body.loanDurationHalves, 1, 8),
        loanFee: body.loanFee ? Validator.number(body.loanFee, 0) : undefined,
        numberOfInstallments: body.numberOfInstallments
          ? Validator.number(body.numberOfInstallments, 1)
          : undefined,
        loanSalaryPercentage: body.loanSalaryPercentage
          ? Validator.number(body.loanSalaryPercentage, 0, 100)
          : undefined,
        transferWindowId: body.transferWindowId ? Validator.uuid(body.transferWindowId) : undefined,
        notes: body.notes,
      }

      const loan = await this.transferService.createLoan(input)
      const dto = TransferMapper.toDTO(loan!)

      return Response.created(reply, dto, 'Loan created successfully')
    } catch (error: any) {
      if (error.message.includes('window')) {
        return Response.validation(reply, error.message, 'Transfer window closed')
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating loan',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async createAuction(req: FastifyRequest<{ Body: CreateAuctionInput }>, reply: FastifyReply) {
    const body = req.body

    try {
      const input: CreateAuctionInput = {
        playerId: Validator.uuid(body.playerId),
        toClubId: Validator.uuid(body.toClubId),
        auctionPrice: Validator.number(body.auctionPrice, 0),
        notes: body.notes,
      }

      const auction = await this.transferService.createAuction(input)
      const dto = TransferMapper.toDTO(auction!)

      return Response.created(reply, dto, 'Auction created successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating auction',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async signFreeAgent(
    req: FastifyRequest<{ Body: SignFreeAgentInput & { freeClubId: string } }>,
    reply: FastifyReply
  ) {
    const body = req.body

    try {
      const input: SignFreeAgentInput = {
        playerId: Validator.uuid(body.playerId),
        toClubId: Validator.uuid(body.toClubId),
        signingFee: Validator.number(body.signingFee, 0),
        notes: body.notes,
      }

      const freeClubId = Validator.uuid(body.freeClubId)
      const transfer = await this.transferService.signFreeAgent(input, freeClubId)
      const dto = TransferMapper.toDTO(transfer!)

      return Response.created(reply, dto, 'Free agent signed successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while signing free agent',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async markInactive(
    req: FastifyRequest<{ Body: { playerId: string; clubId: string } }>,
    reply: FastifyReply
  ) {
    const { playerId, clubId } = req.body

    try {
      const validPlayerId = Validator.uuid(playerId)
      const validClubId = Validator.uuid(clubId)

      const transfer = await this.transferService.markPlayerInactive(validPlayerId, validClubId)
      const dto = TransferMapper.toDTO(transfer)

      return Response.success(reply, dto, 'Player marked as inactive')
    } catch (error) {
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while marking player inactive',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async complete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const transfer = await this.transferService.completeTransfer(validId)
      const dto = TransferMapper.toDTO(transfer)

      return Response.success(reply, dto, 'Transfer completed successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while completing transfer',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async cancel(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const transfer = await this.transferService.cancelTransfer(validId)
      const dto = TransferMapper.toDTO(transfer)

      return Response.success(reply, dto, 'Transfer cancelled successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while cancelling transfer',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.transferService.deleteTransfer(validId)

      return Response.success(reply, null, 'Transfer deleted successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting transfer',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // Aprobar una transferencia pendiente
  async approve(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const transfer = await this.transferService.approveTransfer(validId)
      const dto = TransferMapper.toDTO(transfer)

      return Response.success(reply, dto, 'Transfer approved successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer', id)
      }
      if (error instanceof Error && error.message.includes('not pending')) {
        return Response.validation(reply, error.message, 'Transfer is not pending approval')
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while approving transfer',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // Rechazar una transferencia pendiente
  async reject(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const transfer = await this.transferService.rejectTransfer(validId)
      const dto = TransferMapper.toDTO(transfer)

      return Response.success(reply, dto, 'Transfer rejected successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer', id)
      }
      if (error instanceof Error && error.message.includes('not pending')) {
        return Response.validation(reply, error.message, 'Transfer is not pending approval')
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while rejecting transfer',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
