import { FastifyRequest, FastifyReply } from 'fastify'
import { FixtureService } from '@/features/fixtures/fixtures.service'
import { StandingsService } from '@/features/seasons/standings.service'
import { Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { MatchMapper } from '@/mappers'

export class FixtureController {
  private fixtureService: FixtureService
  private standingsService: StandingsService

  constructor({ fixtureService, standingsService }: { fixtureService: FixtureService; standingsService: StandingsService }) {
    this.fixtureService = fixtureService
    this.standingsService = standingsService
  }

  /**
   * Crea fixture de eliminación directa para Copa Cindor y Supercopa
   * Los equipos se asignan directamente (no hay placeholders de grupos)
   */
  async createDirectKnockoutFixture(
    req: FastifyRequest<{ Body: { competitionId: string; teamIds: string[] } }>,
    reply: FastifyReply
  ) {
    try {
      const { competitionId, teamIds } = req.body

      if (!competitionId || !teamIds || !Array.isArray(teamIds)) {
        return Response.validation(reply, 'Missing required fields: competitionId and teamIds array', 'Validation error')
      }

      if (teamIds.length < 2) {
        return Response.validation(reply, 'At least 2 teams are required for a knockout bracket', 'Validation error')
      }

      const validatedInput = {
        competitionId: Validator.uuid(competitionId),
        teamIds: teamIds.map(id => Validator.uuid(id)),
      }

      const result = await this.fixtureService.createDirectKnockoutFixture(validatedInput)
      return Response.created(reply, result, 'Direct knockout fixture created successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'FIXTURE_CREATE_ERROR',
        'Failed to create direct knockout fixture',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getCompetitionMatches(
    req: FastifyRequest<{ Params: { competitionId: string } }>,
    reply: FastifyReply
  ) {
    const { competitionId } = req.params

    try {
      const validatedCompetitionId = Validator.uuid(competitionId)
      const matches = await this.fixtureService.getCompetitionMatches(validatedCompetitionId)
      const mappedMatches = MatchMapper.toDTOArray(matches as any)

      return Response.success(reply, mappedMatches, 'Competition matches fetched successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Failed to retrieve competition matches',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getKnockoutBracket(req: FastifyRequest<{ Params: { competitionId: string } }>, reply: FastifyReply) {
    const { competitionId } = req.params

    try {
      const validatedCompetitionId = Validator.uuid(competitionId)
      const matches = await this.fixtureService.getKnockoutBracket(validatedCompetitionId)
      const mappedMatches = MatchMapper.toDTOArray(matches as any)
      return Response.success(reply, mappedMatches, 'Knockout bracket fetched successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Failed to retrieve knockout bracket',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getMatchesWithFilters(
    req: FastifyRequest<{ Querystring: { seasonId?: string; competitionId?: string } }>,
    reply: FastifyReply
  ) {
    const { seasonId, competitionId } = req.query

    try {
      const validatedSeasonId = seasonId ? Validator.uuid(seasonId) : undefined
      const validatedCompetitionId = competitionId ? Validator.uuid(competitionId) : undefined

      const result = await this.fixtureService.getMatchesWithFilters(validatedSeasonId, validatedCompetitionId)
      return Response.success(reply, result, 'Matches fetched successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Failed to retrieve matches',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getMatchCovids(req: FastifyRequest<{ Params: { matchId: string } }>, reply: FastifyReply) {
    const { matchId } = req.params

    try {
      const validatedMatchId = Validator.uuid(matchId)
      const result = await this.fixtureService.getMatchCovids(validatedMatchId)
      return Response.success(reply, result, 'Match COVIDs fetched successfully')
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Match', matchId)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Failed to retrieve match COVIDs',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  // ===================== COPA KEMPES - ORA/PLATA GENERATION =====================

  /**
   * Obtiene el estado de los grupos de una Copa Kempes
   * Verifica si todos los partidos de fase de grupos están finalizados
   */
  async getKempesCupGroupsStatus(
    req: FastifyRequest<{ Params: { competitionId: string } }>,
    reply: FastifyReply
  ) {
    const { competitionId } = req.params

    try {
      const validatedCompetitionId = Validator.uuid(competitionId)
      const result = await this.standingsService.getKempesCupGroupsStatus(validatedCompetitionId)
      return Response.success(reply, result, 'Copa Kempes groups status fetched successfully')
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', competitionId)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Failed to retrieve Copa Kempes groups status',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * Obtiene los equipos clasificados de una Copa Kempes para generar Copa Oro y Copa Plata
   */
  async getKempesCupQualifiedTeams(
    req: FastifyRequest<{ Params: { competitionId: string } }>,
    reply: FastifyReply
  ) {
    const { competitionId } = req.params

    try {
      const validatedCompetitionId = Validator.uuid(competitionId)
      const result = await this.standingsService.getKempesCupQualifiedTeams(validatedCompetitionId)
      return Response.success(reply, result, 'Copa Kempes qualified teams fetched successfully')
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', competitionId)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Failed to retrieve Copa Kempes qualified teams',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * Genera Copa Oro y Copa Plata a partir de los equipos clasificados de Copa Kempes
   * El admin define los cruces manualmente (brackets)
   */
  async generateGoldSilverCups(
    req: FastifyRequest<{
      Body: {
        kempesCupId: string
        goldBrackets: Array<{
          round: number
          position: number
          homeTeamId?: string
          awayTeamId?: string
          isBye?: boolean
        }>
        silverBrackets: Array<{
          round: number
          position: number
          homeTeamId?: string
          awayTeamId?: string
          isBye?: boolean
        }>
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { kempesCupId, goldBrackets, silverBrackets } = req.body

      if (!kempesCupId || !goldBrackets || !silverBrackets) {
        return Response.validation(
          reply,
          'Missing required fields: kempesCupId, goldBrackets, and silverBrackets are required',
          'Validation error'
        )
      }

      const validatedKempesCupId = Validator.uuid(kempesCupId)

      // Verify that groups are complete
      const qualifiedTeams = await this.standingsService.getKempesCupQualifiedTeams(validatedKempesCupId)

      if (!qualifiedTeams.isReady) {
        return Response.error(
          reply,
          'GROUPS_NOT_COMPLETE',
          'Copa Kempes group stage is not complete yet',
          400
        )
      }

      const result = await this.fixtureService.generateGoldSilverCups({
        kempesCupId: validatedKempesCupId,
        goldTeams: qualifiedTeams.goldTeams,
        silverTeams: qualifiedTeams.silverTeams,
        goldBrackets,
        silverBrackets,
      })

      return Response.created(reply, result, 'Copa Oro and Copa Plata generated successfully')
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Competition', req.body?.kempesCupId || 'unknown')
      }
      return Response.error(
        reply,
        'GENERATION_ERROR',
        'Failed to generate Copa Oro and Copa Plata',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
