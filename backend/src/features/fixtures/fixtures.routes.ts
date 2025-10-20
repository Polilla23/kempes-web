import { FastifyInstance } from 'fastify'
import { fixturesSchemas } from '@/features/fixtures/fixtures.schemas'

export const fixtureRoutes = async (fastify: FastifyInstance) => {
  const fixtureController = fastify.container.resolve('fixtureController')

  // POST /fixtures/knockout
  fastify.post('/knockout', {
    preHandler: [fastify.authenticate],
    schema: fixturesSchemas.createKnockout,
    handler: fixtureController.createKnockoutFixture.bind(fixtureController),
  })

  // POST /fixtures/group-stage
  fastify.post('/group-stage', {
    preHandler: [fastify.authenticate],
    schema: fixturesSchemas.createGroupStage,
    handler: fixtureController.createGroupStageFixture.bind(fixtureController),
  })

  // POST /fixtures/league
  fastify.post('/league', {
    preHandler: [fastify.authenticate],
    schema: fixturesSchemas.createLeague,
    handler: fixtureController.createLeagueFixture.bind(fixtureController),
  })

  // POST /fixtures/:matchId/finish
  fastify.post('/:matchId/finish', {
    preHandler: [fastify.authenticate],
    schema: fixturesSchemas.finishMatch,
    handler: fixtureController.finishMatch.bind(fixtureController),
  })

  // GET /fixtures/competitions/:competitionId (nested resource)
  fastify.get('/competitions/:competitionId', {
    preHandler: [fastify.authenticate],
    schema: fixturesSchemas.getCompetitionMatches,
    handler: fixtureController.getCompetitionMatches.bind(fixtureController),
  })

  // GET /fixtures/competitions/:competitionId/knockout (nested sub-resource)
  fastify.get('/competitions/:competitionId/knockout', {
    preHandler: [fastify.authenticate],
    schema: fixturesSchemas.getKnockoutBracket,
    handler: fixtureController.getKnockoutBracket.bind(fixtureController),
  })

  // GET /fixtures/:matchId
  fastify.get('/:matchId', {
    preHandler: [fastify.authenticate],
    schema: fixturesSchemas.getMatchById,
    handler: fixtureController.getMatchById.bind(fixtureController),
  })
}
