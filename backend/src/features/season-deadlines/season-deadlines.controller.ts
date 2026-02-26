import { FastifyRequest, FastifyReply } from 'fastify'
import { SeasonDeadlineService } from '@/features/season-deadlines/season-deadlines.service'
import { Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { DeadlineType } from '@prisma/client'

export class SeasonDeadlineController {
  private seasonDeadlineService: SeasonDeadlineService

  constructor({ seasonDeadlineService }: { seasonDeadlineService: SeasonDeadlineService }) {
    this.seasonDeadlineService = seasonDeadlineService
  }

  async findBySeasonId(req: FastifyRequest<{ Params: { seasonId: string } }>, reply: FastifyReply) {
    const { seasonId } = req.params

    try {
      const validSeasonId = Validator.uuid(seasonId)
      const deadlines = await this.seasonDeadlineService.findBySeasonId(validSeasonId)

      return Response.success(reply, deadlines, 'Season deadlines fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season deadlines',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async create(
    req: FastifyRequest<{
      Body: {
        seasonId: string
        type: DeadlineType
        title: string
        description?: string
        date: string
      }
    }>,
    reply: FastifyReply
  ) {
    const { seasonId, type, title, description, date } = req.body

    try {
      const deadline = await this.seasonDeadlineService.create({
        seasonId,
        type,
        title,
        description,
        date,
      })

      return Response.created(reply, deadline, 'Season deadline created successfully')
    } catch (error: any) {
      if (error.message.includes('Invalid')) {
        return Response.validation(reply, error.message, 'Validation error')
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating season deadline',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async bulkCreate(
    req: FastifyRequest<{
      Body: {
        seasonId: string
        deadlines: Array<{
          type: DeadlineType
          title: string
          description?: string
          date: string
        }>
      }
    }>,
    reply: FastifyReply
  ) {
    const { seasonId, deadlines } = req.body

    try {
      const result = await this.seasonDeadlineService.bulkCreate(seasonId, deadlines)

      return Response.created(reply, { count: result.count }, `${result.count} deadlines created successfully`)
    } catch (error: any) {
      if (error.message.includes('Invalid')) {
        return Response.validation(reply, error.message, 'Validation error')
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating season deadlines',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(
    req: FastifyRequest<{
      Params: { id: string }
      Body: {
        title?: string
        description?: string
        date?: string
        isCompleted?: boolean
      }
    }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const data = req.body

    try {
      const deadline = await this.seasonDeadlineService.update(id, data)

      return Response.success(reply, deadline, 'Season deadline updated successfully')
    } catch (error: any) {
      if (error.name === 'SeasonDeadlineNotFoundError') {
        return Response.notFound(reply, 'Season deadline', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating season deadline',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      await this.seasonDeadlineService.delete(id)

      return Response.success(reply, null, 'Season deadline deleted successfully')
    } catch (error: any) {
      if (error.name === 'SeasonDeadlineNotFoundError') {
        return Response.notFound(reply, 'Season deadline', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting season deadline',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async toggleCompleted(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const deadline = await this.seasonDeadlineService.toggleCompleted(id)

      return Response.success(reply, deadline, 'Season deadline toggled successfully')
    } catch (error: any) {
      if (error.name === 'SeasonDeadlineNotFoundError') {
        return Response.notFound(reply, 'Season deadline', id)
      }
      return Response.error(
        reply,
        'TOGGLE_ERROR',
        'Error while toggling season deadline',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
