import { FastifyInstance } from 'fastify'
import { seasonsSchemas } from '@/features/seasons/seasons.schemas'

export const seasonRoutes = async (fastify: FastifyInstance) => {
  const seasonController = (fastify as any).container.resolve('seasonController')

  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: seasonsSchemas.create,
    handler: seasonController.create.bind(seasonController),
  })

  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: seasonsSchemas.findAll,
    handler: seasonController.findAll.bind(seasonController),
  })

  fastify.get('/active', {
    preHandler: [fastify.authenticate],
    schema: seasonsSchemas.findActive,
    handler: seasonController.findActive.bind(seasonController),
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: seasonsSchemas.findOne,
    handler: seasonController.findOne.bind(seasonController),
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: seasonsSchemas.update,
    handler: seasonController.update.bind(seasonController),
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: seasonsSchemas.delete,
    handler: seasonController.delete.bind(seasonController),
  })
}
