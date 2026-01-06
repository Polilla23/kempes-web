import { FastifyRequest, FastifyReply } from 'fastify'
import { SeasonService } from '@/features/seasons/seasons.service'
import { SeasonMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class SeasonController {
  private seasonService: SeasonService

  constructor({ seasonService }: { seasonService: SeasonService }) {
    this.seasonService = seasonService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { number, isActive } = req.body as {
      number: number
      isActive?: boolean
    }

    try {
      const validatedData = {
        number: Validator.number(number, 1),
        ...(isActive !== undefined && { isActive: Validator.boolean(isActive) }),
      }

      const newSeason = await this.seasonService.createSeason(validatedData)
      const seasonDTO = SeasonMapper.toDTO(newSeason)

      return Response.created(reply, seasonDTO, 'Season created successfully')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return Response.error(reply, 'CONFLICT', error.message, 409)
      }
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while creating new season'
      )
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const seasons = await this.seasonService.findAllSeasons()
      const seasonDTOs = SeasonMapper.toDTOArray(seasons ?? [])

      if (seasonDTOs.length === 0) {
        return Response.success(reply, [], 'No seasons found')
      }

      return Response.success(reply, seasonDTOs, 'Seasons fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching seasons',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findActive(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const season = await this.seasonService.findActiveSeason()
      const seasonDTO = SeasonMapper.toDTO(season)

      return Response.success(reply, seasonDTO, 'Active season fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Active season', 'N/A')
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching active season',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const season = await this.seasonService.findSeasonById(validId)
      const seasonDTO = SeasonMapper.toDTO(season)

      return Response.success(reply, seasonDTO, 'Season fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(
    req: FastifyRequest<{ Params: { id: string }; Body: any }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const { number, isActive } = req.body as {
        number?: number
        isActive?: boolean
    }

    try {
      const validId = Validator.uuid(id)
      const validatedData: any = {}

      if (number !== undefined) validatedData.number = Validator.number(number, 1)
      if (isActive !== undefined) validatedData.isActive = Validator.boolean(isActive)

      const updated = await this.seasonService.updateSeason(validId, validatedData)
      const seasonDTO = SeasonMapper.toDTO(updated)

      return Response.success(reply, seasonDTO, 'Season updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season', id)
      }
      if (error instanceof Error && error.message.includes('already exists')) {
        return Response.error(reply, 'CONFLICT', error.message, 409)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating season',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.seasonService.deleteSeason(validId)

      return Response.noContent(reply)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting season',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
