import { FastifyRequest, FastifyReply } from 'fastify'
import { FixtureService } from '@/features/fixtures/fixtures.service'
import { Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { KnockoutFixtureInput, LeagueFixtureInput, GroupStageFixtureInput, FinishMatchInput } from '@/types'
import { MatchMapper } from '@/mappers'

export class FixtureController {
  private fixtureService: FixtureService

  constructor({ fixtureService }: { fixtureService: FixtureService }) {
    this.fixtureService = fixtureService
  }

  async createKnockoutFixture(req: FastifyRequest<{ Body: KnockoutFixtureInput }>, reply: FastifyReply) {
    try {
      const validatedKnockoutFixtureInput = {
        ...req.body,
        competitionId: Validator.uuid(req.body.competitionId),
      }
      const result = await this.fixtureService.createKnockoutFixture(validatedKnockoutFixtureInput)
      return Response.created(reply, result, 'Knockout fixture created successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'FIXTURE_CREATE_ERROR',
        'Failed to create knockout fixture',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async createGroupStageFixture(req: FastifyRequest<{ Body: GroupStageFixtureInput }>, reply: FastifyReply) {
    try {
      const validatedGroupStageFixtureInput = {
        ...req.body,
        competitionId: Validator.uuid(req.body.competitionId),
      }
      const result = await this.fixtureService.createGroupStageFixtures(validatedGroupStageFixtureInput)
      return Response.created(reply, result, 'Group stage fixtures created successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'FIXTURE_CREATE_ERROR',
        'Failed to create group stage fixtures',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async createLeagueFixture(req: FastifyRequest<{ Body: LeagueFixtureInput }>, reply: FastifyReply) {
    try {
      const validatedLeagueFixtureInput = {
        ...req.body,
        competitionId: Validator.uuid(req.body.competitionId),
      }
      const result = await this.fixtureService.createLeagueFixture(validatedLeagueFixtureInput)
      return Response.created(reply, result, 'League fixture created successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'FIXTURE_CREATE_ERROR',
        'Failed to create league fixture',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async finishMatch(
    req: FastifyRequest<{
      Params: { matchId: string }
      Body: Omit<FinishMatchInput, 'matchId'>
    }>,
    reply: FastifyReply
  ) {
    const { matchId } = req.params
    try {
      const validatedMatchId = Validator.uuid(matchId)
      const result = await this.fixtureService.finishMatch({
        matchId: validatedMatchId,
        ...req.body,
      })
      return Response.success(reply, result, 'Match finished successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'MATCH_FINISH_ERROR',
        'Failed to finish match',
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

  async getMatchById(req: FastifyRequest<{ Params: { matchId: string } }>, reply: FastifyReply) {
    const { matchId } = req.params

    try {
      const validatedMatchId = Validator.uuid(matchId)
      const result = await this.fixtureService.getMatchById(validatedMatchId)

      if (!result) {
        return Response.notFound(reply, 'Match', matchId)
      }

      return Response.success(reply, result, 'Match fetched successfully')
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'Match', matchId)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Failed to retrieve match',
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

  async generateMatchCovids(req: FastifyRequest<{ Params: { matchId: string } }>, reply: FastifyReply) {
    const { matchId } = req.params

    try {
      const validatedMatchId = Validator.uuid(matchId)
      
      // Obtener el match para sacar los clubIds
      const match = await this.fixtureService.getMatchById(validatedMatchId)
      
      if (!match.homeClubId || !match.awayClubId) {
        return Response.error(reply, 'INVALID_MATCH', 'Match must have both home and away clubs assigned', 400)
      }
      
      const result = await this.fixtureService.generateMatchCovids(
        validatedMatchId,
        match.homeClubId,
        match.awayClubId
      )
      return Response.success(reply, result, 'Match COVIDs generated successfully')
    } catch (error: any) {
      return Response.error(
        reply,
        'COVID_GENERATION_ERROR',
        'Failed to generate match COVIDs',
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
}
