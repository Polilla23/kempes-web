import { FastifyInstance } from 'fastify'
import { fixturesSchemas } from '@/features/fixtures/fixtures.schemas'

export const fixtureRoutes = async (fastify: FastifyInstance) => {
  const fixtureController = fastify.container.resolve('fixtureController')

  // GET /fixtures/my-pending - Partidos pendientes del usuario autenticado
  fastify.get('/my-pending', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.getMyPendingMatches.bind(fixtureController),
  })

  // POST /fixtures/direct-knockout - Para Copa Cindor y Supercopa (eliminación directa con equipos asignados)
  fastify.post('/direct-knockout', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.createDirectKnockoutFixture.bind(fixtureController),
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

  // GET /fixtures (with filters: seasonId, competitionId)
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.getMatchesWithFilters.bind(fixtureController),
  })

  // POST /fixtures/:matchId/submit-result - Subir resultado de un partido
  fastify.post('/:matchId/submit-result', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.submitResult.bind(fixtureController),
  })

  // GET /fixtures/:matchId/covids
  fastify.get('/:matchId/covids', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.getMatchCovids.bind(fixtureController),
  })

  // ===================== COPA KEMPES - ORO/PLATA GENERATION =====================

  // GET /fixtures/kempes/:competitionId/groups-status
  // Obtiene el estado de los grupos de una Copa Kempes (si están completos)
  fastify.get('/kempes/:competitionId/groups-status', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.getKempesCupGroupsStatus.bind(fixtureController),
  })

  // GET /fixtures/kempes/:competitionId/qualified-teams
  // Obtiene los equipos clasificados para Copa Oro y Copa Plata
  fastify.get('/kempes/:competitionId/qualified-teams', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.getKempesCupQualifiedTeams.bind(fixtureController),
  })

  // POST /fixtures/kempes/generate-gold-silver
  // Genera Copa Oro y Copa Plata con los brackets definidos por el admin
  fastify.post('/kempes/generate-gold-silver', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.generateGoldSilverCups.bind(fixtureController),
  })

  // PUT /fixtures/kempes/:competitionId/reassign-groups
  // Reasigna los grupos de una Copa Kempes (solo si no hay partidos jugados)
  fastify.put('/kempes/:competitionId/reassign-groups', {
    preHandler: [fastify.authenticate],
    handler: fixtureController.reassignKempesCupGroups.bind(fixtureController),
  })
}
