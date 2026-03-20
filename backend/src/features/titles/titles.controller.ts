import { FastifyRequest, FastifyReply } from 'fastify'
import { CompetitionCategory } from '@prisma/client'
import { TitleService } from './titles.service'
import { Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { InvalidCompetitionNameError, TitlePointConfigNotFoundError } from './titles.errors'

export class TitleController {
  private titleService: TitleService

  constructor({ titleService }: { titleService: TitleService }) {
    this.titleService = titleService
  }

  async getGlobalRanking(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const ranking = await this.titleService.getGlobalRanking()
      return Response.success(reply, ranking, 'Global ranking fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching global ranking',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getSeasonChampions(
    req: FastifyRequest<{ Querystring: { category?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { category } = req.query
      const validCategory = category && Object.values(CompetitionCategory).includes(category as CompetitionCategory)
        ? (category as CompetitionCategory)
        : undefined

      const champions = await this.titleService.getSeasonChampions(validCategory)
      return Response.success(reply, champions, 'Season champions fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season champions',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getSeasonChampionsByNumber(
    req: FastifyRequest<{ Params: { seasonNumber: string } }>,
    reply: FastifyReply
  ) {
    try {
      const seasonNumber = Validator.number(parseInt(req.params.seasonNumber), 1)
      const champions = await this.titleService.getSeasonChampionsByNumber(seasonNumber)

      if (!champions) {
        return Response.success(reply, null, 'No champions found for this season')
      }

      return Response.success(reply, champions, 'Season champions fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season champions',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getCompetitionChampions(
    req: FastifyRequest<{ Params: { competitionName: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { competitionName } = req.params
      const champions = await this.titleService.getCompetitionChampions(competitionName)
      return Response.success(reply, champions, 'Competition champions fetched successfully')
    } catch (error) {
      if (error instanceof InvalidCompetitionNameError) {
        return Response.validation(reply, error.message, 'Invalid competition name')
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching competition champions',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getPointConfigs(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const configs = await this.titleService.getPointConfigs()
      return Response.success(reply, configs, 'Point configs fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching point configs',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async updatePointConfig(
    req: FastifyRequest<{ Params: { id: string }; Body: { points: number } }>,
    reply: FastifyReply
  ) {
    try {
      const validId = Validator.uuid(req.params.id)
      const { points } = req.body
      const validPoints = Validator.number(points, 0, 1000)

      const config = await this.titleService.updatePointConfig(validId, validPoints)
      return Response.success(reply, config, 'Point config updated successfully')
    } catch (error) {
      if (error instanceof TitlePointConfigNotFoundError) {
        return Response.notFound(reply, 'TitlePointConfig', req.params.id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating point config',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
