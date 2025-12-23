import { FastifyRequest, FastifyReply } from 'fastify'
import { FixtureService } from '@/features/fixtures/fixtures.service'
import { Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { KnockoutFixtureInput, LeagueFixtureInput, GroupStageFixtureInput, FinishMatchInput } from '@/types'

export class FixtureController {
  constructor(private fixtureService: FixtureService) {}

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
      const result = await this.fixtureService.getCompetitionMatches(validatedCompetitionId)
      return Response.success(reply, result, 'Competition matches fetched successfully')
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
      const result = await this.fixtureService.getKnockoutBracket(validatedCompetitionId)
      return Response.success(reply, result, 'Knockout bracket fetched successfully')
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
}
