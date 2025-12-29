import { FastifyRequest, FastifyReply } from 'fastify'
import { CompetitionService } from '@/features/competitions/competitions.service'
import { CompetitionMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { KempesCupRules, LeaguesRules } from '@/types'
import { CompetitionDTO } from '@/types'

export class CompetitionController {
  private competitionService: CompetitionService

  constructor({ competitionService }: { competitionService: CompetitionService }) {
    this.competitionService = competitionService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const config = req.body as LeaguesRules | KempesCupRules
    try {
      const newCompetition = await this.competitionService.createCompetition(config)

      if (!newCompetition) {
        return Response.error(reply, 'CREATION_ERROR', 'Error while creating the competition', 500)
      }

      // Extraer información de competitionType del config
      let competitionTypeData
      if ('leagues' in config) {
        // LeaguesRules case
        const league = config.leagues[0]?.active_league
        if (league) {
          competitionTypeData = {
            id: league.id,
            name: league.name,
            category: config.competitionCategory,
            format: league.format
          }
        }
      } else if ('competitionType' in config) {
        // KempesCupRules case
        competitionTypeData = {
          id: config.competitionType.id,
          name: config.competitionType.name,
          category: config.competitionCategory,
          format: config.competitionType.format
        }
      }

      if (!competitionTypeData) {
        return Response.error(reply, 'MISSING_DATA', 'Competition type data not available', 500)
      }

      const competitionDTO = CompetitionMapper.toDTO(newCompetition, competitionTypeData)

      return Response.created(reply, competitionDTO, 'Competition created successfully')
    } catch (error: any) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while creating new competition'
      )
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const enrichedCompetitions = await this.competitionService.findAllCompetitions()
      
      if (!enrichedCompetitions || enrichedCompetitions.length === 0) {
        return Response.success(reply, [], 'No competitions found')
      }

      const competitionDTOs = enrichedCompetitions.map(enriched => 
        CompetitionMapper.toDTO(enriched.competition, enriched.competitionTypeData!)
      )

      return Response.success(reply, competitionDTOs, 'Competitions fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the competitions',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validId = Validator.uuid(id)
      const enrichedCompetition = await this.competitionService.findCompetition(validId)

      if (!enrichedCompetition) {
        return Response.notFound(reply, 'Competition', id)
      }

      const competitionDTO = CompetitionMapper.toDTO(
        enrichedCompetition.competition, 
        enrichedCompetition.competitionTypeData!
      )
      return Response.success(reply, competitionDTO, 'Competition fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', id)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the competition',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      const validId = Validator.uuid(id)
      await this.competitionService.deleteCompetition(validId)
      return Response.noContent(reply)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting the competition',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async update(
    req: FastifyRequest<{
      Params: { id: string }
      Body: Partial<LeaguesRules | KempesCupRules>
    }>,
    reply: FastifyReply
  ) {
    const { id } = req.params
    const data = req.body
    try {
      const validId = Validator.uuid(id)
      const enrichedUpdated = await this.competitionService.updateCompetition(validId, data)
      const updatedDTO = CompetitionMapper.toDTO(
        enrichedUpdated.competition, 
        enrichedUpdated.competitionTypeData!
      )

      return Response.success(reply, updatedDTO, 'Competition updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating the competition',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
