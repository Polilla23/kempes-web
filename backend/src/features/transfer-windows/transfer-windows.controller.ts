import { FastifyRequest, FastifyReply } from 'fastify'
import { TransferWindowService, CreateTransferWindowInput } from '@/features/transfer-windows/transfer-windows.service'
import { TransferWindowMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class TransferWindowController {
  private transferWindowService: TransferWindowService

  constructor({ transferWindowService }: { transferWindowService: TransferWindowService }) {
    this.transferWindowService = transferWindowService
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const transferWindows = await this.transferWindowService.findAllTransferWindows()
      const dtos = TransferWindowMapper.toDTOArray(transferWindows ?? [])

      if (dtos.length === 0) {
        return Response.success(reply, [], 'No transfer windows found')
      }

      return Response.success(reply, dtos, 'Transfer windows fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching transfer windows',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const transferWindow = await this.transferWindowService.findTransferWindow(validId)
      const dto = TransferWindowMapper.toDTO(transferWindow)

      return Response.success(reply, dto, 'Transfer window fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer window', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching transfer window',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findActive(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const activeWindow = await this.transferWindowService.findActiveTransferWindow()
      const dto = TransferWindowMapper.toDTO(activeWindow)

      return Response.success(reply, dto, 'Active transfer window fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('No active')) {
        return Response.success(reply, null, 'No active transfer window')
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching active transfer window',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async isOpen(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const isOpen = await this.transferWindowService.isTransferWindowOpen()
      return Response.success(reply, { isOpen }, 'Transfer window status fetched')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error checking transfer window status',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findBySeasonHalfId(req: FastifyRequest<{ Params: { seasonHalfId: string } }>, reply: FastifyReply) {
    const { seasonHalfId } = req.params

    try {
      const validId = Validator.uuid(seasonHalfId)
      const windows = await this.transferWindowService.findBySeasonHalfId(validId)
      const dtos = TransferWindowMapper.toDTOArray(windows ?? [])

      return Response.success(reply, dtos, 'Transfer windows fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching transfer windows',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async create(
    req: FastifyRequest<{
      Body: {
        seasonHalfId: string
        name: string
        startDate: string
        endDate: string
      }
    }>,
    reply: FastifyReply
  ) {
    const { seasonHalfId, name, startDate, endDate } = req.body

    try {
      const input: CreateTransferWindowInput = {
        seasonHalfId: Validator.uuid(seasonHalfId),
        name: Validator.string(name, 1, 200),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }

      const newWindow = await this.transferWindowService.createTransferWindow(input)
      const dto = TransferWindowMapper.toDTO(newWindow)

      return Response.created(reply, dto, 'Transfer window created successfully')
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return Response.notFound(reply, 'Season half', seasonHalfId)
      }
      if (error.message.includes('dates')) {
        return Response.validation(reply, error.message, 'Invalid dates')
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating transfer window',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async open(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const openedWindow = await this.transferWindowService.openTransferWindow(validId)
      const dto = TransferWindowMapper.toDTO(openedWindow)

      return Response.success(reply, dto, 'Transfer window opened successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer window', id)
      }
      if (error instanceof Error && error.message.includes('already')) {
        return Response.validation(reply, error.message, 'Cannot open window')
      }
      return Response.error(
        reply,
        'OPEN_ERROR',
        'Error while opening transfer window',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async close(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const closedWindow = await this.transferWindowService.closeTransferWindow(validId)
      const dto = TransferWindowMapper.toDTO(closedWindow)

      return Response.success(reply, dto, 'Transfer window closed successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer window', id)
      }
      return Response.error(
        reply,
        'CLOSE_ERROR',
        'Error while closing transfer window',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(
    req: FastifyRequest<{
      Params: { id: string }
      Body: { name?: string; startDate?: string; endDate?: string }
    }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const data = req.body

    try {
      const validId = Validator.uuid(id)
      const updateData: any = {}

      if (data.name) updateData.name = Validator.string(data.name, 1, 200)
      if (data.startDate) updateData.startDate = new Date(data.startDate)
      if (data.endDate) updateData.endDate = new Date(data.endDate)

      const updatedWindow = await this.transferWindowService.updateTransferWindow(validId, updateData)
      const dto = TransferWindowMapper.toDTO(updatedWindow)

      return Response.success(reply, dto, 'Transfer window updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer window', id)
      }
      if (error instanceof Error && error.message.includes('dates')) {
        return Response.validation(reply, error.message, 'Invalid dates')
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating transfer window',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.transferWindowService.deleteTransferWindow(validId)

      return Response.success(reply, null, 'Transfer window deleted successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Transfer window', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting transfer window',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
