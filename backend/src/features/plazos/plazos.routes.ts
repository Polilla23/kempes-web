import { FastifyInstance } from 'fastify'

export const plazoRoutes = async (fastify: FastifyInstance) => {
  const plazoController = (fastify as any).container.resolve('plazoController')

  // Read routes (authenticated)
  fastify.get('/season-half/:seasonHalfId', {
    preHandler: [fastify.authenticate],
    handler: plazoController.getBySeasonHalf.bind(plazoController),
  })

  fastify.get('/season/:seasonId', {
    preHandler: [fastify.authenticate],
    handler: plazoController.getBySeason.bind(plazoController),
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    handler: plazoController.getById.bind(plazoController),
  })

  fastify.get('/season/:seasonId/overdue-report', {
    preHandler: [fastify.authenticate],
    handler: plazoController.getOverdueReport.bind(plazoController),
  })

  // Write routes (admin)
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    handler: plazoController.create.bind(plazoController),
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    handler: plazoController.update.bind(plazoController),
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    handler: plazoController.delete.bind(plazoController),
  })

  fastify.patch('/:id/toggle', {
    preHandler: [fastify.authenticate],
    handler: plazoController.toggleOpen.bind(plazoController),
  })

  fastify.post('/season-half/:seasonHalfId/reassign', {
    preHandler: [fastify.authenticate],
    handler: plazoController.reassignAll.bind(plazoController),
  })
}
