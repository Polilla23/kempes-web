import { FastifyInstance } from 'fastify'

export const seasonDeadlineRoutes = async (fastify: FastifyInstance) => {
  const seasonDeadlineController = (fastify as any).container.resolve('seasonDeadlineController')

  fastify.get('/season/:seasonId', {
    preHandler: [fastify.authenticate],
    handler: seasonDeadlineController.findBySeasonId.bind(seasonDeadlineController),
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate],
    handler: seasonDeadlineController.create.bind(seasonDeadlineController),
  })

  fastify.post('/bulk', {
    preHandler: [fastify.authenticate],
    handler: seasonDeadlineController.bulkCreate.bind(seasonDeadlineController),
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    handler: seasonDeadlineController.update.bind(seasonDeadlineController),
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    handler: seasonDeadlineController.delete.bind(seasonDeadlineController),
  })

  fastify.patch('/:id/toggle', {
    preHandler: [fastify.authenticate],
    handler: seasonDeadlineController.toggleCompleted.bind(seasonDeadlineController),
  })
}
