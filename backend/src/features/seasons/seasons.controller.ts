import { FastifyRequest, FastifyReply } from 'fastify'
import { CompetitionCategory } from '@prisma/client'
import { SeasonService } from '@/features/seasons/seasons.service'
import { StandingsService } from '@/features/seasons/standings.service'
import { SeasonMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class SeasonController {
  private seasonService: SeasonService
  private standingsService: StandingsService

  constructor({ seasonService, standingsService }: { seasonService: SeasonService; standingsService: StandingsService }) {
    this.seasonService = seasonService
    this.standingsService = standingsService
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

  async update(req: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
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

  async getMovements(
    req: FastifyRequest<{ Params: { seasonNumber: string }; Querystring: { category?: string } }>,
    reply: FastifyReply
  ) {
    const { seasonNumber } = req.params
    const { category } = req.query as { category?: string }

    try {
      const validNumber = Validator.number(parseInt(seasonNumber), 1)

      if (category && !Object.values(CompetitionCategory).includes(category as CompetitionCategory)) {
        return Response.error(reply, 'VALIDATION_ERROR', `Invalid category: ${category}`, 400)
      }

      const movements = await this.seasonService.getSeasonMovements(validNumber, category)

      return Response.success(
        reply,
        movements,
        `Movements for season ${validNumber} fetched successfully`
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Season', seasonNumber)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season movements',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async advanceSeason(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.seasonService.advanceSeason()

      return Response.success(
        reply,
        {
          previousSeasonNumber: result.previousSeason.number,
          newSeasonNumber: result.newSeason.number,
          totalMovements: result.movements.length,
          movements: result.movements,
        },
        'Season advanced successfully'
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.error(reply, 'NOT_FOUND', 'No active season found', 404)
      }
      if (error instanceof Error && error.message.includes('pending')) {
        return Response.error(
          reply,
          'VALIDATION_ERROR',
          error.message,
          400
        )
      }
      return Response.error(
        reply,
        'ADVANCE_ERROR',
        'Error while advancing season',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ============================================
  // WIZARD DE AVANCE — 4 PASOS DISCRETOS
  // ============================================

  async verifyCompetitions(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.seasonService.verifyCompetitions()

      return Response.success(reply, result, 'Competitions verified successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.error(reply, 'NOT_FOUND', 'No active season found', 404)
      }
      return Response.error(
        reply,
        'VERIFY_ERROR',
        'Error while verifying competitions',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async previewMovements(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.seasonService.previewMovements()

      return Response.success(reply, result, 'Movements preview generated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.error(reply, 'NOT_FOUND', 'No active season found', 404)
      }
      return Response.error(
        reply,
        'PREVIEW_ERROR',
        'Error while previewing movements',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async saveSeasonHistory(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.seasonService.saveSeasonHistory()

      return Response.success(
        reply,
        result,
        result.alreadyExisted
          ? 'Season history already saved'
          : 'Season history saved successfully'
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.error(reply, 'NOT_FOUND', 'No active season found', 404)
      }
      return Response.error(
        reply,
        'SAVE_HISTORY_ERROR',
        'Error while saving season history',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async createNextSeason(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await this.seasonService.createNextSeason()

      return Response.success(
        reply,
        {
          previousSeason: { id: result.previousSeason.id, number: result.previousSeason.number },
          newSeason: { id: result.newSeason.id, number: result.newSeason.number },
        },
        `Season ${result.newSeason.number} created successfully`
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.error(reply, 'NOT_FOUND', 'No active season found', 404)
      }
      if (error instanceof Error && error.message.includes('Must save')) {
        return Response.error(reply, 'VALIDATION_ERROR', error.message, 400)
      }
      return Response.error(
        reply,
        'CREATE_NEXT_ERROR',
        'Error while creating next season',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ============================================
  // COEFKEMPES RANKING
  // ============================================

  async getCoefKempesRanking(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const ranking = await this.standingsService.getCoefKempesRanking()

      return Response.success(reply, ranking, 'CoefKempes ranking fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching CoefKempes ranking',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
