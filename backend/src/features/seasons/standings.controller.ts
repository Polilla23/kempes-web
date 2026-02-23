import { FastifyRequest, FastifyReply } from 'fastify'
import { StandingsService } from '@/features/seasons/standings.service'
import { Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class StandingsController {
  private standingsService: StandingsService

  constructor({ standingsService }: { standingsService: StandingsService }) {
    this.standingsService = standingsService
  }

  /**
   * GET /standings/competitions/:competitionId
   * Obtiene la tabla de posiciones de una competición
   */
  async getCompetitionStandings(
    req: FastifyRequest<{ Params: { competitionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const competitionId = Validator.uuid(req.params.competitionId)
      const standings = await this.standingsService.calculateStandings(competitionId)
      
      return Response.success(reply, standings, 'Standings fetched successfully')
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', req.params.competitionId)
      }
      return Response.error(
        reply,
        'STANDINGS_ERROR',
        'Error fetching standings',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * GET /standings/competitions/:competitionId/groups
   * Obtiene la tabla de posiciones por grupos de una copa
   */
  async getCupGroupStandings(
    req: FastifyRequest<{ Params: { competitionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const competitionId = Validator.uuid(req.params.competitionId)
      const groupsStatus = await this.standingsService.getKempesCupGroupsStatus(competitionId)

      return Response.success(reply, groupsStatus, 'Cup group standings fetched successfully')
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', req.params.competitionId)
      }
      return Response.error(
        reply,
        'STANDINGS_ERROR',
        'Error fetching cup group standings',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * GET /standings/seasons/:seasonId
   * Obtiene todas las tablas de posiciones de una temporada
   */
  async getSeasonStandings(
    req: FastifyRequest<{ Params: { seasonId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const seasonId = Validator.uuid(req.params.seasonId)
      const allStandings = await this.standingsService.getSeasonStandings(seasonId)
      
      return Response.success(reply, allStandings, 'Season standings fetched successfully')
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return Response.notFound(reply, 'Season', req.params.seasonId)
      }
      return Response.error(
        reply,
        'STANDINGS_ERROR',
        'Error fetching season standings',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
