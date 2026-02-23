import { FastifyRequest, FastifyReply } from 'fastify'
import { CompetitionService } from '@/features/competitions/competitions.service'
import { CompetitionMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { KempesCupRules, LeaguesRules, CompetitionRules } from '@/types'
import { CompetitionDTO } from '@/types'
import { BracketTeamPlacement } from '@/features/utils/generateFixture'

export class CompetitionController {
  private competitionService: CompetitionService

  constructor({ competitionService }: { competitionService: CompetitionService }) {
    this.competitionService = competitionService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = req.body as any
    const config = body.rules || body

    try {
      const result = await this.competitionService.createCompetition(config)

      if (!result || !result.success) {
        return Response.error(reply, 'CREATION_ERROR', 'Error while creating the competition', 500)
      }

      // Enriquecer competitions con competitionType data
      const enrichedCompetitions = await Promise.all(
        result.competitions.map(async (comp) => {
          const competitionType = await this.competitionService['competitionTypeRepository'].findOneById(
            comp.competitionTypeId
          )

          if (!competitionType) {
            console.warn(`CompetitionType not found for competition ${comp.id} with typeId: ${comp.competitionTypeId}`)
          }

          return {
            competition: comp,
            competitionTypeData: competitionType
              ? {
                  id: competitionType.id,
                  name: competitionType.name.toString(),
                  category: competitionType.category?.toString() || 'MIXED',
                  format: competitionType.format.toString(),
                  hierarchy: competitionType.hierarchy,
                }
              : null,
          }
        })
      )

      const competitionDTOs = enrichedCompetitions
        .map((enriched) => {
          if (!enriched.competitionTypeData) {
            console.warn(`Competition ${enriched.competition.id} (${enriched.competition.name}) has no competitionType data - using defaults`)
            return CompetitionMapper.toDTO(enriched.competition, {
              id: enriched.competition.competitionTypeId,
              name: 'UNKNOWN',
              category: 'MIXED',
              format: 'CUP',
              hierarchy: 999,
            })
          }
          return CompetitionMapper.toDTO(enriched.competition, enriched.competitionTypeData)
        })

      // Preparar respuesta completa
      const responseData = {
        competitions: competitionDTOs,
        fixtures: result.fixtures.map((f) => ({
          competitionId: f.competition.id,
          competitionName: f.competition.name,
          matchesCreated: f.matchesCreated,
          totalMatches: f.matches.length,
        })),
      }

      return Response.created(reply, responseData, 'Competitions and fixtures created successfully')
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

      const competitionDTOs = enrichedCompetitions
        .map((enriched) => {
          if (!enriched.competitionTypeData) {
            console.warn(`Competition ${enriched.competition.id} (${enriched.competition.name}) has no competitionType data - using defaults`)
            // Provide default competitionType data for competitions without type
            return CompetitionMapper.toDTO(enriched.competition, {
              id: enriched.competition.competitionTypeId,
              name: 'UNKNOWN',
              category: 'UNKNOWN',
              format: 'UNKNOWN',
              hierarchy: 999,
            })
          }
          return CompetitionMapper.toDTO(enriched.competition, enriched.competitionTypeData)
        })

      return Response.success(reply, competitionDTOs, 'Competitions fetched successfully')
    } catch (error) {
      console.error('Error in findAll competitions:', error)
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
      Body: CompetitionRules
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

  /**
   * Obtiene la estructura vacía de un bracket para mostrar en el frontend
   * GET /competitions/bracket-structure?teamCount=6
   */
  async getBracketStructure(
    req: FastifyRequest<{ Querystring: { teamCount: string } }>,
    reply: FastifyReply
  ) {
    try {
      const teamCount = parseInt(req.query.teamCount, 10)

      if (isNaN(teamCount) || teamCount < 2 || teamCount > 64) {
        return Response.validation(reply, 'teamCount must be a number between 2 and 64', 'Invalid team count')
      }

      const structure = this.competitionService.getBracketStructure(teamCount)
      return Response.success(reply, structure, 'Bracket structure generated successfully')
    } catch (error) {
      return Response.error(
        reply,
        'GENERATION_ERROR',
        'Error generating bracket structure',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * Crea una Supercopa con posicionamiento manual de equipos
   * POST /competitions/supercup
   */
  async createSupercup(
    req: FastifyRequest<{
      Body: {
        seasonId: string
        competitionTypeId: string
        teamPlacements: BracketTeamPlacement[]
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { seasonId, competitionTypeId, teamPlacements } = req.body

      const validSeasonId = Validator.uuid(seasonId)
      const validCompetitionTypeId = Validator.uuid(competitionTypeId)

      if (!teamPlacements || !Array.isArray(teamPlacements)) {
        return Response.validation(reply, 'teamPlacements is required and must be an array', 'Invalid input')
      }

      const result = await this.competitionService.createSupercupWithPlacements({
        seasonId: validSeasonId,
        competitionTypeId: validCompetitionTypeId,
        teamPlacements,
      })

      // Enriquecer y mapear respuesta
      const enrichedCompetitions = await Promise.all(
        result.competitions.map(async (comp) => {
          const competitionType = await this.competitionService['competitionTypeRepository'].findOneById(
            comp.competitionTypeId
          )
          return {
            competition: comp,
            competitionTypeData: competitionType
              ? {
                  id: competitionType.id,
                  name: competitionType.name.toString(),
                  category: competitionType.category?.toString() || 'MIXED',
                  format: competitionType.format.toString(),
                  hierarchy: competitionType.hierarchy,
                }
              : null,
          }
        })
      )

      const competitionDTOs = enrichedCompetitions.map((enriched) =>
        CompetitionMapper.toDTO(enriched.competition, enriched.competitionTypeData || {
          id: enriched.competition.competitionTypeId,
          name: 'SUPER_CUP',
          category: 'MIXED',
          format: 'CUP',
          hierarchy: 1,
        })
      )

      const responseData = {
        competitions: competitionDTOs,
        fixtures: result.fixtures.map((f) => ({
          competitionId: f.competition.id,
          competitionName: f.competition.name,
          matchesCreated: f.matchesCreated,
          totalMatches: f.matches.length,
        })),
      }

      return Response.created(reply, responseData, 'Supercup created successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATION_ERROR',
        error instanceof Error ? error.message : 'Error creating Supercup',
        500
      )
    }
  }

  /**
   * Crea una Copa Cindor con posicionamiento manual de equipos
   * POST /competitions/cindor
   */
  async createCindor(
    req: FastifyRequest<{
      Body: {
        seasonId: string
        competitionTypeId: string
        teamPlacements: BracketTeamPlacement[]
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { seasonId, competitionTypeId, teamPlacements } = req.body

      const validSeasonId = Validator.uuid(seasonId)
      const validCompetitionTypeId = Validator.uuid(competitionTypeId)

      if (!teamPlacements || !Array.isArray(teamPlacements)) {
        return Response.validation(reply, 'teamPlacements is required and must be an array', 'Invalid input')
      }

      const result = await this.competitionService.createCindorWithPlacements({
        seasonId: validSeasonId,
        competitionTypeId: validCompetitionTypeId,
        teamPlacements,
      })

      // Enriquecer y mapear respuesta
      const enrichedCompetitions = await Promise.all(
        result.competitions.map(async (comp) => {
          const competitionType = await this.competitionService['competitionTypeRepository'].findOneById(
            comp.competitionTypeId
          )
          return {
            competition: comp,
            competitionTypeData: competitionType
              ? {
                  id: competitionType.id,
                  name: competitionType.name.toString(),
                  category: competitionType.category?.toString() || 'KEMPESITA',
                  format: competitionType.format.toString(),
                  hierarchy: competitionType.hierarchy,
                }
              : null,
          }
        })
      )

      const competitionDTOs = enrichedCompetitions.map((enriched) =>
        CompetitionMapper.toDTO(enriched.competition, enriched.competitionTypeData || {
          id: enriched.competition.competitionTypeId,
          name: 'CINDOR_CUP',
          category: 'KEMPESITA',
          format: 'CUP',
          hierarchy: 1,
        })
      )

      const responseData = {
        competitions: competitionDTOs,
        fixtures: result.fixtures.map((f) => ({
          competitionId: f.competition.id,
          competitionName: f.competition.name,
          matchesCreated: f.matchesCreated,
          totalMatches: f.matches.length,
        })),
      }

      return Response.created(reply, responseData, 'Copa Cindor created successfully')
    } catch (error) {
      return Response.error(
        reply,
        'CREATION_ERROR',
        error instanceof Error ? error.message : 'Error creating Copa Cindor',
        500
      )
    }
  }
}
