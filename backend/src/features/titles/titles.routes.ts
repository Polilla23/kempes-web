import { FastifyInstance } from 'fastify'
import { titlesSchemas } from '@/features/titles/titles.schema'

export const titleRoutes = async (fastify: FastifyInstance) => {
  const titleController = (fastify as any).container.resolve('titleController')

  // Public ranking + champions endpoints (authenticated users)
  fastify.get('/ranking', {
    preHandler: [fastify.authenticate],
    schema: titlesSchemas.ranking,
    handler: titleController.getGlobalRanking.bind(titleController),
  })

  fastify.get('/by-season', {
    preHandler: [fastify.authenticate],
    schema: titlesSchemas.bySeasonAll,
    handler: titleController.getSeasonChampions.bind(titleController),
  })

  fastify.get('/by-season/:seasonNumber', {
    preHandler: [fastify.authenticate],
    schema: titlesSchemas.bySeasonNumber,
    handler: titleController.getSeasonChampionsByNumber.bind(titleController),
  })

  fastify.get('/by-competition/:competitionName', {
    preHandler: [fastify.authenticate],
    schema: titlesSchemas.byCompetition,
    handler: titleController.getCompetitionChampions.bind(titleController),
  })

  // Admin endpoints for point config
  fastify.get('/point-configs', {
    preHandler: [fastify.authenticate],
    schema: titlesSchemas.pointConfigs,
    handler: titleController.getPointConfigs.bind(titleController),
  })

  fastify.put('/point-configs/:id', {
    preHandler: [fastify.authenticate],
    schema: titlesSchemas.updatePointConfig,
    handler: titleController.updatePointConfig.bind(titleController),
  })
}
