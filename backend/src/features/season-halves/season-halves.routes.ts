import { FastifyInstance } from 'fastify'
import { seasonHalvesSchemas } from '@/features/season-halves/season-halves.schema'

export const seasonHalfRoutes = async (fastify: FastifyInstance) => {
  const seasonHalfController = (fastify as any).container.resolve('seasonHalfController')

  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.findAll,
    handler: seasonHalfController.findAll.bind(seasonHalfController),
  })

  fastify.get('/active', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.findActive,
    handler: seasonHalfController.findActive.bind(seasonHalfController),
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.findOne,
    handler: seasonHalfController.findOne.bind(seasonHalfController),
  })

  fastify.get('/season/:seasonId', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.findBySeasonId,
    handler: seasonHalfController.findBySeasonId.bind(seasonHalfController),
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.create,
    handler: seasonHalfController.create.bind(seasonHalfController),
  })

  fastify.patch('/:id/activate', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.activate,
    handler: seasonHalfController.activate.bind(seasonHalfController),
  })

  fastify.post('/advance', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.advance,
    handler: seasonHalfController.advance.bind(seasonHalfController),
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.update,
    handler: seasonHalfController.update.bind(seasonHalfController),
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: seasonHalvesSchemas.delete,
    handler: seasonHalfController.delete.bind(seasonHalfController),
  })
}
