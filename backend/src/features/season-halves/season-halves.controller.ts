import { FastifyRequest, FastifyReply } from 'fastify'
import { SeasonHalfService } from '@/features/season-halves/season-halves.service'
import { SeasonHalfMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class SeasonHalfController {
  private seasonHalfService: SeasonHalfService

  constructor({ seasonHalfService }: { seasonHalfService: SeasonHalfService }) {
    this.seasonHalfService = seasonHalfService
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const seasonHalves = await this.seasonHalfService.findAllSeasonHalves()
      const seasonHalfDTOs = SeasonHalfMapper.toDTOArray(seasonHalves ?? [])

      if (seasonHalfDTOs.length === 0) {
        return Response.success(reply, [], 'No season halves found')
      }

      return Response.success(reply, seasonHalfDTOs, 'Season halves fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season halves',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const seasonHalf = await this.seasonHalfService.findSeasonHalf(validId)
      const seasonHalfDTO = SeasonHalfMapper.toDTO(seasonHalf)

      return Response.success(reply, seasonHalfDTO, 'Season half fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season half', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season half',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findActive(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const activeHalf = await this.seasonHalfService.findActiveSeasonHalf()
      const seasonHalfDTO = SeasonHalfMapper.toDTO(activeHalf)

      return Response.success(reply, seasonHalfDTO, 'Active season half fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('No active')) {
        return Response.notFound(reply, 'Active season half', '')
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching active season half',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findBySeasonId(req: FastifyRequest<{ Params: { seasonId: string } }>, reply: FastifyReply) {
    const { seasonId } = req.params

    try {
      const validSeasonId = Validator.uuid(seasonId)
      const seasonHalves = await this.seasonHalfService.findBySeasonId(validSeasonId)
      const seasonHalfDTOs = SeasonHalfMapper.toDTOArray(seasonHalves ?? [])

      return Response.success(reply, seasonHalfDTOs, 'Season halves fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season halves',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async create(req: FastifyRequest<{ Body: { seasonId: string } }>, reply: FastifyReply) {
    const { seasonId } = req.body

    try {
      const validSeasonId = Validator.uuid(seasonId)
      const newSeasonHalves = await this.seasonHalfService.createSeasonHalves(validSeasonId)
      const seasonHalfDTOs = SeasonHalfMapper.toDTOArray(newSeasonHalves ?? [])

      return Response.created(reply, seasonHalfDTOs, 'Season halves created successfully')
    } catch (error: any) {
      if (error.message.includes('already exist')) {
        return Response.validation(reply, error.message, 'Season halves already exist')
      }
      return Response.error(
        reply,
        'CREATE_ERROR',
        'Error while creating season halves',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async activate(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const activatedHalf = await this.seasonHalfService.activateSeasonHalf(validId)
      const seasonHalfDTO = SeasonHalfMapper.toDTO(activatedHalf)

      return Response.success(reply, seasonHalfDTO, 'Season half activated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season half', id)
      }
      return Response.error(
        reply,
        'ACTIVATE_ERROR',
        'Error while activating season half',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async advance(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const nextHalf = await this.seasonHalfService.advanceToNextHalf()
      const seasonHalfDTO = SeasonHalfMapper.toDTO(nextHalf)

      return Response.success(reply, seasonHalfDTO, 'Advanced to next season half successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('No active')) {
        return Response.notFound(reply, 'Active season half', '')
      }
      return Response.error(
        reply,
        'ADVANCE_ERROR',
        'Error while advancing to next season half',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(
    req: FastifyRequest<{
      Params: { id: string }
      Body: { startDate?: string; endDate?: string }
    }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const data = req.body

    try {
      const validId = Validator.uuid(id)
      const updateData: any = {}

      if (data.startDate) updateData.startDate = new Date(data.startDate)
      if (data.endDate) updateData.endDate = new Date(data.endDate)

      const updatedSeasonHalf = await this.seasonHalfService.updateSeasonHalf(validId, updateData)
      const seasonHalfDTO = SeasonHalfMapper.toDTO(updatedSeasonHalf)

      return Response.success(reply, seasonHalfDTO, 'Season half updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season half', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating season half',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.seasonHalfService.deleteSeasonHalf(validId)

      return Response.success(reply, null, 'Season half deleted successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season half', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting season half',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
